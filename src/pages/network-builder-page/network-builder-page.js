/**********************************************************************

File     : network-builder-page.js
Project  : N Simulator Library
Purpose  : Source file for the simulation host page.
Revisions: Original definition by Lawrence Gunn.
           2014/08/27

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

angular.module('nSimulationApp').directive('networkBuilderPage', [function() {
  return {
    restrict: 'E',
    //scope: {
    //},
    controller: ['ComponentExtensions', '$scope', '$element', '$attrs', '$timeout', '$compile', function (ComponentExtensions, $scope, $element, $attrs, $timeout, $compile) {
      ComponentExtensions.initialize(this, 'networkBuilderPage', $scope, $element, $attrs);

      // Ensure the services are loaded.
      N.NWS.WebServices.Load();

      $scope.panels = {};

      $scope.$on('n-app:create-new', function(event, typeOfNew) {
        if(typeOfNew === 'workbench') {
          $scope.insertComponent('hi')
        } else if(typeOfNew === 'network-builder') {
          $scope.insertComponent('network-builder')
        }
      });

      $scope.insertComponent = function(componentType) {

        var panelData = { name: 'First', id: N.generateUUID(), show: true };
        $scope.panels[panelData.id] = panelData;
        $scope.panelid = panelData.id;

        //$scope.panelData = { name: 'ASDFASDF' };
        var html = $compile('<'+componentType+' class="container" panel-data="panels[\''+panelData.id+'\']"></'+componentType+'>')($scope);
        $scope.appendHtml(html);
      }

    }],
    link: function($scope, $element, $attrs, $ctrl) {

      $scope.appendHtml = function(html) {
        $element.find('.sim-container.container').append(html);
      }
    }
  };
}]);
