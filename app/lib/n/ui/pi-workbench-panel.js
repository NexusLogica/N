/**********************************************************************

File     : pi-workbench-test.js
Project  : N Simulator Library
Purpose  : Source file for pi workbench test controller.
Revisions: Original definition by Lawrence Gunn.
           2014/07/19

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

angular.module('nSimApp.directives').directive('piWorkbenchPanel', [function() {
  return {
    restrict: 'E',
    scope: {
      workbenchScene: '=workbenchScene'
    },
    templateUrl: 'partials/pi-workbench-panel.html',
    controller: ['$scope', '$timeout', function ($scope, $timeout) {

      $scope.workbench = $scope.workbenchScene.workbench;
      $scope.testStatus = { updateRequired: false };

      $scope.$on('pi-canvas:event-broadcast-request', function(broadcastEvent, event, obj) {
        broadcastEvent.stopPropagation();
        $scope.$broadcast('pi-canvas:event', event, obj);
      });

      // *** Header: for test selection and creating new tests
      //
      $scope.tests = $scope.workbench.tests;
      $scope.selectedTestId = ($scope.tests.length > 0 ? $scope.tests[0].id : '');

      $scope.onTestSelect = function(testId) {
        $scope.selectedTestId = testId;
      }

      $scope.testNameFromId = function(id) {
        return _.find($scope.tests, function(test) { return test.id === id; }).name;
      }

      $scope.testFromId = function(id) {
        return _.find($scope.tests, function(test) { return test.id === id; });
      }

      $scope.onNextTest = function() {
        var i = _.findIndex($scope.tests, function(test) { return test.id === $scope.selectedTestId; });
        i++;
        if(i === $scope.tests.length) { i = 0; }
        $scope.selectedTestId = $scope.tests[i].id;
      }

      $scope.onPreviousTest = function() {
        var i = _.findIndex($scope.tests, function(test) { return test.id === $scope.selectedTestId; });
        i--;
        if(i < 0) { i = $scope.tests.length-1; }
        $scope.selectedTestId = $scope.tests[i].id;
      }

      $scope.onNewTest = function() {
        var test = $scope.workbench.addTest();
        $scope.selectedTestId = test.id;
        test.name = 'Test '+$scope.workbench.tests.length;
      }

      $scope.$watch('selectedTestId', function(testId) {
        if(!_.isEmpty(testId)) {
          var test = $scope.testFromId(testId);
          $scope.workbenchScene.showTest(test);
        }
      });

      $scope.$watch('testStatus.updateRequired', function(updated) {
        if(updated) {
          $scope.testStatus.updateRequired = false;
          $scope.workbenchScene.testUpdated();
        }
      });
    }],
    link: function(scope, element, attrs) {

    }
  };
}]);
