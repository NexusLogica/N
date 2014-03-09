/**********************************************************************
 
File     : network.js
Project  : N Simulator Library
Purpose  : Source file for neuron relate objects.
Revisions: Original definition by Lawrence Gunn.
           2014/02/19

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

var N = N || {};

  //*************
  //* N.Network *
  //*************

N.Network = function() {
  this.ClassName  = 'N.Network';
  this.Id         = null;
  this.Name       = '';
  this.ShortName  = '';
  this.Category   = 'Default';
  this.Neurons = [];
  this.NeuronsByName = {};
}

N.Network.prototype.AddNeuron = function(neuron) {
  if(neuron.Name.length === 0 || neuron.ShortName.length === 0) {
    N.L('ERROR: N.Network.AddNeuron: No name for neuron.');
    throw 'ERROR: N.Network.AddNeuron: No name for neuron.';
  }
  this.Neurons.push(neuron);
  this.NeuronsByName[neuron.Name] = neuron;
  this.NeuronsByName[neuron.ShortName] = neuron;
}

N.Network.prototype.GetNumNeurons = function() {
  return this.Neurons.length;
}

N.Network.prototype.GetNeuronByIndex = function(index) {
  return this.Neurons[index];
}

N.Network.prototype.GetNeuronByName = function(name) {
  return this.NeuronsByName[name];
}

N.Network.prototype.Update = function(time) {
  var num = this.Neurons.length;
  for(var i=0; i<num; i++) {
    this.Neurons[i].Update(time);
  }
}

N.Network.prototype.LoadFrom = function(json) {
  for(var i in json) {
    if(i === 'Neurons') {
      for(var j=0; j<json.Neurons.length; j++) {
        var neuronJson = json.Neurons[j];
        var neuron = N.NewN(neuronJson.ClassName, this).LoadFrom(neuronJson);
        this.Neurons.push(neuron);
        this.NeuronsByName[neuron.Name] = neuron;
        this.NeuronsByName[neuron.ShortName] = neuron;
      }
    }
    else {
      this[i] = json[i];
    }
  }

  return this;
}
