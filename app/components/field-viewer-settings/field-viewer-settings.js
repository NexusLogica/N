/**********************************************************************

File     : field-viewer-settings.js
Project  : N Simulator Library
Purpose  : Source file for a field viewer settings component.
Revisions: Original definition by Lawrence Gunn.
           2014/09/05

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

angular.module('nSimApp.directives').directive('fieldViewerSettings', [function() {
  return {
    restrict: 'E',
    templateUrl: 'components/field-viewer-settings/field-viewer-settings.html',
    controller: ['ComponentExtensions', '$scope', '$element', '$attrs', '$timeout', function (ComponentExtensions, $scope, $element, $attrs, $timeout) {
      ComponentExtensions.initialize(this, 'fieldViewerSettings', $scope, $element, $attrs);

      $scope.availableFields = [{
        name: 'Single charge',
        className: 'N.Bach.SingleChargeScene'
      },{
        name: 'Two charge field',
        className: 'N.Bach.MultipleChargeScene'
      }];

      $scope.activeField = _.clone($scope.availableFields[0]);

//      $scope.field = new N.Bach.CylindricalField();
//      $scope.grid  = new N.Bach.FieldGrid();
//      $scope.scene = new N.Bach.FieldScene();

      $scope.setFieldType = function(available) {
        $scope.activeField = available;
      }

    }],
    link: function($scope, $element, $attrs, ctrl) {

    }
  };
}]);
