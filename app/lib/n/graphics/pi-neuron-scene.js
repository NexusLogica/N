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

N.UI.NeuronScene.prototype.SetNeuron = function(neuron, template) {
  this.Template = template;
  this.NeuronObj = neuron;
}

/**
 * Calculates the scale that will fit the network to a given width.
 * @method ScaleToFitWidth
 * @param width
 * @param paddingHoriz
 * @param paddingVert
 */
N.UI.NeuronScene.prototype.ScaleToFitWidth = function(width, paddingHoriz, paddingVert) {
  var w = width-2*paddingHoriz;
  this.Scale = 0.5*w;
  this.IdealContainerWidth = width;
  this.IdealContainerHeight = width;
}

N.UI.NeuronScene.prototype.Render = function(svgParent) {
  this.Neuron = N.UI.PiNeuronFactory.CreatePiNeuron(this.Template, this.Scale);
  this.Neuron.Render(this.NeuronObj, svgParent);
}
