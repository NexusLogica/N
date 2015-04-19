/**********************************************************************

File     : header.js
Project  : N Simulator Library
Purpose  : Source file for a standard header.
Revisions: Original definition by Lawrence Gunn.
           2014/08/12

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

angular.module('nSimulationApp').directive('header', [function() {
  return {
    restrict: 'E',
    scope: {
      currentPage: '@currentPage',
      projectName: '@projectName',
      shellVisible: '=shellVisible'
    },
    templateUrl: 'src/components/header/header.html',
    controller: ['ComponentExtensions', '$scope', '$element', '$attrs', '$location', function (ComponentExtensions, $scope, $element, $attrs, $location) {
      ComponentExtensions.initialize(this, 'header', $scope, $element, $attrs);

      $scope.navigateTo = function(locationName) {
        $location.path(locationName);
      };

      $scope.newOf = function(newTypeOf) {
        $scope.$emit('n-app:create-new', newTypeOf);
      };

      $scope.shellVisible = true;
      $scope.toggleShell = function() {
        $scope.shellVisible = !$scope.shellVisible;
      }

    }],
    link: function($scope, $element, $attrs) {
    }
  };
}]);
