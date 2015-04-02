/**********************************************************************
 
File     : system.js
Project  : N Simulator Library
Purpose  : Source file for a system object.
Revisions: Original definition by Lawrence Gunn.
           2015/04/01

Copyright (c) 2015 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

var N = N || {};

  //************
  //* N.System *
  //************

/**
 * A network object which can contain neurons or child networks.
 * @class Workbench
 * @constructor
 */
N.System = function() {
  this.className           = 'N.System';
  this.id                  = null;
  this.name                = '';
  this.signalSources       = [];
  this.outputSinks         = [];
};

/**
 * Runs a test.
 * @method runTest
 * @param test
 * @returns {N.SystemTest}
 */
N.System.prototype.runTest = function(test) {
console.log('RUN TEST');
  var network = this.network;
  network.clear();

  var duration = test.duration;
  var inc = N.timeStep;
  var t = 0.0;
  var maxSteps = 100000;
  var breakAfterStep = false;

  for(var i=0; i<maxSteps; i++) {
    network.update(t);
    if(breakAfterStep) {
      break;
    }
    t += inc;
    if(t >= duration) {
      t = duration;
      breakAfterStep = true;
    }
  }
};
