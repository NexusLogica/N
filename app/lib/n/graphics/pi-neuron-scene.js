/**********************************************************************

File     : pi-neuron-scene.js
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

  //********************
  //* N.UI.NeuronScene *
  //********************

N.UI.NeuronScene = function() {
  this.ClassName = 'N.UI.NeuronScene';
  this.Neurons = {};
  this.Origin = 'center';
  this.Id = N.GenerateUUID();
}

N.UI.NeuronScene.prototype.SetNeuron = function(neuron, radius, position) {
  var piGraphic = N.UI.PiNeuronFactory.CreatePiNeuron(neuron.Display.Template, radius);
  this.Neuron = neuron;
  this.NeuronGraphic = piGraphic;
  this.Radius = radius;
  this.Position = position;
}

N.UI.NeuronScene.prototype.Render = function(svgParent) {
  this.NeuronGraphic.Render(this.Neuron, svgParent);
}
