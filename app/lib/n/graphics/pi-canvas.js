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
  //* PiCanvas Directive *
  //**********************

/**
 * This Angular JS directive is for creating an SVG canvas.
 * @class directive.piCanvas
 */
nSimAppDirectives.directive('piCanvas', ['$timeout', function($timeout) {
  return {
    scope : {
      'text': '@stuff',
      'scene': '=piScene'
    },
    link : function($scope, $element, $attrs) {

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
        var size = GetSize();
        var svg = SVG($element[0]).size(size.Width, size.Height);
        var backgroundRect = svg.rect(size.Width, size.Height).attr({ class: 'pi-canvas' });
        svg.MainGroup = svg.group();

        var origin = ($attrs.canvasOrigin ? $attrs.canvasOrigin : 'center');
        switch(origin) {
          case 'center': { svg.MainGroup.translate(0.5*size.Width, 0.5*size.Height); break; }
        }

        $scope.scene.Render(svg.MainGroup);

        $timeout(function() {
          $element.trigger('onInitialRender', [$scope]);
          $element.trigger('onRender', [$scope]);
        }, 1);
      }

      Configure();
    }
  }
}]);
