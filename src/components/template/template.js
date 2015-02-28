/**********************************************************************

File     : [template].js
Project  : N Simulator Library
Purpose  : Source file for a [template] component.
Revisions: Original definition by Lawrence Gunn.
           2014/01/01

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

angular.module('nSimulationApp').directive('[templateCamel]', [function() {
  return {
    restrict: 'E',
    templateUrl: 'src/components/[template]/[template].html',
    controller: ['ComponentExtensions', '$scope', '$element', '$attrs', '$timeout', function (ComponentExtensions, $scope, $element, $attrs, $timeout) {
      ComponentExtensions.initialize(this, '[templateCamel]', $scope, $element, $attrs);


    }],
    link: function($scope, $element, $attrs, ctrl) {

    }
  };
}]);
