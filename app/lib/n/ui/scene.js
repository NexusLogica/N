/**********************************************************************

File     : scenes.js
Project  : N Simulator Library
Purpose  : Source file for scenes.
Revisions: Original definition by Lawrence Gunn.
           2014/02/24

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

var N = N || {};
N.UI = N.UI || {};
N.UI.Scene = N.UI.Scene || {};

  //*********************
  //* N.UI.Scene.Neuron *
  //*********************

N.UI.Scene.Neuron = function() {
  this.ClassName = 'N.UI.Scene';
  this.Neurons = {};
  this.Origin = 'center';
  this.Id = N.GenerateUUID();
}

N.UI.Scene.Neuron.prototype.SetNeuron = function(neuron, radius, position) {
  var piGraphic = N.UI.PiNeuronFactory.CreatePiNeuron(neuron.Display.Template, radius);
  this.Neuron = neuron;
  this.NeuronGraphic = piGraphic;
  this.Radius = radius;
  this.Position = position;
}
