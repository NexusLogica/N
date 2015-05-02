/**********************************************************************

File     : pi-viewer.js
Project  : N Simulator Library
Purpose  : Source file for Pi network and neuron viewer component.
Revisions: Original definition by Lawrence Gunn.
           2015/04/18

Copyright (c) 2015 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

angular.module('nSimulationApp').directive('piViewer', [function() {
  return {
    restrict: 'E',
    templateUrl: 'src/components/pi-viewer/pi-viewer.html',
    scope: {
      scriptPath: '=scriptPath',
      parentScriptHost: '=scriptHost',
      parentSources: '=sourceFiles'
    },
    controller: ['ComponentExtensions', '$scope', '$element', '$attrs', '$timeout', function (ComponentExtensions, $scope, $element, $attrs, $timeout) {
      ComponentExtensions.initialize(this, 'piViewer', $scope, $element, $attrs);

      $scope.sceneSignals = {
        'component-move': new signals.Signal(),
        'component-click': new signals.Signal(),
        'background-move': new signals.Signal(),
        'background-click': new signals.Signal()
      };

      $scope.errorText = undefined;

    }],
    link: function($scope, $element, $attrs, ctrl) {

      var buildNetwork = function () {
        if ($scope.scriptPath) {

          $scope.scriptHost = !_.isEmpty($scope.parentScriptHost) ? $scope.parentScriptHost : N.getScriptHost();
          $scope.sources = $scope.parentSources || new N.Sources();

          var compiler = new N.Compiler($scope.scriptHost, $scope.sources);
          compiler.compileAndBuild($scope.scriptPath).then(function(builtObj) {
            $scope.$apply(function() {
              if (builtObj.className === 'N.System') {
                $scope.system = builtObj;
                $scope.network = $scope.system.network;
              } else {
                $scope.network = builtObj;
              }

              $scope.view = {scene: new N.UI.NetworkScene($scope.sceneSignals)};
              $scope.view.scene.layout($scope.network, $scope.network.display.renderMappings);
            });
          }, function(err) {
            $scope.$apply(function() {
              $scope.errorText = ('An error occurred building the network: ' + err.description).split('\n').join('<br/>');
            });
          }).catch(function(err) {
            $scope.$apply(function() {
              $scope.errorText = ('An error occurred building the network: ' + err.description + '\n' + err.stack).split('\n').join('<br/>');
            });
          });

          watchDomChanges();
        }
      };

      var watchDomChanges = function() {

        //$scope.inWatchDom = false;
        //// Create an observer instance and get callbacks
        //
        //var observer = new MutationObserver(function(mutations)  {
        //  if(!$scope.inWatchDom) {
        //    $scope.inWatchDom = true;
        //    mutations.forEach(function (mutation) {
        //      console.log(mutation.type);
        //      //$scope.setUpdateRequired(true);
        //      $scope.inWatchDom = false;
        //    });
        //  }
        //});
        //
        //// configuration of the observer:
        //var config = {attributes: true, childList: true, characterData: true, subtree: true };
        //
        //// pass in the target node, as well as the observer options
        //observer.observe($element.find('pi-canvas').get(0), config);
        //
        //// later, you can stop observing
        ////////////observer.disconnect();
      };


      buildNetwork();
    }
  };
}]);
