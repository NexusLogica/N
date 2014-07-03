/**********************************************************************

File     : pi-workbench-scene.js
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

  //***********************
  //* N.UI.WorkbenchScene *
  //***********************

/**
 * This is the scene handler for network scenes.
 * @class UI.WorkbenchScene
 * @constructor
 */

N.UI.WorkbenchScene = function() {
  this.ClassName = 'N.UI.WorkbenchScene';
  this.Network = null;
  this.Neurons = {};
  this.Origin = 'center';
  this.Scale = 100;
  this.CentralPadding = 20;
  this.X = 0;
  this.Y = 0;
}

/**
 *
 * @method Layout
 * @param network {Object} The N.Network object to be displayed in the scene.
 * @param scalePixelsPerUnit {
 * @param position
 */
N.UI.WorkbenchScene.prototype.Layout = function(workbench, renderMappings) {
  this.NetworkScene = (new N.UI.NetworkScene()).Layout(workbench.Network, renderMappings);
}

/**
 * Calculates the scale that will fit the network to a given width.
 * @method ScaleToFitWidth
 * @param width
 * @param paddingHoriz
 * @param paddingVert
 */
N.UI.WorkbenchScene.prototype.ScaleToFitWidth = function(width, padding) {
  var w = width-padding.Horizontal();
  this.NetworkScene.ScaleToFitWidth(w/2, new N.UI.Padding(0, this.CentralPadding, 0, 0));
  this.IdealContainerWidth = w;
  this.IdealContainerHeight = this.NetworkScene.IdealContainerHeight;
  this.NetworkScene.Network.X = padding.Left();
  this.NetworkScene.Network.Y = padding.Top();
}

N.UI.WorkbenchScene.prototype.Render = function(svgParent) {
  this.Group = svgParent.group().move(this.X, this.Y);
  this.NetworkScene.Render(this.Group);
}

N.UI.WorkbenchScene.prototype.Fit = function(svgParent) {
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
