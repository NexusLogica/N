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
      $scope.propertiesLabelWidth = 'col-sm-4';
      $scope.propertiesWidth = 'col-sm-10';

    }],
    link: function($scope, $element, $attrs) {

      $scope.showPropertiesEdit = function() {
        $scope.propertiesCopy = _.pick($scope.test, [ 'name', 'description', 'duration']);
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
        debugger;
        if(!$scope.testform.$valid) {
          $scope.formMessage = 'There are errors. Please fix them.';
          return;
        }

        if(_.find($scope.test.workbench.tests, function(test) {
          debugger;
          return (test.name === $scope.propertiesCopy.name && test.id !== $scope.test.id);
        })) {
          $scope.formMessage = 'The name '+$scope.propertiesCopy.name+' already exists';
          return;
        }
        _.assign($scope.test, $scope.propertiesCopy);
        $element.find('.properties-edit').modal('hide');
      }

      $scope.$on('pi-workbench-panel:show-properties', function(event, selectedTestId) {
        if($scope.test.id === selectedTestId) {
          $scope.showPropertiesEdit();
        }
      });
    }
  };
}]);
