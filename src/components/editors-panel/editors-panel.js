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
      signals: '=signals',
      scriptHost: '=scriptHost'
    },
    controller: ['ComponentExtensions', '$scope', '$element', '$attrs', '$timeout', '$compile', function (ComponentExtensions, $scope, $element, $attrs, $timeout, $compile) {
      ComponentExtensions.initialize(this, 'editorsPanel', $scope, $element, $attrs);

      $scope.editorsByGuid = {};
      $scope.activeEditor = '';

      $scope.addOutputLog = function() {
        var guid = N.generateUUID();
        var editor = {
          displayShort: 'Output',
          sourcePath: 'Output',
          source: { guid: guid }
        };

        editor.guid = guid;
        $scope.activeEditor = guid;
        $scope.editorsByGuid[guid] = editor;

        var html = $compile('<output-log class="'+guid+'" signals="signals" ng-show="activeEditor === \''+guid+'\'"></output-log>')($scope);
        $element.find('.editors').append(html);
      };

      $scope.addEditor = function(source) {
        var editor = {
          displayShort: source.displayName,
          sourcePath: source.source,
          source: source,
          signals: {
            save: new signals.Signal()
          }
        };

        var guid = editor.source.guid;
        editor.guid = guid;
        $scope.activeEditor = guid;
        $scope.editorsByGuid[guid] = editor;

        var html = $compile('<n-editor class="'+guid+'" edit="editorsByGuid.'+guid+'" file-signals="editor.signals" ide-signals="signals" ng-show="activeEditor === \''+guid+'\'"></n-editor>')($scope);
        $element.find('.editors').append(html);
      };

      $scope.addHistoryViewer = function(history) {
        var editor = {
          displayShort: 'Signals',
          sourcePath: history.source,
          source: history
        };

        var guid = editor.source.guid;
        editor.guid = guid;
        $scope.activeEditor = guid;
        $scope.editorsByGuid[guid] = editor;


        var html = $compile('<signal-viewer class="'+guid+'" history="editorsByGuid.'+guid+'" file-signals="editor.signals" ide-signals="signals" ng-show="activeEditor === \''+guid+'\'"></signal-viewer>')($scope);
        $element.find('.editors').append(html);
      };

      $scope.addNetworkViewer = function(netSys) {
        var editor = {
          displayShort: netSys.name,
          source: { guid: netSys.id }
        };

        if(netSys.className === 'N.System') {
          editor.network = netSys.network;
          editor.system = netSys;
        } else {
          editor.network = netSys;
        }

        var guid = 'guid'+editor.source.guid;
        editor.guid = guid;
        $scope.activeEditor = guid;
        $scope.editorsByGuid[guid] = editor;


        var html = $compile('<pi-editor class="'+guid+'" network="editorsByGuid.'+guid+'.network" script-host="scriptHost" system="editorsByGuid.'+guid+'.system" file-signals="editor.signals" ide-signals="signals" ng-show="activeEditor === \''+guid+'\'"></pi-editor>')($scope);
        $element.find('.editors').append(html);
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

      $scope.showEditor = function(editor) {
        $scope.activeEditor = editor.guid;
      };

      $scope.addOutputLog();

    }],
    link: function($scope, $element, $attrs, ctrl) {
    }
  };
}]);
