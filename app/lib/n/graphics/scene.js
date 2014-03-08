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
  this.ClassName = 'N.UI.Scene.Neuron';
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

N.UI.Scene.Neuron.prototype.Render = function(svgParent) {
  this.NeuronGraphic.Render(this.Neuron, svgParent);
}

  //**********************
  //* N.UI.Scene.Network *
  //**********************

N.UI.Scene.Network = function() {
  this.ClassName = 'N.UI.Scene.Network';
  this.Network = null;
  this.Neurons = {};
  this.Origin = 'center';
  this.Scale = 100;
  this.Id = N.GenerateUUID();
}

N.UI.Scene.Network.prototype.SetNetwork = function(network, scalePixelsPerUnit, position) {
  var piGraphic = new N.UI.PiNetwork().LoadFrom(network.Display).SetScale(scalePixelsPerUnit);
  this.Network = network;
  this.NetworkGraphic = piGraphic;
  this.Scale = scalePixelsPerUnit;
  this.Position = position;
}

N.UI.Scene.Network.prototype.Render = function(svgParent) {
  this.NetworkGraphic.Render(this.Network, svgParent, this.Scale);
}
