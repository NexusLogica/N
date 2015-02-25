/**********************************************************************

File     : stock-neurons.js
Project  : N Simulator Library
Purpose  : Source file for stock neuron object configurations.
Revisions: Original definition by Lawrence Gunn.
           2014/02/19

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

var N = N || {};
N.NeuronTemplate = N.NeuronTemplate || {};

  //********************************
  //* N.NeuronTemplate.StateOutput *
  //********************************

N.NeuronFactory.StateOutput = {
  Compartments : [{
      className: 'N.Comp.StateOutput',
      input: 'N.Comp.Input'
    }
  ]
}

N.Neuron = function() {
  this.className    = 'N.Neuron';
  this.id           = N.generateUUID();
  this.name         = '';
  this.category     = 'Default';
  this.compartments = [];
}

N.Neuron.prototype.addCompartment = function(compartment) {
  this.compartments.push(compartment);
}

N.Neuron.prototype.getNumCompartments = function() {
  return this.compartments.length;
}

N.Neuron.prototype.toJSON = function() {
  var str = JSON.stringify(this, function(k, v) { return (k === '_finder' ? undefined : v); });
  return str;
}

  //***********************
  //* N.OutputCompartment *
  //***********************

N.OutputCompartment = function() {
  this.className  = 'N.OutputCompartment';
}
