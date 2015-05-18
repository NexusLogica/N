/**********************************************************************
 
File     : history.js
Project  : N Simulator Library
Purpose  : Source file for a history object.
Revisions: Original definition by Lawrence Gunn.
           2015/04/05

Copyright (c) 2015 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

var N = N || {};

  //*************
  //* N.History *
  //*************

/**
 * A network object which can contain neurons or child networks.
 * @class Workbench
 * @constructor
 */
N.History = function() {
  this.className  = 'N.History';
  this.id         = N.generateUUID();
  this.inputs     = {};
  this.outputs    = {};
  this.states     = {};
};

/***
 * Add an input object to the system.
 * @method addInput
 * @param input
 */
N.History.prototype.loadFromSystem = function(system) {
  this.system = system;
  this.systemName = system.name;
  this.networkName = system.network.name;

  this.startTime = system.startTime;
  this.endTime = system.endTime;

  for(var i=0; i<system.inputs.length; i++) {
    var input = system.inputs[i];
    this.inputs[input.target] = input.history;
  }
  for(i=0; i<system.outputs.length; i++) {
    var output = system.outputs[i];
    this.outputs[output.target] = output.history;
  }
};

/***
 * Add an input object to the system.
 * @method stringify
 * @param system
 * @return {string} - Stringified in JSON format
 */
N.History.prototype.stringify = function() {
  return JSON.stringify(this, function(k, v) {
    if(k === 'finder') {
      return undefined;
    } else if(_.isArray(v) && (k === 'times' || k === 'values')) {
      return '['+v.join(', ')+']';
    } else {
      return v;
    }
  }, 2);
};

