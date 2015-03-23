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

angular.module('nSimulationApp').directive('networkBuilder', [function() {
  return {
    restrict: 'E',
    templateUrl: 'src/components/network-builder/network-builder.html',
    controller: ['ComponentExtensions', '$scope', '$element', '$attrs', '$timeout', function (ComponentExtensions, $scope, $element, $attrs, $timeout) {
      ComponentExtensions.initialize(this, 'networkBuilder', $scope, $element, $attrs);

      $scope.signals = {
        'compartment-enter': new signals.Signal(),
        'compartment-leave': new signals.Signal(),
        'compartment-click': new signals.Signal()
      };

      $scope.build = {};

      $scope.openExisting = function() {
      };

      $scope.createNew = function() {
        $scope.build.network = new N.Network();
        $scope.$broadcast('network-builder:new');
      };

      $scope.doFullBuild = function() {

      };

    }],
    link: function($scope, $element, $attrs) {
      $element.find('.ace_editor').focus();
    }
  };
}]);
