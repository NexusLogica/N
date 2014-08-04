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

var nSimAppControllers = angular.module('nSimApp.controllers');

  //**********************
  //* PiCanvas Directive *
  //**********************

/**
 * This Angular JS directive is for creating an SVG canvas.
 * @class directive.piCanvas
 */
nSimAppDirectives.directive('piCanvas', ['$timeout', function($timeout) {
  return {
    restrict: 'AEC',
    scope : {
      'scene': '=piScene'
    },
    controller: function($scope) {
    },
    link : function($scope, $element, $attrs) {

      $element.scope().OnEvent = function(event, obj) {
        $scope.$emit('pi-canvas:event-broadcast-request', event, obj);
      }

      var GetSvgParent = function() {
        return $element.children('svg')[0].instance;
      }

      var GetSize = function() {
        var w = $element.width();
        var h = $element.height();
        if(!$attrs.fitToParent) {
          if($attrs.canvasWidth)  { w = $attrs.canvasWidth;  }
          if($attrs.canvasHeight) { h = $attrs.canvasHeight; }
        }
        return { Width: w, Height: h };
      }

      var Configure = function() {
        $element.addClass('pi-canvas');

        var size = GetSize();

        var padding = new N.UI.Padding((_.isUndefined($attrs.piPadding) ? 0 : parseInt($attrs.piPadding, 10)));

        if(!_.isUndefined($attrs.piFitWidth) && $scope.scene.ScaleToFitWidth) {
          $scope.scene.ScaleToFitWidth(size.Width, padding);
          size.Height = $scope.scene.IdealContainerHeight;
          $element.height(size.Height);
        }
        else {
          $scope.scene.ScaleToFit(size.Width, size.Height, padding);
        }

        var svg = SVG($element[0]).size(size.Width, size.Height);

        var backgroundRect = svg.rect(size.Width, size.Height).attr({ class: 'pi-canvas' });
        svg.MainGroup = svg.group().size(size.Width, size.Height);

        var origin = ($attrs.canvasOrigin ? $attrs.canvasOrigin : 'upper-left');
        switch(origin) {
          case 'center': { svg.MainGroup.translate(0.5*size.Width, 0.5*size.Height); break; }
          case 'upper-left': { break; }
        }

        $scope.scene.Render(svg.MainGroup, size, padding);

        $timeout(function() {
          $element.trigger('onInitialRender', [$scope]);
          $element.trigger('onRender', [$scope]);
        }, 1);
      }

      Configure();
    }
  }
}]);

  //******************************
  //* PiEventReceiver Controller *
  //******************************

/**
 * This Angular JS directive is for creating an SVG canvas.
 * @class directive.piCanvas
 */
nSimAppControllers.controller('PiEventReceiver', ['$scope', function($scope) {
  $scope.OnEvent = function(event, obj) {
    debugger;
    $scope.$broadcast('pi-canvas:event', event, obj);
  }
}]);
