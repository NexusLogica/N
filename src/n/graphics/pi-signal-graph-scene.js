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
  this.className = 'N.UI.SignalGraphScene';
  this.signalGraph = new N.UI.SignalGraph();
  this.x = 0;
  this.y = 0;
  this.width = 100;
  this.height = 100;
};

N.UI.SignalGraphScene.prototype.addTrace = function(signal) {
  this.signalGraph.addTrace(signal);
};

N.UI.SignalGraphScene.prototype.addTraceFromSource = function(id, source, propName) {
  this.signalGraph.addTraceFromSource(id, source, propName);
};

N.UI.SignalGraphScene.prototype.getTraceFromId = function(id) {
  return this.signalGraph.tracesById[id];
};

N.UI.SignalGraphScene.prototype.setScale = function(min, max) {
  if(this.signalGraph) {
    this.signalGraph.setScale(min, max);
  }
};

/**
 * Calculates the scale that will fit the network to a given width.
 * @method scaleToFitWidth
 * @param width
 * @param padding
 */
N.UI.SignalGraphScene.prototype.scaleToFitWidth = function(width, padding) {
  var w = width-padding.horizontal();
  this.idealContainerWidth = w;
  var num = this.signalGraph.traces.length;
  this.idealContainerHeight = (num > 0 ? num : 1)*w*0.2+padding.vertical();
  this.signalGraph.x = padding.left();
  this.signalGraph.y = padding.top();
};

N.UI.SignalGraphScene.prototype.render = function(svgParent, size, padding) {
  this.width = size.width;
  this.height = size.height;
  this.padding = padding;

  this.group = svgParent.group().move(this.x, this.y).size(this.width, this.height).attr({ 'class': 'pi-signal-graph-scene' });
  this.signalGraph.render(this.group, size, padding);
};

N.UI.SignalGraphScene.prototype.fit = function(svgParent) {
  var svgWidth = $(svgParent.node).parent().width();
  var svgHeight = $(svgParent.node).parent().height();
  var aspectRatioSvg = svgWidth/svgHeight;
  var aspectRatioNetwork = this.network.width/this.network.height;
  if(aspectRatioNetwork > aspectRatioSvg) {
    return 0.9*svgWidth/this.network.width;
  }
  else {
    return 0.9*svgHeight/this.network.height;
  }
};
