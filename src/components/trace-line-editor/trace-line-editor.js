/**********************************************************************

 File     : trace-line-editor.js
 Project  : N Simulator Library
 Purpose  : Source file for an N signal viewer component.
 Revisions: Original definition by Lawrence Gunn.
            2015/04/20

 Copyright (c) 2015 by Lawrence Gunn
 All Rights Reserved.

 */
'use strict';

angular.module('nSimulationApp').directive('traceLineEditor', [function() {
  return {
    restrict: 'E',
    templateUrl: 'src/components/trace-line-editor/trace-line-editor.html',
    scope: {
      signals: '=signals',
      scene: '=scene'
    },
    controller: ['ComponentExtensions', '$scope', '$element', '$attrs', '$timeout', function (ComponentExtensions, $scope, $element, $attrs, $timeout) {
      ComponentExtensions.initialize(this, 'traceLineEditor', $scope, $element, $attrs);

    }],
    link: function ($scope, $element, $attrs, ctrl) {

      var getConnections = function() {
        $scope.connections = [];
        var connections = $scope.scene.piNetwork.network.connections;

        for(var i=0; i<connections.length; i++) {
          $scope.connections.push(connections[i]);
        }
      };

      getConnections();

      $scope.edit = function() {
        var connection = $element.find('select option:selected').scope().connection;
        var piComponents = N.fromConnectionPaths($scope.scene.piNetwork, connection.path);

        var input = piComponents.source;
        var output = piComponents.sink;
        input.path.addClass('highlight-component');
        output.path.addClass('soften-component');
      };

      $scope.done = function() {
        $scope.$emit('traceLineEditor:done');
      };
    }
  }
}]);

