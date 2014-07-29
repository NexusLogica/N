/**********************************************************************

File     : pi-workbench-test-panel.js
Project  : N Simulator Library
Purpose  : Source file for pi workbench test panel component.
Revisions: Original definition by Lawrence Gunn.
           2014/07/23

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

angular.module('nSimApp.directives').directive('piWorkbenchTestPanel', [function() {
  return {
    restrict: 'E',
    scope: {
      test: '=test'
    },
    templateUrl: 'partials/pi-workbench-test-panel.html',
    controller: ['$scope', function ($scope) {
      $scope.propertiesCopy = {};

      $scope.inputTypes = [ { name: 'Voltage', type: 'voltage', units: 'millivolts' }, { name: 'Spiking', type: 'spiking', units: 'Hertz' } ];
      $scope.signalTypes = [ { name: 'Voltage', type: 'voltage', units: 'millivolts' }, { name: 'Spiking', type: 'spiking', units: 'Hertz' } ];

      $scope.amplitudeUnits = function(input) {
        return _.find($scope.inputTypes, function(inputType) { return (inputType.type = input); }).units;
      }

      $scope.targetInputSignalId = '';

      $scope.labelWidth = 'col-sm-6';

    }],
    link: function($scope, $element, $attrs) {

      $scope.showPropertiesEdit = function() {
        $scope.propertiesCopy = { name: $scope.test.name, description: $scope.test.description };
        $element.find('.properties-edit').modal('show');
      }

      $scope.addInputSignal = function() {
        var inputSignal = $scope.test.addInputSignal();
        $scope.showInputSignalEdit(test.id);
      }

      $scope.showInputSignalEdit = function(test) {
        $scope.targetInputSignalId = test.id;
        $element.find('.input-signal-edit').modal('show');
      }

      $scope.saveProperties = function() {
        $scope.test.name = $scope.propertiesCopy.name;
        $scope.test.description = $scope.propertiesCopy.description;
        $element.find('.properties-edit').modal('hide');
      }
    }
  };
}]);
