/**********************************************************************

File     : pi-signal-trace-scene.js
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

  //*************************
  //* N.UI.SignalTraceScene *
  //*************************

N.UI.SignalTraceScene = function() {
  this.className = 'N.UI.SignalTraceScene';
  this.signal = {};
  this.id = N.generateUUID();
}

N.UI.SignalTraceScene.prototype.setSignal = function(signal) {
  this.signal = signal;
  this.traceRenderer = new N.UI.SignalTrace();
}

/**
 * Calculates the scale that will fit the network to a given width and height
 * @method scaleToFit
 * @param width
 * @param height
 * @param paddingHoriz
 * @param paddingVert
 */
N.UI.SignalTraceScene.prototype.scaleToFit = function(width, height, padding) {
  this.width = width;
  this.height = height;
  this.paddingHoriz = padding.horizontal();
  this.paddingVert = padding.vertical();
  this.idealContainerWidth = this.width;
  this.idealContainerHeight = this.height;
}

N.UI.SignalTraceScene.prototype.render = function(svgParent) {
  this.traceRenderer.svgParent = svgParent;
  this.traceRenderer.setSignal(this.signal);
  this.box = { x: this.paddingHoriz, y: this.paddingVert, width: (this.width-this.paddingHoriz), height: (this.height-this.paddingVert) };

  this.backgroundRect = svgParent.rect(this.box.width, this.box.height).move(this.box.x, this.box.y).attr({ 'fill': '#FCF8F2', 'stroke-width': 0});
  this.traceRenderer.render(svgParent, this.box, new N.UI.padding());
}
