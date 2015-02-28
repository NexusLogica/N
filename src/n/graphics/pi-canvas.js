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

N.UI = N.UI || {};

  //**********************
  //* PiCanvas Directive *
  //**********************

/**
 * This Angular JS directive is for creating an SVG canvas.
 * @class directive.piCanvas
 */
angular.module('nSimulationApp').directive('piCanvas', ['$timeout', function($timeout) {
  return {
    restrict: 'AEC',
    scope : {
      'scene': '=piScene'
    },
    controller: function($scope) {
    },
    link : function($scope, $element, $attrs) {

      $element.scope().onEvent = function(event, obj) {
        $scope.$emit('pi-canvas:event-broadcast-request', event, obj);
      }

      var getSvgParent = function() {
        return $element.children('svg')[0].instance;
      }

      var getSize = function() {
        var w = $element.width();
        var h = $element.height();
        if(!$attrs.fitToParent) {
          if($attrs.canvasWidth)  { w = $attrs.canvasWidth;  }
          if($attrs.canvasHeight) { h = $attrs.canvasHeight; }
        }
        return { width: w, height: h };
      }

      var configure = function() {
        $element.addClass('pi-canvas');

        var size = getSize();

        var padding = new N.UI.Padding((_.isUndefined($attrs.piPadding) ? 0 : parseInt($attrs.piPadding, 10)));

        if(!_.isUndefined($attrs.piFitWidth) && $scope.scene.scaleToFitWidth) {
          $scope.scene.scaleToFitWidth(size.width, padding);
          size.height = $scope.scene.idealContainerHeight;
          $element.height(size.height);
        }
        else {
          $scope.scene.scaleToFit(size.width, size.height, padding);
        }

        var svg = SVG($element[0]).size(size.width, size.height);

        var backgroundRect = svg.rect(size.width, size.height).attr({ class: 'pi-canvas' });
        svg.mainGroup = svg.group().size(size.width, size.height);

        var origin = ($attrs.canvasOrigin ? $attrs.canvasOrigin : 'upper-left');
        switch(origin) {
          case 'center': { svg.mainGroup.translate(0.5*size.width, 0.5*size.height); break; }
          case 'upper-left': { break; }
        }

        $scope.scene.render(svg.mainGroup, size, padding);

        $timeout(function() {
          $element.trigger('onInitialRender', [$scope]);
          $element.trigger('onRender', [$scope]);
        }, 1);
      }

      configure();
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
angular.module('nSimulationApp').controller('piEventReceiver', ['$scope', function($scope) {
  $scope.onEvent = function(event, obj) {
    $scope.$broadcast('pi-canvas:event', event, obj);
  }
}]);
