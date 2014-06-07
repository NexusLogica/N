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

  //*********************
  //* N.UI.NetworkScene *
  //*********************

/**
 * This is the scene handler for network scenes.
 * @class UI.NetworkScene
 * @constructor
 */

N.UI.NetworkScene = function() {
  this.ClassName = 'N.UI.NetworkScene';
  this.Network = null;
  this.Neurons = {};
  this.Origin = 'center';
  this.Scale = 100;
  this.Id = N.GenerateUUID();
}

N.UI.NetworkScene.prototype.LayoutToFitRectangle = function(network, rectangle) {
}

/**
 *
 * @method SetNetwork
 * @param network {Object} The N.Network object to be displayed in the scene.
 * @param scalePixelsPerUnit {
 * @param position
 */
N.UI.NetworkScene.prototype.Layout = function(network, renderMappings) {
  this.Network = (new N.UI.PiNetwork()).LoadFrom(network.Display).SetNetwork(network);
  this.RenderMappings = renderMappings;
  this.ScaledRectangle = this.Network.Layout(this.RenderMappings);
}

N.UI.NetworkScene.prototype.SetScale = function(scalePixelsPerUnit) {
  this.Network = new N.UI.PiNetwork().LoadFrom(network.Display).SetScale(scalePixelsPerUnit).SetNetwork(network);
  this.Scale = scalePixelsPerUnit;
  this.Position = position;
}

N.UI.NetworkScene.prototype.Render = function(svgParent, network) {
 // this.Scale = this.Fit(svgParent);
  this.Network.Render(svgParent, this.Scale, this.RenderMappings);
}

N.UI.NetworkScene.prototype.Fit = function(svgParent) {
  var svgWidth = $(svgParent.node).parent().width();
  var svgHeight = $(svgParent.node).parent().height();
  var aspectRatioSvg = svgWidth/svgHeight;
  var aspectRatioNetwork = this.Network.Width/this.Network.Height;
  if(aspectRatioNetwork > aspectRatioSvg) {
    return 0.9*svgWidth/this.Network.Width;
  }
  else {
    return 0.9*svgHeight/this.Network.Height;
  }
}

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

  //*************************
  //* N.UI.SignalTraceScene *
  //*************************

N.UI.SignalTraceScene = function() {
  this.ClassName = 'N.UI.SignalTraceScene';
  this.Signal = {};
  this.Id = N.GenerateUUID();
}

N.UI.SignalTraceScene.prototype.SetSignal = function(signalId) {
  this.SignalId = signalId;
  this._traceRenderer = new N.UI.SignalTraceRenderer();
}

N.UI.SignalTraceScene.prototype.Render = function(svgParent) {
  this._w = svgParent.parent.width();
  this._h = svgParent.parent.height();
  this._traceRenderer.Configure(svgParent, this.SignalId);
  this._padding = 15;
  this._box = { x: this._padding, y: this._padding, width: (this._w-2*this._padding), height: (this._h-2*this._padding) };
  this._traceRenderer.SetCanvasBoundary(this._box);

  this._backgroundRect = svgParent.rect(this._box.width, this._box.height).move(this._box.x, this._box.y).attr({ 'fill': '#FCF8F2', 'stroke-width': 0});
  this._traceRenderer.Render();
}

// TODO: Used?
N.UI.SignalTraceScene.prototype.SetScale = function(min, max) {
  this._traceRenderer.SetScale(min, max);
}
