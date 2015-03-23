/**********************************************************************

File     : network-builder.js
Project  : N Simulator Library
Purpose  : Source file for a network builder component.
Revisions: Original definition by Lawrence Gunn.
           2014/08/28

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

angular.module('nSimulationApp').directive('networkBuilder', [function() {
  return {
    restrict: 'E',
    templateUrl: 'src/components/network-builder/network-builder.html',
    controller: ['ComponentExtensions', '$scope', '$element', '$attrs', '$timeout', function (ComponentExtensions, $scope, $element, $attrs, $timeout) {
      ComponentExtensions.initialize(this, 'networkBuilder', $scope, $element, $attrs);

      $scope.signals = {
        'compartment-enter': new signals.Signal(),
        'compartment-leave': new signals.Signal(),
        'compartment-click': new signals.Signal(),
        'input-has-focus': new signals.Signal()
      };

      $scope.build = {};
      $scope.fileSystem = {};
      $scope.pwd = [];
      $scope.cd = $scope.fileSystem;

      $scope.createNew = function() {
        $scope.build.network = new N.Network();
        $scope.$broadcast('network-builder:new');
      };

      $scope.doFullBuild = function() {

      };

      $scope.createShell = function() {
        var history = new Josh.History({ key: 'network-builder.history'});

        $scope.shell = Josh.Shell({
          'history': history,
          'shell_panel_id': 'network-build-shell',
          'shell_view_id': 'network-build-shell-view'
        });
        $scope.shell.activate();

        $scope.scriptHost = localStorage.getItem('lastScriptHost');

        $element.find('#network-build-shell').on('click', function() {
          $scope.shell.activate();
          $scope.signals['input-has-focus'].dispatch($scope);
        });

        $scope.signals['input-has-focus'].add(function(focusScope) {
          if(focusScope !== $scope) {
            $scope.shell.deactivate();
          }
        });
      };

    }],
    link: function($scope, $element, $attrs) {
      $scope.createShell();

      $scope.shell.setCommandHandler('host', {
        exec: function(cmd, args, callback) {
          if(args.length === 0) {
            callback($scope.scriptHost || 'Script host not set');
          } else if(args.length === 1) {
            var host = args[0];
            N.Http.get(host+'/files').then(function(data) {
              $scope.fileSystem = data;
              $scope.pwd = [];
              $scope.scriptHost = host;
              localStorage.setItem('lastScriptHost', host);
              callback('Setting host to: '+host);
            }, function(err) {
              callback('Not a valid host name: '+err.httpStatusCodeDescription);
            });
          } else {
            callback('Usage: host              returns current host name\n'+
                     '       host [new-host]   sets the new host');
          }
        },
        completion: function(cmd, arg, line, callback) {
          callback($scope.shell.bestMatch(arg, ['world', 'josh']))
        }
      });

      $scope.shell.setCommandHandler('mkdir', {
        exec: function(cmd, args, callback) {
          if(args.length === 1) {
            var path = args[0];
            var fullPath = $scope.pwd .concat('/')+path;
            var output = 'Creating: '+fullPath;
            callback(output);
        } else {
          callback('Usage: mkdir [path]     Makes a new directory or directories.');
      }
    },
    completion: function(cmd, arg, line, callback) {
      callback($scope.shell.bestMatch(arg, ['world', 'josh']))
    }
      });

      $scope.shell.setCommandHandler('pwd', {
        exec: function (cmd, args, callback) {
          callback('/'+$scope.pwd.concat('/'));
        }
      });

    }
  };
}]);
