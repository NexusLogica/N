/**********************************************************************

File     : pi-workbench-panel.js
Project  : N Simulator Library
Purpose  : Source file for pi workbench panel controller.
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
    controller: ['$scope', function ($scope) {
      $scope.$on('pi-canvas:event-broadcast-request', function(broadcastEvent, event, obj) {
        broadcastEvent.stopPropagation();
        $scope.$broadcast('pi-canvas:event', event, obj);
      });

    }],
    link: function(scope, element, attrs) {

    }
  };
}]);
