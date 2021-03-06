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

angular.module('nSimulationApp').directive('piWorkbenchTestPanel', [function() {
  return {
    restrict: 'E',
    scope: {
      test: '=test',
      testStatus: '=testStatus'
    },
    templateUrl: 'src/partials/pi-pi-workbench-test-panel.html',
    controller: ['$scope', '$timeout', function ($scope, $timeout) {
      $scope.propertiesCopy = {};

      $scope.inputTypes = [ { name: 'Voltage', type: 'voltage', units: 'millivolts' }, { name: 'Spiking', type: 'spiking', units: 'Hz' } ];
      $scope.signalTypes = [ { name: 'Voltage', type: 'voltage', units: 'millivolts' }, { name: 'Spiking', type: 'spiking', units: 'Hz' } ];

      $scope.amplitudeUnits = function(inputSignal) {
        return (inputSignal ? _.find($scope.inputTypes, function(inputType) { return (inputType.type === inputSignal.type); }).units : '');
      };

      $scope.targetInputSignalId = '';
      $scope.targetInputSignal = null;
      $scope.targetInputSignalCopy = null;
      $scope.builderFormStatus = {};
      $scope.connectionFormStatus = {};

      $scope.labelWidth = 'col-sm-6';
      $scope.propertiesLabelWidth = 'col-sm-4';
      $scope.propertiesWidth = 'col-sm-10';

      $scope.inputLayerSourceCompartments = [];
      $scope.formMessage = '';
      $scope.inputFormMessage = '';

      $scope.updateWorkbenchScene = function() {
        $scope.testStatus.runTest = true;
        $timeout(function() {
          $scope.testStatus.updateRequired = true;
        }, 1);
      }

    }],
    link: function($scope, $element, $attrs, $ctrls) {

      var pathToTraceId = function(path) {
        debugger;
        var paths = N.FromConnectionPaths($scope.test.workbench.network, path);

        // TODO: Need fix for default output 'main'
        return paths.source.neuron.name+'//'+paths.source.name+'//'+'main';
      }

      $scope.showPropertiesEdit = function() {
        $scope.propertiesCopy = _.pick($scope.test, [ 'name', 'description', 'duration']);
        $element.find('.properties-edit').modal('show');
      }

      $scope.addInputSignal = function() {
        var inputSignal = new N.WorkbenchTestInput();
        $scope.showInputSignalEdit(inputSignal);
      }

      $scope.saveProperties = function() {
        if(!$scope.testform.$valid) {
          $scope.formMessage = 'There are errors. Please fix them.';
          return;
        }

        if(_.find($scope.test.workbench.tests, function(test) {
          return (test.name === $scope.propertiesCopy.name && test.id !== $scope.test.id);
        })) {
          $scope.formMessage = 'The name '+$scope.propertiesCopy.name+' already exists';
          return;
        }
        _.assign($scope.test, $scope.propertiesCopy);
        $element.find('.properties-edit').modal('hide');
      }

      $scope.showInputSignalEdit = function(inputSignal) {
        fillCompartmentLists();
        $scope.targetInputSignalId = inputSignal.id;
        $scope.targetInputSignalCopy = inputSignal.clone();

        $element.find('.input-signal-edit').modal('show');
      }

      $scope.setInputSignalPath = function(path) {
        $scope.targetInputSignalCopy.connection = path;
      }

      $scope.runTest = function() {
        $scope.test.updateNetwork();
        $scope.updateWorkbenchScene();
      }

      $scope.saveInputSignal = function() {
        if($scope.connectionFormStatus.$invalid || $scope.builderFormStatus.$invalid) {
          if($scope.connectionFormStatus.$invalid) {
            $scope.inputFormMessage = 'Please select an input';
          }
          return;
        }
        $scope.inputFormMessage = '';

        var paths = N.fromConnectionPaths($scope.test.workbench.network, $scope.targetInputSignalCopy.connection);

        // TODO: Need fix for default output 'main'
        $scope.targetInputSignalCopy.compartmentPath = paths.source.getPath();
        $scope.targetInputSignalCopy.outputName = 'main';

        if(!$scope.targetInputSignalCopy.workbenchTest) {
           $scope.test.insertInputSignal($scope.targetInputSignalCopy);
        } else {
          _.assign($scope.test.inputSignalsById[$scope.targetInputSignalId], $scope.targetInputSignalCopy);
        }

        $element.find('.input-signal-edit').modal('hide');

        $scope.test.updateNetwork();
        $scope.updateWorkbenchScene();
      }

      $scope.$on('pi-pi-workbench-panel:show-properties', function(event, selectedTestId) {
        if($scope.test.id === selectedTestId) {
          $scope.showPropertiesEdit();
        }
      });

      $scope.$watch('test.id', function() {
        $scope.test.setAsActiveTest();
      });

      $scope.$watch('targetInputSignalCopy.connection', function(newVal) {
        var valid = !_.isEmpty(newVal);
        $scope.connectionFormStatus = { '$valid': valid, '$invalid': !valid }
      });

      $scope.prettyPath = function(path) {
        if(!path) {
          return '';
        }
        var paths = N.fromConnectionPaths($scope.test.workbench.network, path);
        var sink = paths.sink;
        return sink.neuron.name+' -> '+sink.name;
      }

      var fillCompartmentLists = function() {
        $scope.inputLayerSourceCompartments = [];
        var network = $scope.test.workbench.network.getNetworkByName('Inputs');
        _.forEach(network.neurons, function(neuron) {
          _.forEach(neuron.compartments, function(compartment) {
            _.forEach(compartment.outputConnections, function(connection) {
              $scope.inputLayerSourceCompartments.push({ compartment: compartment, connection: connection});
            });
          });
        });
      }
    }
  };
}]);
