/**********************************************************************

File     : grid-slider.js
Project  : N Simulator Library
Purpose  : Source file for a grid slider UI component.
Revisions: Original definition by Lawrence Gunn.
           2014/09/11

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

angular.module('nSimApp.directives').directive('gridSlider', [function() {
  return {
    restrict: 'E',
    templateUrl: 'components/grid-slider/grid-slider.html',
    controller: ['ComponentExtensions', '$scope', '$element', '$attrs', function (ComponentExtensions, $scope, $element, $attrs) {
      ComponentExtensions.initialize(this, 'gridSlider', $scope, $element, $attrs);

      $scope.slide = new THREE.Vector3();
    }],
    link: function($scope, $element, $attrs, ctrl) {
      $element.find('.horizontal-slider-container .slider').slider({
        value: 0,
        min: -100,
        max: 100,
        step: 2,
        slide: function( event, ui ) {
          $scope.slide.z = ui.value/100;
          $scope.$emit('field-viewer-settings:slide-grid', $scope.slide);
        }

      });

      $scope.box = {
        width: 100,
        height: 100
      };

      var constrain = function(a, min, max) {
        if(a < min) { return min; }
        if(a > max) { return max; }
        return a;
      };

      var buildSvg = function() {
        var width = $element.find('.svg-container').width();
        var height = $element.find('.svg-container').height();
        $scope.svg = SVG($element.find('.svg-container')[0]).size(width, height);

        $scope.box.x0 = 0.5*width;
        $scope.box.y0 = 0.5*height;

        $scope.svg.backgroundRect = $scope.svg.rect(width, height).attr({ class: 'pi-canvas' });
        $scope.svg.mainGroup = $scope.svg.group().move($scope.box.x0, $scope.box.y0);
        $scope.rect = $scope.svg.mainGroup.rect($scope.box.width, $scope.box.height).move(-0.5*$scope.box.width, -0.5*$scope.box.height).attr({ class: 'selection-rect' });

        $scope.box.minX = 0.5*$scope.box.width;
        $scope.box.minY = 0.5*$scope.box.height;
        $scope.box.maxX = width-0.5*$scope.box.width;
        $scope.box.maxY = height-0.5*$scope.box.height;

        $($scope.svg.backgroundRect.node).on('mouseleave', function() {
          //$scope.inMove = false;
        });

        $($scope.rect.node).on('mousedown', function(event) {
          $scope.inMove = true;
          $scope.clientDown = new THREE.Vector2(event.offsetX, event.offsetY);
          $scope.boxPosOnDown = new THREE.Vector2($scope.svg.mainGroup.x(), $scope.svg.mainGroup.y());
        });

        $($scope.svg.backgroundRect.node).on('mousemove', function(event) {
          if($scope.inMove) {
            var move = new THREE.Vector2(event.offsetX+$scope.rect.x(), event.offsetY+$scope.rect.y()).sub($scope.clientDown);
            move.x += $scope.box.x0;
            move.y += $scope.box.y0;
            //debugger;
            var x = constrain(move.x, $scope.box.minX, $scope.box.maxX);
            var y = constrain(move.y, $scope.box.minY, $scope.box.maxY);
//            var x = move.x;
 //           var y = move.y;
            $scope.svg.mainGroup.move(x, y);

            $scope.slide.x = 2.0*(move.x-$scope.box.x0)/($scope.box.maxX-$scope.box.minX);
            $scope.slide.y = 2.0*(move.y-$scope.box.y0)/($scope.box.maxY-$scope.box.minY);
            $scope.$emit('field-viewer-settings:slide-grid', $scope.slide);
          }
        });

        $($scope.rect.node).on('mousemove', function(event) {
          if($scope.inMove) {
            var move = new THREE.Vector2(event.offsetX, event.offsetY).sub($scope.clientDown);

            move.x += $scope.box.x0;
            move.y += $scope.box.y0;
            //debugger;
            var x = constrain(move.x, $scope.box.minX, $scope.box.maxX);
            var y = constrain(move.y, $scope.box.minY, $scope.box.maxY);
//            var x = move.x;
 //           var y = move.y;
            $scope.svg.mainGroup.move(x, y);

            $scope.slide.x = 2.0*(move.x-$scope.box.x0)/($scope.box.maxX-$scope.box.minX);
            $scope.slide.y = 2.0*(move.y-$scope.box.y0)/($scope.box.maxY-$scope.box.minY);
            $scope.$emit('field-viewer-settings:slide-grid', $scope.slide);
          }
        });

        $($scope.rect.node).on('mouseup', function(event) {
          $scope.inMove = false;
        });

        $scope.svg.mainGroup.translate(0.5*width, 0.5*height);
      };

      buildSvg();
    }
  };
}]);
