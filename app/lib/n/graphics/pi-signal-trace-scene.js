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

  //*************************
  //* N.UI.SignalTraceScene *
  //*************************

N.UI.SignalTraceScene = function() {
  this.ClassName = 'N.UI.SignalTraceScene';
  this.Signal = {};
  this.Id = N.GenerateUUID();
}

N.UI.SignalTraceScene.prototype.SetSignal = function(signal) {
  this.Signal = signal;
  this.TraceRenderer = new N.UI.SignalTraceRenderer();
}

/**
 * Calculates the scale that will fit the network to a given width and height
 * @method ScaleToFit
 * @param width
 * @param height
 * @param paddingHoriz
 * @param paddingVert
 */
N.UI.SignalTraceScene.prototype.ScaleToFit = function(width, height, paddingHoriz, paddingVert) {
  this.Width = width;
  this.Height = height;
  this.PaddingHoriz = paddingHoriz;
  this.PaddingVert = paddingVert;
  this.IdealContainerWidth = this.Width;
  this.IdealContainerHeight = this.Height;
}

N.UI.SignalTraceScene.prototype.Render = function(svgParent) {
  this.TraceRenderer.Configure(svgParent, this.Signal);
  this.Box = { X: this.PaddingHoriz, Y: this.PaddingVert, Width: (this.Width-2*this.PaddingHoriz), Height: (this.Height-2*this.PaddingVert) };
  this.TraceRenderer.SetCanvasBoundary(this.Box);

  this.BackgroundRect = svgParent.rect(this.Box.Width, this.Box.Height).move(this.Box.X, this.Box.Y).attr({ 'fill': '#FCF8F2', 'stroke-width': 0});
  this.TraceRenderer.Render();
}