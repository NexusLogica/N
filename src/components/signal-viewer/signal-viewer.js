/**********************************************************************

File     : signal-viewer.js
Project  : N Simulator Library
Purpose  : Source file for an N signal viewer component.
Revisions: Original definition by Lawrence Gunn.
           2015/04/09

Copyright (c) 2015 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

angular.module('nSimulationApp').directive('signalViewer', [function() {
  return {
    restrict: 'E',
    templateUrl: 'src/components/signal-viewer/signal-viewer.html',
    scope: {
      signals: '=signals',
      ideSignals: '=ideSignals',
      history: '=history'
    },
    controller: ['ComponentExtensions', '$scope', '$element', '$attrs', '$timeout', function (ComponentExtensions, $scope, $element, $attrs, $timeout) {
      ComponentExtensions.initialize(this, 'signalViewer', $scope, $element, $attrs);

      $scope.sliderSignals = {
        'onRangeChange': new signals.Signal()
      };

      $scope.sliderSignals.onRangeChange.add(function(min, max) {
        $scope.$apply(function() {
          $scope.signalGraphScene.setScale(min, max);
        });
      });

      $scope.treeData = [
        {
          id: 'folder_1',
          label: 'This is Folder 1',
          inode: true,
          open: false,
          checkbox: false,
          radio: false,
          branch:[{
            id: 'sub-item_x',
            label: 'This is File X',
            inode: false,
            checkbox: true,
            radio: false
          }]
        },
        {
          id: 'file_1',
          label: 'This is File 1',
          inode: false,
          checkbox: true,
          radio: false
        }
      ];

      $scope.showSelectTree = function() {
        BootstrapDialog.show({
          title: 'Select signal traces to view',
          message: function(dialog) {
            var content = $('<div class="tree-container"><div class="aciTree"></div></div>');
            content.find('.aciTree').aciTree({
              rootData: $scope.treeData,
              checkbox: true,
              radio: true
            });
            return content;
          },
          buttons: [{
            label: 'Close',
            action: function(dialog) {
              dialog.close();
            }
          }]
        });
      };

    }],
    link: function($scope, $element, $attrs, ctrl) {
      $scope.signalGraphScene = new N.UI.SignalGraphScene();

      $scope.rangeMin = $scope.history.source.output.startTime;
      $scope.rangeMax = $scope.history.source.output.endTime;

      $scope.treeData = [
        {
          id: 'folder_1',
          label: 'This is Folder 1',
          inode: true,
          open: false,
          checkbox: false,
          radio: false,
          branch:[{
            id: 'sub-item_x',
            label: 'This is File X',
            inode: false,
            icon: 'neuron',
            checkbox: true,
            radio: false
          }]
        },
        {
          id: 'file_1',
          label: 'This is File 1',
          inode: false,
          checkbox: true,
          radio: false
        }
      ];

      var history = $scope.history.source.output;
      var signal;
      for(var key in history.inputs) {
        if(history.inputs.hasOwnProperty(key)) {
          signal = history.inputs[key];
          $scope.signalGraphScene.addTrace(signal);
        }
      }

      for(key in history.outputs) {
        if(history.outputs.hasOwnProperty(key)) {
          signal = history.outputs[key];
          $scope.signalGraphScene.addTrace(signal);
        }
      }
    }
  };
}]);
