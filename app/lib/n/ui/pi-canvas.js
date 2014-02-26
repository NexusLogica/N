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

N.UI.PiCanvasRenderer.prototype.Configure = function(paper, sceneId) {
  this._paper = paper;
  this.Scene = N.UI.Scenes.GetScene(sceneId);
  this._w = this._paper.canvas.offsetWidth;
  this._h = this._paper.canvas.offsetHeight;
  this._padding = 0;
  this._boundary = { x: this._padding, y: this._padding, width: (this._w-2*this._padding), height: (this._h-2*this._padding) };
}

N.UI.PiCanvasRenderer.prototype.Render = function() {
  this._group = this._paper.group();
  this._backgroundRect = this._paper.rect(this._boundary.x, this._boundary.y, this._boundary.width, this._boundary.height).attr({ 'fill': '#FCF8F2', 'stroke-width': 3, 'stroke': 'red'});
  this.Scene.NeuronGraphic.Render(this._paper);
  this._group.push(this.Scene.NeuronGraphic.GetGroup());
  this._group.translate(100, 100);

//  this.Scene
}
