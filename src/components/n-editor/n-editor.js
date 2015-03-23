/**********************************************************************

File     : n-editor.js
Project  : N Simulator Library
Purpose  : Source file for an N editor component.
Revisions: Original definition by Lawrence Gunn.
           2015/03/20

Copyright (c) 2015 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

angular.module('nSimulationApp').directive('nEditor', [function() {
  return {
    restrict: 'E',
    templateUrl: 'src/components/n-editor/n-editor.html',
    scope: {
      signals: '=signals'
    },
    controller: ['ComponentExtensions', '$scope', '$element', '$attrs', '$timeout', function (ComponentExtensions, $scope, $element, $attrs, $timeout) {
      ComponentExtensions.initialize(this, 'nEditor', $scope, $element, $attrs);

      //$scope.$on('network-builder:new', function() {
      //  $timeout(function() {
      //    $scope.editor.focus();
      //  }, 100);
      //});



    }],
    link: function($scope, $element, $attrs, ctrl) {
      $scope.editor = ace.edit($element.find('.ace-editor').get(0));
      $scope.editor.setTheme('ace/theme/kuroir');
      $scope.editor.getSession().setMode('ace/mode/javascript');
      $scope.editor.on('focus', function() {
        $scope.signals['input-has-focus'].dispatch($scope);
      });

      $scope.signals['input-has-focus'].add(function(focusScope) {
        if(focusScope !== $scope) {
          $scope.editor.blur();
        }
      });
    }
  };
}]);
