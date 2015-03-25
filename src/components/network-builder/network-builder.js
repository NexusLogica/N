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
    controller: ['ComponentExtensions', '$scope', '$element', '$attrs', '$timeout', '$compile', function (ComponentExtensions, $scope, $element, $attrs, $timeout, $compile) {
      ComponentExtensions.initialize(this, 'networkBuilder', $scope, $element, $attrs);

      $scope.sources = new N.Sources();

      $scope.signals = {
        'compartment-enter': new signals.Signal(),
        'compartment-leave': new signals.Signal(),
        'compartment-click': new signals.Signal(),
        'input-has-focus'  : new signals.Signal()
      };

      $scope.getCurrentPath = function() {
        return ($scope.pwd.length === 0 ? '/' : '/' + $scope.pwd.concat('/'));
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

      $scope.setCdFromPwd = function() {
        $scope.cd = $scope.fileSystem;
        for(var i=0; i<$scope.pwd.length; i++) {
          var dirName = $scope.pwd[i];
          $scope.cd = _.find($scope.cd.directories, 'name', dirName);
        }
      };

      $scope.createShell = function() {
        var history = new Josh.History({ key: 'network-builder.history'});

        $scope.shell = Josh.Shell({
          'history': history,
          'shell_panel_id': 'network-build-shell',
          'shell_view_id': 'network-build-shell-view',
          'blinktime': 1000
        });
        $scope.shell.activate();

        $scope.scriptHost = localStorage.getItem('lastScriptHost');

        if($scope.scriptHost) {
          N.Http.get($scope.scriptHost+'/files').then(function(data) {
            $scope.fileSystem = data;
            $scope.cd = data;
          });
        }

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
          callback($scope.shell.bestMatch(arg, ['world', 'josh']));
        }
      });

      $scope.shell.setCommandHandler('mkdir', {
        exec: function(cmd, args, callback) {
          if(args.length === 1) {
            var path = args[0];
            var fullPath;
            if(path.substr(0,1) === '/') {
              fullPath = path;
            } else {
              fullPath = $scope.getCurrentPath()+path;
            }

            var formData = new FormData();
            formData.append('action', 'create');

            N.Http.post($scope.scriptHost+'/directory'+fullPath, formData).then(function(data) {
              var output = 'Created: '+fullPath;
              callback(output);
            }, function(err) {
              callback('Not a valid host name: '+err.httpStatusCodeDescription);
            });
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
          callback($scope.getCurrentPath());
        }
      });

      $scope.shell.setCommandHandler('cd', {
        exec: function (cmd, args, callback) {
          var path = args[0];
          if(path === '.') {
            _.noop();
          } else if(path ==='..') {
            if($scope.pwd.length > 0) {
              $scope.pwd.pop();
            }
          } else {
            var cd = _.find($scope.cd.directories, 'name', path);
            if(!cd) {
              callback('cd: '+path+': No such directory');
              return;
            }
            $scope.cd = cd;
            $scope.pwd.push(path);
          }
          callback('');
        }
      });

      $scope.shell.setCommandHandler('ls', {
        exec: function (cmd, args, callback) {
          var dir = $scope.fileSystem;
          for(var i=0; i<$scope.pwd.length; i++) {
            var dirName = $scope.pwd[i];
            dir = _.find(dir.directories, 'name', dirName);
          }
          var list = [];
          for(var j=0; j<dir.directories.length; j++) {
            list.push(dir.directories[j].name);
          }
          for(var k=0; k<dir.files.length; k++) {
            list.push(dir.files[k].name);
          }

          list.sort();
          var output = '';
          _.forEach(list, function(name) { output += '<div>'+name+'</div>'; });
          callback(output);
        }
      });

      $scope.shell.setCommandHandler('edit', {
        exec: function (cmd, args, callback) {
          var usage = 'Usage: edit [-n] [filepath]';

          if(args.length < 1 || args.length > 2) {

            callback(usage)

          } else if(args.length === 1) {

            var file = args[0];
            var path = $scope.getCurrentPath() + file;

            N.Http.get($scope.scriptHost + '/file' + path, {
              contentType: 'text/plain',
              dataType: 'text'
            }).then(function (data) {

              // Add the file to the list of sources.
              var file = new N.SourceFile();
              file.setPath(path);
              file.setText(data);
              $scope.sources.addSource(file);
              $scope.addEditor(file);

              callback('File loaded');
            }, function (err) {
              callback('Error opening file for edit: ' + err.httpStatusCodeDescription);
            });

          } else if(args.length === 2) {

            if (args[0] !== '-n') {
              callback(usage);
              return;
            }
            var sourceFile = new N.SourceFile();
            var fullPath;
            if(args[1].indexOf('/') === 1) {
              fullPath = args[1];
            } else if($scope.pwd.length === 0) {
              fullPath = '/'+args[1];
            } else {
              fullPath = $scope.getCurrentPath() +'/'+args[1];
            }

            sourceFile.setPath(fullPath);
            $scope.sources.addSource(sourceFile);

            $scope.editorPanel.addEditor(sourceFile);
            callback('');

          }
        }
      });

      $scope.shell.setCommandHandler('save', {
        exec: function (cmd, args, callback) {
          if (args.length) {
            var file = args[0];
            callback('NOT IMPLEMENTED');
          } else {
            $scope.editorPanel.saveAllFilesToSourceFiles();
            var num = 0;
            var all = [];
            _.forEach($scope.sources.sourcesByGuid, function(sourceFile) {

              if (sourceFile.dirty) {
                num++;
                var formData = new FormData();
                formData.append('file', new Blob([sourceFile.getText()], {
                  type: 'text/plain'
                }));

                var deferred = N.Http.post($scope.scriptHost + '/file' + sourceFile.path, formData);
                all.push(deferred);
              }
            });
            $.when.apply($, all).then(function() {
              callback(num === 1 ? '1 file was saved' :  num+' files were saved');
            }, function(err) {
              callback('ERROR: Unable to save the files');
            });
          }
        }
      });

    }
  };
}]);
