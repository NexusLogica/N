/**********************************************************************

File     : grid-scene.js
Project  : N Simulator Library
Purpose  : Source file for scenes.
Revisions: Original definition by Lawrence Gunn.
           2014/06/15

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

var N = N || {};
N.UI = N.UI || {};

  //******************
  //* N.UI.GridScene *
  //******************

/**
 * This is the scene handler for network scenes.
 * @class UI.NetworkScene
 * @constructor
 */

N.UI.GridScene = function() {
  this.ClassName = 'N.UI.GridScene';
  this.Grid = null;
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
N.UI.GridScene.prototype.Layout = function(config) {
  this.Grid = (new N.UI.PiGrid()).loadFrom(config);
  this.Grid.Layout(this.RenderMappings);
}

/**
 * Calculates the scale that will fit the network to a given width.
 * @method ScaleToFitWidth
 * @param width
 * @param paddingHoriz
 * @param paddingVert
 */
N.UI.GridScene.prototype.ScaleToFitWidth = function(width, padding) {
  var w = width-padding.Horizontal();
  this.Scale = w/this.Grid.UnscaledWidth;
  this.IdealContainerWidth = w;
  this.IdealContainerHeight = this.Grid.UnscaledHeight*this.Scale+padding.Vertical();
  this.Grid.X = padding.Left();
  this.Grid.Y = padding.Top();
}

N.UI.GridScene.prototype.Render = function(svgParent, network) {
  this.Grid.Render(svgParent, this.Scale, this.RenderMappings);
}

N.UI.GridScene.prototype.Fit = function(svgParent) {
  var svgWidth = $(svgParent.node).parent().width();
  var svgHeight = $(svgParent.node).parent().height();
  var aspectRatioSvg = svgWidth/svgHeight;
  var aspectRatioNetwork = this.Grid.Width/this.Grid.Height;
  if(aspectRatioNetwork > aspectRatioSvg) {
    return 0.9*svgWidth/this.Grid.Width;
  }
  else {
    return 0.9*svgHeight/this.Grid.Height;
  }
}
