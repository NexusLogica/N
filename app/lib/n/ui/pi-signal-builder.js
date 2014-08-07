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
      signalBuilder: '=signalBuilder',
      totalTime: '=totalTime',
      builderFormStatus: '=builderFormStatus'
    },
    templateUrl: 'partials/pi-signal-builder.html',
    controller: ['$scope', '$timeout', function ($scope, $timeout) {

      $scope.inputTypes = [ { name: 'Voltage', type: 'voltage', units: 'millivolts' }, { name: 'Spiking', type: 'spiking', units: 'Hertz' } ];
      $scope.signalTypes = [ { name: 'Voltage', type: 'voltage', units: 'millivolts' }, { name: 'Spiking', type: 'spiking', units: 'Hertz' } ];

      $scope.amplitudeUnits = function(inputSignal) {
        return (inputSignal ? _.find($scope.inputTypes, function(inputType) { return (inputType.type === inputSignal.type); }).units : '');
      }

      $scope.labelWidth = 'col-sm-6';
      $scope.propertiesLabelWidth = 'col-sm-4';
      $scope.propertiesWidth = 'col-sm-10';

      $scope.signal = new N.AnalogSignal();
      $scope.signalScene = new N.UI.SignalTraceScene();
      $scope.signalScene.SetSignal($scope.signal);

    }],
    link: function($scope, $element, $attrs) {
      $scope.$watch('[ signalBuilder.start, signalBuilder.duration, signalBuilder.amplitude, signalBuilder.type, signalBuilder.offset ]', function(newVal) {
          if($scope.signalBuilder) {
            $scope.signalBuilder.buildSignal($scope.signal, $scope.totalTime);
            $scope.signalScene.TraceRenderer.Update();
            _.assign($scope.builderFormStatus, _.pick($scope.builderForm, ['$valid', '$pristine', '$invalid', '$dirty']));
          }
        }, 10);

      // TODO: Fix this so that the canvas supplies the scene with its svgParent.
      var svgParent = $element.find('g.pi-signal-trace').get(0).instance;
      $scope.signalScene.Render(svgParent);
    }
  };
}]);
