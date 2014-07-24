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
      console.log($scope);


    }],
    link: function(scope, element, attrs) {

    }
  };
}]);
