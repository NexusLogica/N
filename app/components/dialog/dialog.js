/**********************************************************************

File     : dialog.js
Project  : N Simulator Library
Purpose  : Source file for a dialog component.
Revisions: Original definition by Lawrence Gunn.
           2014/08/28

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

angular.module('nSimApp.directives').directive('dialog', [function() {
  return {
    restrict: 'E',
    scope: {
      contentsTemplateId: '@contentsTemplateId'
    },
//    templateUrl: 'components/dialog/dialog.html',
    controller: ['$scope', '$element', '$attrs', '$modal', '$templateCache', function ($scope, $element, $attrs, $modal, $templateCache) {

      // get the temlate elements from the template URL and refresh the template cache
      var dialogTemplates = {
        'modal-window': 'template/modal/window.html',
        'modal-backdrop': 'template/modal/backdrop.html'
      };
      dialogTemplates[$scope.contentsTemplateId] =  $scope.contentsTemplateId;

      _.each(dialogTemplates, function(cacheId, viewId) {

        //get the template element
        var holderElement = $element.find('#' + viewId);
        if(!holderElement.length) {
          holderElement = $('body').find('#' + viewId);
        }
        if (holderElement.length) {
          if (!$templateCache.get(cacheId)) {
            //get its markup
            var holderElementHtml = holderElement.html();
            //add to the tempalteCache
            $templateCache.put(cacheId, holderElementHtml);
          }

          //remove the element from the DOM
          holderElement.remove();
        }
      });

      var DialogInstanceController = ['$scope', '$modalInstance', 'options', function($scope, $modalInstance, context) {
        $scope.context = context;

        $scope.ok = function () {
          $modalInstance.close('ok');
        };

        $scope.cancel = function () {
          $modalInstance.dismiss('cancel');
        };
      }];

      $scope.open = function (data) {

        var modalInstance = $modal.open({
          templateUrl: $scope.contentsTemplateId,
          controller: DialogInstanceController,
          windowClass: 'pi-dialog',
          size: $scope.size,
          resolve: {
            options: function () {
              return data;
            }
          }
        });

        modalInstance.result.then(function (result) {
          $scope.result = result;
        }, function () {
          console.log('Modal dismissed at: ' + new Date());
        });
      };
    }],
    link: function($scope, $element, $attrs, controller) {
      $scope.size = $attrs.size ? $attrs.size : 'sm';

      var exposeName = $attrs.exposeToParent;
      if (exposeName) {
        var parentScope = $scope.$parent;
        parentScope[exposeName] = $scope;
      }
    }
  }
}]);
