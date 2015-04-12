/**********************************************************************

 File     : signal-slider.js
 Project  : N Simulator Library
 Purpose  : Source file for an N signal viewer component.
 Revisions: Original definition by Lawrence Gunn.
            2015/04/09

 Notes    : This is for setting and modifying display limits. On change this emits
            'graph-controls:range-modification' with the minimum and maximum values
            (currently as a fraction with values between 0.0 and 1.0 respectively).

 Copyright (c) 2015 by Lawrence Gunn
 All Rights Reserved.

 */
'use strict';

angular.module('nSimulationApp').directive('signalSlider', [function() {
  return {
    restrict: 'E',
    templateUrl: 'src/components/signal-slider/signal-slider.html',
    scope: {
      signals: '=signals',
      rangeMin: '=rangeMin',
      rangeMax: '=rangeMax'
    },
    controller: ['ComponentExtensions', '$scope', '$element', '$attrs', '$timeout', function (ComponentExtensions, $scope, $element, $attrs, $timeout) {
      ComponentExtensions.initialize(this, 'signalSlider', $scope, $element, $attrs);

      // The min and max values are a ratio from 0.0 to 1.0.
      $scope.min = 0.0;
      $scope.max = 1.0;

      // The minimum and maximum time values, defaulted ot something reasonable.
      $scope.minTime = 0.0;
      $scope.maxTime = 1.0;

      // The label string values.
      $scope.timeMinLabel = N.toFixed($scope.minTime);
      $scope.timeMaxLabel = N.toFixed($scope.maxTime);

      $scope.onRangeModification = function(min, max) {
        // Broadcast the event.
        $scope.min = min;
        $scope.max = max;
        $scope.signals.onRangeChange.dispatch(min, max);
        $scope.updateLabels();
      };

      $scope.setRangeLimits = function(minLimit, maxLimit) {
        $scope.minTime = minLimit;
        $scope.maxTime = maxLimit;
        $scope.updateLabels();
      };

      $scope.updateLabels = function() {
        $timeout(function() {
          var minLabel = ($scope.rangeMax-$scope.rangeMin)*$scope.min+$scope.rangeMin;
          var maxLabel = ($scope.rangeMax-$scope.rangeMin)*$scope.max+$scope.rangeMin;
          $scope.timeMinLabel = minLabel;
          $scope.timeMaxLabel = maxLabel;
        });
      };

    }],
    link: function ($scope, $element, $attrs, ctrl) {

      $element.find('.range-slider').slider({
        min: 0,
        max: 100,
        values: [0, 100],
        range: true,
        slide: function (event, ui) {
          var min = ui.values[0];
          var max = ui.values[1];
          $scope.onRangeModification(min / 100, max / 100);

          // Update the pan slider.
          var diff = max - min;
          var slider = $(ui.handle.parentElement.parentElement).find('.pan-slider');
          slider.slider(diff === 100 ? 'disable' : 'enable');
          slider.slider('option', {max: 100 - (diff), values: [min]});
        }
      });

      $element.find('.pan-slider').slider({
        min: 0,
        max: 100,
        values: [50],
        slide: function (event, ui) {
          var rangeSlider = $(ui.handle.parentElement.parentElement).find('.range-slider');
          var rangeValues = rangeSlider.slider('values');
          var diff = rangeValues[1] - rangeValues[0];

          var min = ui.values[0];
          var minLimit = (100 - diff - 1);
          if (min > minLimit) {
            min = minLimit;
          }
          var max = (ui.values[0] + diff);
          if (max > 100) {
            max = 100;
          }

          rangeSlider.slider('option', {values: [ui.values[0], ui.values[0] + diff]});
          $scope.onRangeModification(min / 100, max / 100);
        }
      }).find('span').append('<span class="glyphicon glyphicon-resize-horizontal" aria-hidden="true"></span>');

      $element.find('.pan-slider a').html('Pan');
      $element.find('.pan-slider').slider('disable');
      $scope.updateLabels();
    }
  }
}]);

