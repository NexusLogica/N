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

angular.module('nSimulationApp').directive('gridSlider', [function() {
  return {
    restrict: 'E',
    templateUrl: 'src/components/grid-slider/grid-slider.html',
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

        $scope.box.originalX = 0.5*width;
        $scope.box.originalY = 0.5*height;

        $scope.backgroundRect = $scope.svg.rect(width, height).attr({ class: 'pi-canvas' });

        $scope.mainGroup = $scope.svg.group().move($scope.box.originalX, $scope.box.originalY);
        $scope.mainGroup.translate($scope.box.originalX, $scope.box.originalY);

        $scope.rect = $scope.mainGroup.rect($scope.box.width, $scope.box.height).move(-0.5*$scope.box.width, -0.5*$scope.box.height).attr({ class: 'selection-rect' });

        var text = $scope.mainGroup.plain('Drag');
        var bbox = text.bbox();
        text.move(bbox.x, bbox.y-8).attr({class: 'hint-text-title' }).attr({ 'dominant-baseline': 'central'}).attr({ 'text-anchor': 'middle' });

        var text = $scope.mainGroup.plain('to move grid');
        var bbox = text.bbox();
        text.move(bbox.x, bbox.y+8).attr({class: 'hint-text-detail' }).attr({ 'dominant-baseline': 'central'}).attr({ 'text-anchor': 'middle' });


        $scope.box.minX = 0.5*$scope.box.width;
        $scope.box.minY = 0.5*$scope.box.height;
        $scope.box.maxX = width-0.5*$scope.box.width;
        $scope.box.maxY = height-0.5*$scope.box.height;

        $($scope.rect.node).on('mousedown', function(event) {
          $scope.inMove = true;
          $scope.mouseStartPos = new THREE.Vector2(event.clientX, event.clientY);
          $scope.mainGroupPosOnStart = new THREE.Vector2($scope.mainGroup.x(), $scope.mainGroup.y());
        });

//        $($scope.backgroundRect.node, $scope.rect.node, $element).on('mousemove', function(event) {
        $element.on('mousemove', function(event) {
          if($scope.inMove) {
            var move = new THREE.Vector2(event.clientX, event.clientY).sub($scope.mouseStartPos).add($scope.mainGroupPosOnStart)

            move.x = constrain(move.x, $scope.box.minX, $scope.box.maxX);
            move.y = constrain(move.y, $scope.box.minY, $scope.box.maxY);

            $scope.mainGroup.move(move.x, move.y);

            $scope.slide.x = 2.0*(move.x-$scope.box.originalX)/($scope.box.maxX-$scope.box.minX);
            $scope.slide.y = -2.0*(move.y-$scope.box.originalY)/($scope.box.maxY-$scope.box.minY);
            $scope.$emit('field-viewer-settings:slide-grid', $scope.slide);
          }
        });

        $element.on('mouseup', function(event) {
          $scope.inMove = false;
        });

      };

      buildSvg();
    }
  };
}]);
