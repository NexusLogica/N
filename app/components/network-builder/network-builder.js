/**********************************************************************

File     : network-builder.js
Project  : N Simulator Library
Purpose  : Source file for a network builder component.
Revisions: Original definition by Lawrence Gunn.
           2014/08/28

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

angular.module('nSimApp.directives').directive('networkBuilder', [function() {
  return {
    restrict: 'E',
    scope: {
      panelData: '=panelData'
    },
    templateUrl: 'components/network-builder/network-builder.html',
    controller: ['$scope', '$timeout', function ($scope, $timeout) {
      $timeout(function() { $scope.panelData.name = 'blah blah'; }, 2000);

      $scope.options = { message: 'Hi there', content: 'Blah blah blah blah blah blah blah blah blah blah blah blah blah.', okText: 'Ok', cancelText: 'Cancel' };
    }],
    link: function($scope, $element, $attrs) {
      $scope.openDialog = function() {

        $scope.administrationDialog.open($scope.options);
      }
    }
  };
}]);
