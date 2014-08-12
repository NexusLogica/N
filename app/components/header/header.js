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

angular.module('nSimApp.directives').directive('header', [function() {
  return {
    restrict: 'E',
    scope: {
      currentPage: '@currentPage'
    },
    templateUrl: 'components/header/header.html',
    controller: ['$scope', '$location', function ($scope, $location) {

      $scope.navigateTo = function(locationName) {
        $location.path(locationName);
      }

    }],
    link: function($scope, $element, $attrs) {
    }
  };
}]);
