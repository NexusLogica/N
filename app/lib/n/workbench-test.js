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
}

/**
 * Adds an input sink to the input network.
 * @method AddInputSource
 * @returns {N.WorkbenchTest}
 */
N.WorkbenchTest.prototype.addInputSignal = function() {
  var test = new N.WorkbenchTestInput(this);
  this.inputSignals.push(test);
  this.inputSignals[test.id] = test;
  return test;
}

  //************************
  //* N.WorkbenchTestInput *
  //************************

N.WorkbenchTestInput = function(test) {
  this.workbenchTest = test;
  this.id = N.GenerateUUID();
  this.connection = null;
  this.builder = new N.SignalBuilder();
};

N.WorkbenchTestInput.prototype.clone = function() {
  var copy = new N.WorkbenchTestInput(this.workbenchTest);
  _.assign(copy, _.pick(this, ['id', 'connection']));
  copy.builder = this.builder.clone();
  return copy;
}
