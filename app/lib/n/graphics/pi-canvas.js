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
  function PiCanvasController($scope) {
  }
]);

  //**********************
  //* PiCanvas Directive *
  //**********************

/**
 * This Angular JS directive is for creating an SVG canvas.
 * @class directive.piCanvas
 */
nSimAppDirectives.directive('piCanvas', function() {
  function link($scope, $element, $attrs) {
    var width = $($element[0]).width();
    var height = $($element[0]).height();
    var sceneId = $attrs.piSceneId;
    $($element[0]).width(width).height(height);
    $scope.svg = SVG($element[0]).size(width, height);
    $scope.$parent.renderer = new N.UI.PiCanvasRenderer();
    $scope.$parent.renderer.Configure($element[0], $scope.svg, sceneId);
    $scope.$parent.renderer.Render();
  }

  return {
    restrict: 'AE',
    transclude: true,
    scope: { title:'@' },
    link: link
  };
});


  //*************************
  //* N.UI.PiCanvasRenderer *
  //*************************

/**
 * This is the main render manager for Pi Canvas's.
 * @class N.UI.PiCanvasRenderer
 * @constructor
 */
N.UI.PiCanvasRenderer = function() {
}

N.UI.PiCanvasRenderer.prototype.Configure = function(piCanvasElement, svgParent, sceneId) {
  this.PiCanvasElement = $(piCanvasElement);
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
  this._backgroundRect = this._svgParent.rect(this._boundary.width, this._boundary.height).move(this._boundary.x, this._boundary.y).attr({ class: 'pi-canvas' });

  this._group = this._svgParent.group();

  this.Scene.Render(this._group);

  if(this.Scene.Origin === 'center') {
    this._x = 0.5*this._w;
    this._y = 0.5*this._h;
  }
  this._group.translate(this._x, this._y);

  var _this = this;
  setTimeout(function() {
    $(_this.PiCanvasElement).trigger('onInitialRender', [_this, _this.Scene]);
    $(_this.PiCanvasElement).trigger('onRender', [_this, _this.Scene]);
  }, 1);
}
