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

angular.module('nSimApp.directives').directive('fieldViewerPanel', [function() {
  return {
    restrict: 'E',
    templateUrl: 'components/field-viewer-panel/field-viewer-panel.html',
    controller: ['ComponentExtensions', '$scope', '$element', '$attrs', '$timeout', function (ComponentExtensions, $scope, $element, $attrs, $timeout) {
      ComponentExtensions.initialize(this, 'fieldViewerPanel', $scope, $element, $attrs);

      $scope.stopRendering = false;

    }],
    link: function($scope, $element, $attrs, ctrl) {

    }
  };
}]);
