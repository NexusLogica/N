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
  this.className = 'N.UI.NeuronScene';
  this.neurons = {};
  this.origin = 'center';
  this.id = N.generateUUID();
};

N.UI.NeuronScene.prototype.setNeuron = function(neuron, template) {
  this.template = template;
  this.neuronObj = neuron;
};

/**
 * Calculates the scale that will fit the network to a given width.
 * @method scaleToFitWidth
 * @param width
 * @param paddingHoriz
 * @param paddingVert
 */
N.UI.NeuronScene.prototype.scaleToFitWidth = function(width, paddingHoriz, paddingVert) {
  var w = width-2*paddingHoriz;
  this.scale = 0.5*w;
  this.idealContainerWidth = width;
  this.idealContainerHeight = width;
};

N.UI.NeuronScene.prototype.render = function(svgParent) {
  this.neuron = N.UI.PiNeuronTemplateBuilder.createPiNeuron(this.template, this.scale);
  this.neuron.render(this.neuronObj, svgParent);
};
