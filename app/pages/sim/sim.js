/**********************************************************************

File     : sim.js
Project  : N Simulator Library
Purpose  : Source file for the simulation host page.
Revisions: Original definition by Lawrence Gunn.
           2014/08/27

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

angular.module('nSimApp.directives').directive('sim', [function() {
  debugger;
  return {
    restrict: 'E',
    //scope: {
    //},
    controller: ['$scope', '$timeout', '$compile', function ($scope, $timeout, $compile) {

      $scope.$on('n-app:create-new', function(event, typeOfNew) {
        debugger;
        if(typeOfNew === 'workbench') {
          $scope.insertComponent('hi')
        }
      });

      $scope.insertComponent = function(componentType) {
        var html = $compile('<div class="container" >'+componentType+'</div>')($scope);
        $scope.appendHtml(html);
      }

    }],
    link: function($scope, $element, $attrs, $ctrl) {

      $scope.appendHtml = function(html) {
        $element.find('.sim-container.container').append(html);
      }
    }
  };
}]);
