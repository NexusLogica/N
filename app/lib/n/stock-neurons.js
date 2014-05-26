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
      ClassName: 'N.Comp.StateOutput',
      Input: 'N.Comp.Input'
    }
  ]
}

N.Neuron = function() {
  this.ClassName    = 'N.Neuron';
  this.Id           = N.GenerateUUID();
  this.Name         = '';
  this.Category     = 'Default';
  this.Compartments = [];
}

N.Neuron.prototype.AddCompartment = function(compartment) {
  this.Compartments.push(compartment);
}

N.Neuron.prototype.GetNumCompartments = function() {
  return this.Compartments.length;
}

N.Neuron.prototype.ToJSON = function() {
  var str = JSON.stringify(this, function(k, v) { return (k === '_finder' ? undefined : v); });
  return str;
}

  //***********************
  //* N.OutputCompartment *
  //***********************

N.OutputCompartment = function() {
  this.ClassName  = 'N.OutputCompartment';
}
