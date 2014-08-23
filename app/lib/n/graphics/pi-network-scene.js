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
  this.className = 'N.UI.NetworkScene';
  this.network = null;
  this.neurons = {};
  this.origin = 'center';
  this.scale = 100;
  this.x = 0;
  this.y = 0;
}

/**
 *
 * @method layout
 * @param network {Object} The N.Network object to be displayed in the scene.
 * @param scalePixelsPerUnit {
 * @param position
 */
N.UI.NetworkScene.prototype.layout = function(network, renderMappings) {
  this.network = (new N.UI.PiNetwork()).loadFrom(network.display).setNetwork(network);
  this.renderMappings = renderMappings;
  this.network.layout(this.renderMappings);
  return this;
}

/**
 * Calculates the scale that will fit the network to a given width.
 * @method scaleToFitWidth
 * @param width
 * @param paddingHoriz
 * @param paddingVert
 */
N.UI.NetworkScene.prototype.scaleToFitWidth = function(width, padding) {
  var w = width-padding.horizontal();
  this.scale = w/this.network.unscaledWidth;
  this.idealContainerWidth = w;
  this.idealContainerHeight = this.network.unscaledHeight*this.scale+padding.vertical();
  this.network.x = padding.left();
  this.network.y = padding.top();
}

N.UI.NetworkScene.prototype.render = function(svgParent) {
  this.group = svgParent.group().move(this.x, this.y);
  this.network.render(this.group, this.scale, this.renderMappings);
}

N.UI.NetworkScene.prototype.fit = function(svgParent) {
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
}
