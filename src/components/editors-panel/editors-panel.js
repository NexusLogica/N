/**********************************************************************

File     : editors-panel.js
Project  : N Simulator Library
Purpose  : Source file for an N editor component.
Revisions: Original definition by Lawrence Gunn.
           2015/03/24

Copyright (c) 2015 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

angular.module('nSimulationApp').directive('editorsPanel', [function() {
  return {
    restrict: 'E',
    templateUrl: 'src/components/editors-panel/editors-panel.html',
    scope: {
      sourceFiles: '=sourceFiles',
      signals: '=signals'
    },
    controller: ['ComponentExtensions', '$scope', '$element', '$attrs', '$timeout', '$compile', function (ComponentExtensions, $scope, $element, $attrs, $timeout, $compile) {
      ComponentExtensions.initialize(this, 'editorsPanel', $scope, $element, $attrs);

      $scope.editorsByGuid = {};
      $scope.activeEditor = '';

      $scope.addEditor = function(sourceFile) {
        var editor = {
          file: sourceFile,
          signals: {
            save: new signals.Signal()
          }
        };

        $scope.getActiveFile = function() {
          var file;
          if($scope.activeEditor) {
            file = $scope.editorsByGuid[$scope.activeEditor].file;
          }
          return file;
        };

        $scope.saveAllFilesToSourceFiles = function() {
          _.forEach($scope.editorsByGuid, function(editor) {
            editor.signals.save.dispatch();
          });
        };

        $scope.activeEditor = editor.file.guid;

        $scope.editorsByGuid[editor.file.guid] = editor;

        var html = $compile('<n-editor class="'+editor.file.guid+'" source-file="editorsByGuid.'+editor.file.guid+'" file-signals="editor.signals" ide-signals="signals" ng-show="activeEditor === \''+editor.file.guid+'\'"></n-editor>')($scope);
        $element.find('.editors').append(html);
      };


    }],
    link: function($scope, $element, $attrs, ctrl) {
    }
  };
}]);
