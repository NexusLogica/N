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
  this.networkPi = null;
  this.neurons = {};
  this.origin = 'center';
  this.scale = 100;
  this.x = 0;
  this.y = 0;
};

/**
 *
 * @method layout
 * @param network {Object} The N.Network object to be displayed in the scene.
 * @param renderMappings
 */
N.UI.NetworkScene.prototype.layout = function(network, renderMappings) {
  this.networkPi = (new N.UI.PiNetwork()).loadFrom(network.display).setNetwork(network);
  this.renderMappings = renderMappings;
  this.networkPi.layout(this.renderMappings);
  return this;
};

/**
 * Calculates the scale that will fit the network to a given width.
 * @method scaleToFitWidth
 * @param width
 * @param padding
 */
N.UI.NetworkScene.prototype.scaleToFitWidth = function(width, padding) {
  var w = width-padding.horizontal();
  this.scale = w/this.networkPi.unscaledWidth;
  this.idealContainerWidth = w;
  this.idealContainerHeight = this.networkPi.unscaledHeight*this.scale+padding.vertical();
  this.networkPi.x = padding.left();
  this.networkPi.y = padding.top();
};

/**
 * Calculates the scale that will fit the network within both dimensions.
 * @method scaleToFit
 * @param width
 * @param height
 * @param padding
 */
N.UI.NetworkScene.prototype.scaleToFit = function(width, height, padding) {
  // Container width and height.
  // TODO: Deal gracefully if any h or w is zero.
  var wCtnr = width-padding.horizontal();
  var hCtnr = height-padding.vertical();
  var arCtnr = wCtnr/hCtnr;

  var w = this.networkPi.width;
  var h = this.networkPi.height;
  var ar = w/h;

  // Use height as the constraint.
  if(wCtnr > ar) {
    this.scale = hCtnr/h;
    this.idealContainerHeight = hCtnr;
    this.idealContainerWidth = hCtnr*ar;
    this.networkPi.x = 0.5*(wCtnr-this.idealContainerWidth)+padding.left();
    this.networkPi.y = padding.top();
  } else {
    this.scale = wCtnr/w;
    this.idealContainerWidth = wCtnr;
    this.idealContainerHeight = wCtnr/ar;
    this.networkPi.x = padding.left();
    this.networkPi.y = 0.5*(hCtnr-this.idealContainerHeight)+padding.top();
  }
};

N.UI.NetworkScene.prototype.render = function(svgParent) {
  this.group = svgParent.group().move(this.x, this.y);
  this.networkPi.render(this.group, this.scale, this.renderMappings);
};

N.UI.NetworkScene.prototype.fit = function(svgParent) {
  var svgWidth = $(svgParent.node).parent().width();
  var svgHeight = $(svgParent.node).parent().height();
  var aspectRatioSvg = svgWidth/svgHeight;
  var aspectRatioNetwork = this.networkPi.width/this.networkPi.height;
  if(aspectRatioNetwork > aspectRatioSvg) {
    return 0.9*svgWidth/this.networkPi.width;
  }
  else {
    return 0.9*svgHeight/this.networkPi.height;
  }
};

