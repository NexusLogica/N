/**********************************************************************

File     : pi-signal-builder.js
Project  : N Simulator Library
Purpose  : Source file for pi signal builder panel component.
Revisions: Original definition by Lawrence Gunn.
           2014/07/30

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

/**
 * This is the N simulator.
 * @module N
 */
var N = N || {};
N.UI = N.UI || {};

angular.module('nSimApp.directives').directive('piSignalBuilder', [function() {
  return {
    restrict: 'E',
    scope: {
      signalBuilder: '=signalBuilder'
    },
    templateUrl: 'partials/pi-signal-builder.html',
    controller: ['$scope', function ($scope) {

      $scope.inputTypes = [ { name: 'Voltage', type: 'voltage', units: 'millivolts' }, { name: 'Spiking', type: 'spiking', units: 'Hertz' } ];
      $scope.signalTypes = [ { name: 'Voltage', type: 'voltage', units: 'millivolts' }, { name: 'Spiking', type: 'spiking', units: 'Hertz' } ];

      $scope.amplitudeUnits = function(inputSignal) {
        return (inputSignal ? _.find($scope.inputTypes, function(inputType) { return (inputType.type === inputSignal.type); }).units : '');
      }

      $scope.labelWidth = 'col-sm-6';
      $scope.propertiesLabelWidth = 'col-sm-4';
      $scope.propertiesWidth = 'col-sm-10';

    }],
    link: function($scope, $element, $attrs) {

    }
  };
}]);
