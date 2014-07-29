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
  var test = new N.SignalBuilder();
  this.inputSignals.push(test);
  return test;
}
