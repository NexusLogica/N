/**********************************************************************

File     : pi-viewer-page.js
Project  : N Simulator Library
Purpose  : Source file for the simulation view page.
Revisions: Original definition by Lawrence Gunn.
           2015/04/29

Copyright (c) 2015 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

angular.module('nSimulationApp').directive('piViewerPage', [function() {
  return {
    restrict: 'E',
    //scope: {
    //},
    controller: ['ComponentExtensions', '$scope', '$element', '$attrs', '$timeout', '$compile', '$routeParams', function (ComponentExtensions, $scope, $element, $attrs, $timeout, $compile, $routeParams) {
      ComponentExtensions.initialize(this, 'piViewerPage', $scope, $element, $attrs);

      $scope.scriptPath = '';
      if($routeParams.src) {
        $scope.scriptPath = $routeParams.src;
      }

    }],
    link: function($scope, $element, $attrs, $ctrl) {

    }
  };
}]);
