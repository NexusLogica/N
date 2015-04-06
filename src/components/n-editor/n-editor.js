/**********************************************************************

File     : n-editor.js
Project  : N Simulator Library
Purpose  : Source file for an N editor component.
Revisions: Original definition by Lawrence Gunn.
           2015/03/20

Copyright (c) 2015 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

angular.module('nSimulationApp').directive('nEditor', [function() {
  return {
    restrict: 'E',
    templateUrl: 'src/components/n-editor/n-editor.html',
    scope: {
      signals: '=signals',
      ideSignals: '=ideSignals',
      edit: '=edit'
    },
    controller: ['ComponentExtensions', '$scope', '$element', '$attrs', '$timeout', function (ComponentExtensions, $scope, $element, $attrs, $timeout) {
      ComponentExtensions.initialize(this, 'nEditor', $scope, $element, $attrs);

      //$scope.$on('network-builder:new', function() {
      //  $timeout(function() {
      //    $scope.editor.focus();
      //  }, 100);
      //});



    }],
    link: function($scope, $element, $attrs, ctrl) {
      $scope.editor = ace.edit($element.find('.ace-editor').get(0));
      $scope.editor.setTheme('ace/theme/kuroir');
      $scope.editor.getSession().setMode('ace/mode/javascript');
      $scope.editor.getSession().setTabSize(2);
      $scope.editor.on('focus', function() {
        $scope.ideSignals['input-has-focus'].dispatch($scope);
      });

      $scope.ideSignals['input-has-focus'].add(function(focusScope) {
        if(focusScope !== $scope) {
          $scope.editor.blur();
        }
      });

      if($scope.edit) {
        var type = $scope.edit.source.type;
        if(type === 'source-file') {
          $scope.editor.setValue($scope.edit.source.getText());
          $scope.sourceType = 'File';
          $scope.sourcePath = $scope.edit.source.path;

          $scope.edit.signals.save.add(function () {
            $scope.sourceFile.file.updateText($scope.editor.getValue());
          });
        } else if(type === 'compiled') {
          var text = JSON.stringify(
            $scope.edit.source.output,
            function(key, value) { if(typeof value === 'function') { return value.toString(); } return value; },
            2);
          $scope.editor.setValue(text);
        } else if(type === 'history') {
          var historyString = $scope.edit.source.output.stringify();
          $scope.editor.setValue(historyString);
        }
      }
    }
  };
}]);
