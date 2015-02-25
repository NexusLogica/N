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
  this.className = 'N.UI.GridScene';
  this.grid = null;
  this.origin = 'center';
  this.scale = 100;
}

/**
 *
 * @method layout
 * @param network {Object} The N.Network object to be displayed in the scene.
 * @param scalePixelsPerUnit {
 * @param position
 */
N.UI.GridScene.prototype.layout = function(config) {
  this.grid = (new N.UI.PiGrid()).loadFrom(config);
  this.grid.layout(this.renderMappings);
}

/**
 * Calculates the scale that will fit the network to a given width.
 * @method scaleToFitWidth
 * @param width
 * @param paddingHoriz
 * @param paddingVert
 */
N.UI.GridScene.prototype.scaleToFitWidth = function(width, padding) {
  var w = width-padding.horizontal();
  this.scale = w/this.grid.unscaledWidth;
  this.idealContainerWidth = w;
  this.idealContainerHeight = this.grid.unscaledHeight*this.scale+padding.vertical();
  this.grid.x = padding.left();
  this.grid.y = padding.top();
}

N.UI.GridScene.prototype.render = function(svgParent, network) {
  this.Grid.render(svgParent, this.scale, this.renderMappings);
}

N.UI.GridScene.prototype.fit = function(svgParent) {
  var svgWidth = $(svgParent.node).parent().width();
  var svgHeight = $(svgParent.node).parent().height();
  var aspectRatioSvg = svgWidth/svgHeight;
  var aspectRatioNetwork = this.grid.width/this.grid.height;
  if(aspectRatioNetwork > aspectRatioSvg) {
    return 0.9*svgWidth/this.grid.width;
  }
  else {
    return 0.9*svgHeight/this.grid.height;
  }
}
