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
    controller: ['ComponentExtensions', '$scope', '$element', '$attrs', '$timeout', '$routeParams', function (ComponentExtensions, $scope, $element, $attrs, $timeout, $routeParams) {
      ComponentExtensions.initialize(this, 'piViewer', $scope, $element, $attrs);

      $scope.sceneSignals = {
        'component-move': new signals.Signal(),
        'component-click': new signals.Signal(),
        'connection-enter': new signals.Signal(),
        'connection-leave': new signals.Signal(),
        'connection-click': new signals.Signal(),
        'background-move': new signals.Signal(),
        'background-mouse-down': new signals.Signal(),
        'background-mouse-up': new signals.Signal(),
        'background-click': new signals.Signal()
      };

      $scope.errorText = undefined;

      $scope.buildNetwork = function () {
        $scope.srcPath = $routeParams.src;
        $scope.modulePath = $routeParams.module;
        if(!$scope.srcPath || !$scope.modulePath) {
          console.log('ERROR: piViewer::buildNetwork: Both "module" and "src" URL parameters must be specified.');
          return;
        }
        $scope.scriptHost = !_.isEmpty($scope.parentScriptHost) ? $scope.parentScriptHost : N.getScriptHost();
        $scope.sources = $scope.parentSources || new N.Sources();

        var compiler = new N.Compiler($scope.scriptHost, $scope.sources);
        compiler.compileAndBuild($scope.srcPath, $scope.modulePath).then(function(builtObj) {
          $scope.$apply(function() {
            if (builtObj.className === 'N.System') {
              $scope.system = builtObj;
              $scope.network = $scope.system.network;
            } else {
              $scope.network = builtObj;
            }

            var scene = new N.UI.NetworkScene($scope.sceneSignals);
            scene.load($scope.network, compiler).then(function() {
                $scope.$apply(function() {
                  scene.layout();
                  $scope.view = { 'scene': scene };
                });
              }, function(err) {
                N.log('ERROR: PiViewer.link: Unable to load the network display - '+err.description);
              }
            ).catch(function(err) {
                N.log('CATCH: PiViewer.link: Unable to load the network display - '+err.description);
            });
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
      };

    }],

    link: function($scope, $element, $attrs, ctrl) {
      $scope.buildNetwork();
    }
  };
}]);
