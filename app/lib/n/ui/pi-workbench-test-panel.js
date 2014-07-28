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

      $scope.inputTypes = [ { name: 'Voltage', type: 'voltage' }, { name: 'Spiking', type: 'spiking' } ];

    }],
    link: function($scope, $element, $attrs) {

      $scope.showPropertiesEdit = function() {
        $scope.propertiesCopy = { name: $scope.test.name, description: $scope.test.description };
        $element.find('.properties-edit').modal('show');
      }

      $scope.saveProperties = function() {
        $scope.test.name = $scope.propertiesCopy.name;
        $scope.test.description = $scope.propertiesCopy.description;
        $element.find('.properties-edit').modal('hide');
      }
    }
  };
}]);
