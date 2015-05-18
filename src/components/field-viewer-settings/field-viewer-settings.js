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

angular.module('nSimulationApp').directive('fieldViewerSettings', [function() {
  return {
    restrict: 'E',
    scope: {
      availableFields: '=availableFields',
      currentField: '=currentField'
    },
    templateUrl: 'src/components/field-viewer-settings/field-viewer-settings.html',
    controller: ['ComponentExtensions', '$scope', '$element', '$attrs', '$timeout', function (ComponentExtensions, $scope, $element, $attrs, $timeout) {
      ComponentExtensions.initialize(this, 'fieldViewerSettings', $scope, $element, $attrs);

      $scope.setFieldType = function(newField) {
        $scope.currentField = newField.name;
      }

    }],
    link: function($scope, $element, $attrs, ctrl) {
    }
  };
}]);
