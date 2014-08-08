/**********************************************************************

File     : pi-signal-graph-scene.js
Project  : N Simulator Library
Purpose  : Source file for a signal graph scene.
Revisions: Original definition by Lawrence Gunn.
           2014/07/12

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

var N = N || {};
N.UI = N.UI || {};

  //*************************
  //* N.UI.SignalGraphScene *
  //*************************

/**
 * This is the scene handler for network scenes.
 * @class UI.SignalGraphScene
 * @constructor
 */

N.UI.SignalGraphScene = function() {
  this.ClassName = 'N.UI.SignalGraphScene';
  this.signalGraph = new N.UI.SignalGraph();
  this.X = 0;
  this.Y = 0;
  this.Width = 100;
  this.Height = 100;
}

N.UI.SignalGraphScene.prototype.AddTraceFromSource = function(id, source, propName) {
  this.signalGraph.AddTraceFromSource(id, source, propName);
}

N.UI.SignalGraphScene.prototype.GetTraceFromId = function(id) {
  return this.signalGraph.TracesById[id];
}

/**
 * Calculates the scale that will fit the network to a given width.
 * @method ScaleToFitWidth
 * @param width
 * @param paddingHoriz
 * @param paddingVert
 */
N.UI.SignalGraphScene.prototype.ScaleToFitWidth = function(width, padding) {
  var w = width-padding.Horizontal();
  this.IdealContainerWidth = w;
  var num = this.signalGraph.Traces.length;
  this.IdealContainerHeight = (num > 0 ? num : 1)*w*0.2+padding.Vertical();
  this.signalGraph.X = padding.Left();
  this.signalGraph.Y = padding.Top();
}

N.UI.SignalGraphScene.prototype.Render = function(svgParent, size, padding) {
  this.Width = size.Width;
  this.Height = size.Height;
  this.Padding = padding;

  this.Group = svgParent.group().move(this.X, this.Y).size(this.Width, this.Height).attr({ 'class': 'pi-signal-graph-scene' });
  this.signalGraph.Render(this.Group, size, padding);
}

N.UI.SignalGraphScene.prototype.Fit = function(svgParent) {
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
