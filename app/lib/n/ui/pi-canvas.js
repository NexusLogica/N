/**********************************************************************

File     : pi-canvas.js
Project  : N Simulator Library
Purpose  : Source file for pi canvas controller and renderer objects.
Revisions: Original definition by Lawrence Gunn.
           2014/02/24

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

var N = N || {};
N.UI = N.UI || {};

  //**********************
  //* PiCanvasController *
  //**********************

var nSimAppControllers = angular.module('nSimApp.controllers');

nSimAppControllers.controller('PiCanvasController', ['$scope',
  function PiNeuronTestController($scope) {
  }
]);

  //*************************
  //* N.UI.PiCanvasRenderer *
  //*************************

N.UI.PiCanvasRenderer = function() {
}

N.UI.PiCanvasRenderer.prototype.Configure = function(svgParent, sceneId) {
  this._svgParent = svgParent;
  this.Scene = N.Objects.Get(sceneId);
  this._w = this._svgParent.width();
  this._h = this._svgParent.height();
  this._padding = 0;
  this._boundary = { x: this._padding, y: this._padding, width: (this._w-2*this._padding), height: (this._h-2*this._padding) };
  this._x = 0;
  this._y = 0;
}

N.UI.PiCanvasRenderer.prototype.Render = function() {
  this._backgroundRect = this._svgParent.rect(this._boundary.width, this._boundary.height).move(this._boundary.x, this._boundary.y).fill('#FCF8F2').stroke( {width: 3, color: '#294052'} );

  this._group = this._svgParent.group();
  this.Scene.NeuronGraphic.Render(this._group);
  if(this.Scene.Origin === 'center') {
    this._x = 0.5*this._w;
    this._y = 0.5*this._h;
  }
  this._group.translate(this._x, this._y);
}
