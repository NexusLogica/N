/**********************************************************************

File     : pi-editor.js
Project  : N Simulator Library
Purpose  : Source file for Pi network and neuron viewer component.
Revisions: Original definition by Lawrence Gunn.
           2015/04/18

Copyright (c) 2015 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

angular.module('nSimulationApp').directive('piEditor', [function() {
  return {
    restrict: 'E',
    templateUrl: 'src/components/pi-editor/pi-editor.html',
    scope: {
      signals: '=signals',
      system: '=system',
      network: '=network',
      scriptHost: '=scriptHost'
    },
    controller: ['ComponentExtensions', '$scope', '$element', '$attrs', '$timeout', function (ComponentExtensions, $scope, $element, $attrs, $timeout) {
      ComponentExtensions.initialize(this, 'piEditor', $scope, $element, $attrs);

      $scope.sceneSignals = {
        'component-move': new signals.Signal(),
        'component-click': new signals.Signal(),
        'connection-enter': new signals.Signal(),
        'connection-move': new signals.Signal(),
        'connection-leave': new signals.Signal(),
        'connection-click': new signals.Signal(),
        'background-move': new signals.Signal(),
        'background-mouse-down': new signals.Signal(),
        'background-mouse-up': new signals.Signal(),
        'background-click': new signals.Signal()
      };

      $scope.activeUI = null;

      $scope.autoShowTraceEditor = function () {
        $timeout(function () {
          $scope.traceEdit();
        }, 100);
      };

    }],
    link: function($scope, $element, $attrs, ctrl) {
      $scope.view = { scene: new N.UI.NetworkScene($scope.sceneSignals) };
      $scope.view.scene.load($scope.network, $scope.scriptHost).then(function() {
          $scope.view.scene.layout();
        }, function(err) {
          debugger;
          N.log('ERROR: PiEditor.link: Unable to load the network display - '+err.description);
        }
      ).catch(function(err) {
        debugger;
          N.log('CATCH: PiEditor.link: Unable to load the network display - '+err.description);
      });

      $scope.traceEdit = function() {
        $scope.activeUI = 'traceEditor';
        $scope.$broadcast('traceLineEditor:begin');
      };
      $scope.$on('traceLineEditor:closing', function() {
        $scope.activeUI = null;
      });
    }
  };
}]);
