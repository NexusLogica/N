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

N.UI.NetworkScene = function(sceneSignals) {
  this.className = 'N.UI.NetworkScene';
  this.piNetwork = null;
  this.neurons = {};
  this.origin = 'center';
  this.scale = 100;
  this.x = 0;
  this.y = 0;
  this.sceneSignals = sceneSignals;
};

/**
 *
 * @method load
 * @param {Object} network - The N.Network object to be displayed in the scene.
 * @param  {Object} scopeWithLoad - A scope or other object with a file loader method .loadFile(path).
 * @return {Q.Promise} promise
 */
N.UI.NetworkScene.prototype.load = function(network, scopeWithLoad) {
  var deferred = Q.defer();
  N.UI.PiNeuronTemplateBuilder.clear();
  this.piNetwork = new N.UI.PiNetwork(this.sceneSignals);
  this.piNetwork.setNetwork(network);
  this.piNetwork.scale = this.scale;

  var loader = function(path) {
    var msg;
    var deferred = Q.defer();
    scopeWithLoad.loadFile(path).then(function(source) {
      try {
        var json = JSON.parse(source.getText());
        if(json) {
          deferred.resolve(json);
        } else {
          msg = 'ERROR: N.UI.NetworkScene.load: Invalid JSON';
          console.log(msg);
          deferred.reject({ description: msg });
        }
      } catch(err) {
        msg = 'CATCH: N.UI.NetworkScene.load: Invalid JSON ['+path+']: '+err.message;
        console.log(msg);
        deferred.reject({ description: msg });
      }
    }, function(err) {
      msg = 'ERROR: N.UI.NetworkScene.load: Unable to load JSON';
      console.log(msg);
      deferred.reject({ description: msg });
    });
    return deferred.promise;
  };

  this.piNetwork.load(loader).then(function() {
    deferred.resolve();
  }, function(err) {
    deferred.reject(err);
  });

  return deferred.promise;
};

/**
 *
 * @method layout
 * @return {N.UI.NetworkScene} this
 */
N.UI.NetworkScene.prototype.layout = function() {
  this.piNetwork.layout();
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
  this.scale = w/this.piNetwork.unscaledWidth;
  this.idealContainerWidth = w;
  this.idealContainerHeight = this.piNetwork.unscaledHeight*this.scale+padding.vertical();
  this.piNetwork.xScaled = padding.left();
  this.piNetwork.yScaled = padding.top();
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

  var w = this.piNetwork.width;
  var h = this.piNetwork.height;
  var ar = w/h;

  // Use height as the constraint.
  if(wCtnr > ar) {
    this.scale = hCtnr/h;
    this.idealContainerHeight = hCtnr;
    this.idealContainerWidth = hCtnr*ar;
    this.piNetwork.xScaled = 0.5*(wCtnr-this.idealContainerWidth)+padding.left();
    this.piNetwork.yScaled = padding.top();
  } else {
    this.scale = wCtnr/w;
    this.idealContainerWidth = wCtnr;
    this.idealContainerHeight = wCtnr/ar;
    this.piNetwork.xScaled = padding.left();
    this.piNetwork.yScaled = 0.5*(hCtnr-this.idealContainerHeight)+padding.top();
  }
  this.piNetwork.scale = this.scale;
  this.piNetwork.layout();
};

N.UI.NetworkScene.prototype.render = function(svgParent) {
  this.group = svgParent.group().move(this.x, this.y);
  this.piNetwork.render(this.group, this.scale);
};

N.UI.NetworkScene.prototype.fit = function(svgParent) {
  var svgWidth = $(svgParent.node).parent().width();
  var svgHeight = $(svgParent.node).parent().height();
  var aspectRatioSvg = svgWidth/svgHeight;
  var aspectRatioNetwork = this.piNetwork.width/this.piNetwork.height;
  if(aspectRatioNetwork > aspectRatioSvg) {
    return 0.9*svgWidth/this.piNetwork.width;
  }
  else {
    return 0.9*svgHeight/this.piNetwork.height;
  }
};

