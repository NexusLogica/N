/**********************************************************************

File     : pi-viewer.js
Project  : N Simulator Library
Purpose  : Source file for Pi network and neuron viewer component.
Revisions: Original definition by Lawrence Gunn.
           2015/04/18

Copyright (c) 2015 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

angular.module('nSimulationApp').directive('piViewer', [function() {
  return {
    restrict: 'E',
    templateUrl: 'src/components/pi-viewer/pi-viewer.html',
    scope: {
      signals: '=signals',
      system: '=system',
      network: '=network'
    },
    controller: ['ComponentExtensions', '$scope', '$element', '$attrs', '$timeout', function (ComponentExtensions, $scope, $element, $attrs, $timeout) {
      ComponentExtensions.initialize(this, 'piViewer', $scope, $element, $attrs);

    }],
    link: function($scope, $element, $attrs, ctrl) {
      $scope.view = { scene: new N.UI.NetworkScene() };

      $scope.view.scene.layout($scope.network, $scope.network.display.renderMappings);
    }
  };
}]);
