/**********************************************************************

File     : pi-viewer-page.js
Project  : N Simulator Library
Purpose  : Source file for the simulation host page.
Revisions: Original definition by Lawrence Gunn.
           2014/08/27

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

angular.module('nSimulationApp').directive('networkBuilderPage', [function() {
  return {
    restrict: 'E',
    //scope: {
    //},
    controller: ['ComponentExtensions', '$scope', '$element', '$attrs', '$timeout', '$compile', '$routeParams', function (ComponentExtensions, $scope, $element, $attrs, $timeout, $compile, $routeParams) {
      ComponentExtensions.initialize(this, 'networkBuilderPage', $scope, $element, $attrs);

      $scope.scriptPath = '';
      if($routeParams.source) {
        $scope.scriptPath = $routeParams.run+'.sh';
      }

    }],
    link: function($scope, $element, $attrs, $ctrl) {

    }
  };
}]);
