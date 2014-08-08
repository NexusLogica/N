/**********************************************************************
 
File     : workbench-test.js
Project  : N Simulator Library
Purpose  : Source file for workbench test definition objects.
Revisions: Original definition by Lawrence Gunn.
           2014/07/23

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

var N = N || {};

  //*******************
  //* N.WorkbenchTest *
  //*******************

/**
 * A network object which can contain neurons or child networks.
 * @class Workbench
 * @constructor
 */
N.WorkbenchTest = function(workbench) {
  this.workbench    = workbench;
  this.className    = 'N.WorkbenchTest';
  this.id           = N.GenerateUUID();
  this.name         = '';
  this.description  = '';
  this.duration     = 0.10; // duration of the test in seconds
  this.inputSignals = [];
  this.inputSignalsById = [];
}

/**
 * Adds an input sink to the input network.
 * @method AddInputSignal
 * @returns {N.WorkbenchTest}
 */
N.WorkbenchTest.prototype.insertInputSignal = function(inputSignal) {
  inputSignal.workbenchTest = this;
  this.inputSignals.push(inputSignal);
  this.inputSignalsById[inputSignal.id] = inputSignal;
  return this;
}

/***
 * Usually called when duration changes or a signal is added.
 * @method setAsActiveTest
 */
N.WorkbenchTest.prototype.setAsActiveTest = function() {
  this.updateNetwork();
}

/***
 * Usually called when duration changes or a signal is added.
 * @method updateNetwork
 */
N.WorkbenchTest.prototype.updateNetwork = function() {
  var signal, compartment;
  var unsetSources = _.clone(this.workbench.signalSources);
  var removePath = '';
  var remove = function(path) { return path === removePath; }

  for(var i in this.inputSignals) {
    var inputSignal = this.inputSignals[i];
    inputSignal.duration = this.duration;

    signal = new N.AnalogSignal();
    inputSignal.builder.buildSignal(signal, this.duration);
    compartment = N.FromPath(this.workbench.Network, inputSignal.compartmentPath);
    compartment.SetSignal(inputSignal.outputName, signal);

    removePath = inputSignal.compartmentPath;
    _.remove(unsetSources, remove);
  }

  var flatSignalData = [ {t: 0, v: 0}, {t: this.duration, v: 0} ];
  for(var j in unsetSources) {
    compartment = N.FromPath(this.workbench.Network, unsetSources[j]);
    signal = new N.AnalogSignal();
    signal.appendDataArray(flatSignalData);
    compartment.SetSignal('Main', signal);
  }
}

  //************************
  //* N.WorkbenchTestInput *
  //************************

N.WorkbenchTestInput = function() {
  this.workbenchTest = null;
  this.id = N.GenerateUUID();
  this.connection = ''; // The path
  this.builder = new N.SignalBuilder();
  this.compartmentPath = '';
  this.outputName = ''; // The output name, usually 'Main'.
};

N.WorkbenchTestInput.prototype.clone = function() {
  var copy = new N.WorkbenchTestInput(this.workbenchTest);
  _.assign(copy, _.pick(this, ['id', 'connection', 'workbenchTest', 'compartmentPath', 'outputName']));
  copy.builder = this.builder.clone();
  return copy;
}

