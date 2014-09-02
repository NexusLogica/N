/**********************************************************************

File     : pi-canvas3d.js
Project  : N Simulator Library
Purpose  : Source file for a pi-canvas-3d component.
Revisions: Original definition by Lawrence Gunn.
           2014/09/01

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

angular.module('nSimApp.directives').directive('piCanvas3d', [function() {
  return {
    restrict: 'E',
    templateUrl: 'components/pi-canvas3d/pi-canvas3d.html',
    controller: ['ComponentExtensions', '$scope', '$element', '$attrs', '$timeout', function (ComponentExtensions, $scope, $element, $attrs, $timeout) {
      ComponentExtensions.initialize(this, 'piCanvas3d', $scope, $element, $attrs);


    }],
    link: function($scope, $element, $attrs, ctrl) {

    }
  };
}]);
