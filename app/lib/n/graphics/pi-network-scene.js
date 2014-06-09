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
}

/**
 *
 * @method Layout
 * @param network {Object} The N.Network object to be displayed in the scene.
 * @param scalePixelsPerUnit {
 * @param position
 */
N.UI.NetworkScene.prototype.Layout = function(network, renderMappings) {
  this.Network = (new N.UI.PiNetwork()).LoadFrom(network.Display).SetNetwork(network);
  this.RenderMappings = renderMappings;
  this.Network.Layout(this.RenderMappings);
}

/**
 * Calculates the scale that will fit the network to a given width.
 * @method ScaleToFitWidth
 * @param width
 * @param paddingHoriz
 * @param paddingVert
 */
N.UI.NetworkScene.prototype.ScaleToFitWidth = function(width, paddingHoriz, paddingVert) {
  var w = width-2*paddingHoriz;
  this.Scale = w/this.Network.UnscaledWidth;
  this.IdealContainerWidth = w;
  this.IdealContainerHeight = this.Network.UnscaledHeight*this.Scale+2*paddingVert;
}

N.UI.NetworkScene.prototype.Render = function(svgParent, network) {
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
