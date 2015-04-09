/**********************************************************************

File     : signal-viewer.js
Project  : N Simulator Library
Purpose  : Source file for an N signal viewer component.
Revisions: Original definition by Lawrence Gunn.
           2015/04/09

Copyright (c) 2015 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

angular.module('nSimulationApp').directive('signalViewer', [function() {
  return {
    restrict: 'E',
    templateUrl: 'src/components/signal-viewer/signal-viewer.html',
    scope: {
      signals: '=signals',
      ideSignals: '=ideSignals',
      history: '=history'
    },
    controller: ['ComponentExtensions', '$scope', '$element', '$attrs', '$timeout', function (ComponentExtensions, $scope, $element, $attrs, $timeout) {
      ComponentExtensions.initialize(this, 'signalViewer', $scope, $element, $attrs);



    }],
    link: function($scope, $element, $attrs, ctrl) {
      $scope.signalGraphScene = new N.UI.SignalGraphScene();

      var history = $scope.history.source.output;
      var signal;
      for(var key in history.inputs) {
        if(history.inputs.hasOwnProperty(key)) {
          signal = history.inputs[key];
          $scope.signalGraphScene.addTrace(signal);
        }
      }

      for(key in history.outputs) {
        if(history.outputs.hasOwnProperty(key)) {
          signal = history.outputs[key];
          $scope.signalGraphScene.addTrace(signal);
        }
      }
    }
  };
}]);
