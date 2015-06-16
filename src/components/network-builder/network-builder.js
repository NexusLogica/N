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
    controller: ['ComponentExtensions', '$scope', '$element', '$attrs', '$timeout', '$compile', '$routeParams', function (ComponentExtensions, $scope, $element, $attrs, $timeout, $compile, $routeParams) {
      ComponentExtensions.initialize(this, 'networkBuilder', $scope, $element, $attrs);

      $scope.sources = new N.Sources();

      $scope.signals = {
        'compartment-enter': new signals.Signal(),
        'compartment-leave': new signals.Signal(),
        'compartment-click': new signals.Signal(),
        'input-has-focus'  : new signals.Signal(),
        'output-log'       : new signals.Signal()
      };

      $scope.getCurrentPath = function() {
        return '/'+$scope.pwd.join('/');
      };

      $scope.makeFullPath = function(filePath) {
        return filePath.indexOf('/') === 0 ?
          filePath :
          $scope.getCurrentPath()+($scope.pwd.length === 0 ? '' : '/')+filePath;
      };

      $scope.variables = {};

      $scope.build = {};
      $scope.fileSystem = {};
      $scope.pwd = [];
      $scope.cd = $scope.fileSystem;

      $scope.createNew = function() {
        $scope.build.network = new N.Network();
        $scope.$broadcast('network-builder:new');
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

        $scope.scriptHost = N.getScriptHost();

        if($scope.scriptHost) {
          N.Http.get($scope.scriptHost+'/files').then(function(data) {
            $scope.fileSystem = data;
            $scope.cd = data;
            $scope.loadScriptList();
          }).catch(N.reportQError);
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

      $scope.loadFile = function(filePath) {
        var deferred = Q.defer();
        var sourceFile = $scope.sources.sourcesByPath[filePath];
        if(sourceFile) {
          deferred.resolve(sourceFile);
        } else {
          N.Http.get($scope.scriptHost + '/file' + filePath, {
            contentType: 'text/plain',
            dataType: 'text'
          }).then(function (fileContents) {

            // Add the file to the list of sources.
            sourceFile = new N.SourceFile();
            sourceFile.setPath(filePath);
            sourceFile.setText(fileContents);

            $scope.sources.addSource(sourceFile);

            deferred.resolve(sourceFile);
          }, function (err) {
            err.description = 'Unable to load file '+filePath+' - '+err.httpStatusCodeDescription;
            console.log(err.description);
            deferred.reject(err);
          }).catch(N.reportQError);
        }
        return deferred.promise;
      };

      $scope.loadScriptList = function() {
        $scope.scripts = [];
        var scriptsDir = _.find($scope.fileSystem.directories, function(d) {
          return (d.name === 'scripts');
        });

        if(scriptsDir) {
          for(var i = 0; i<scriptsDir.files.length; i++) {
            var file = scriptsDir.files[i];
            if(file.name.lastIndexOf('.sh') === file.name.length-3) {
              var fullPath = '/scripts/'+file.name;
              $scope.loadFile(fullPath).then(function(sourceFile) {
                $scope.$apply(function() {
                  var niceName = sourceFile.extractProperty('name');
                  var description = sourceFile.extractProperty('description');
                  var scriptObj = { path: sourceFile.path, name: niceName, description: description };
                  $scope.scripts.push(scriptObj);

                  // If the URL parameter 'run' is defined then automatically run the script.
                  if($routeParams.run) {
                    if(sourceFile.path === '/scripts/'+$routeParams.run+'.sh') {
                      $scope.selectedScript = scriptObj;
                      $scope.runScript();
                    }
                  }
                });
              }, function(err) {
                console.log('ERROR: '+err.description);
              });
            }
          }
        }
      };

      $scope.scriptSelected = function(script) {
        $scope.selectedScript = script;
      };

      $scope.initializePage = function() {
        if ($routeParams.src) {
          $scope.srcPath = $routeParams.src;
          $scope.modulePath = $routeParams.module;
          buildNetwork();
        }
      };

      var buildNetwork = function() {
        $scope.scriptHost = !_.isEmpty($scope.parentScriptHost) ? $scope.parentScriptHost : N.getScriptHost();
        $scope.sources = $scope.parentSources || new N.Sources();

        var compiler = new N.Compiler($scope.scriptHost, $scope.sources);
        compiler.compileAndBuild($scope.srcPath, $scope.modulePath).then(function(builtObj) {
          $scope.$apply(function() {
            $scope.shellVisible = false;
            $scope.editorPanel.addNetworkViewer(builtObj);
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

      $scope.runScript = function() {
        $scope.loadFile($scope.selectedScript.path).then(function(sourceFile) {
            var scriptRunner = new N.ShellScript($scope);
            scriptRunner.runScript(sourceFile.text, [], { done: function(output) {
                var msg = (output.status !== 0 && !output.msg) ? 'Exited with error code '+output.status : output.msg;
                if(!_.isEmpty(msg)) {
                  $scope.signals['output-log'].dispatch(output.status === 0 ? 'success' : 'error', msg);
                }
                if(output.status === 0) {
                  $scope.showSuccessToast((msg && msg.length > 0) ? msg : 'Script run successfully');
                  $scope.shellVisible = false;
                } else {
                  $scope.showErrorToast(msg);
                }
              }, log: function(text) {
                $scope.signals['output-log'].dispatch('success', text);
              }, error: function(text) {
                $scope.signals['output-log'].dispatch('error', text);
              }
            }).catch(N.reportQError);
          }
        );
      };

      $scope.showSuccessToast = function(msg) {
        toastr.success(msg);
      };

      $scope.showErrorToast = function(msg) {
        toastr.warning(msg);
      };

      $scope.showTab = function(tab) {
        $element.find('.tab-pane.active').removeClass('active');
        $element.find(tab).addClass('active');
      };


      }],
    link: function($scope, $element, $attrs) {

      $scope.createShell();
      $scope.shellScript = new N.ShellScript($scope);

      $scope.shell.setCommandHandler('mkdir', {
        exec: function(cmd, args, callback) {
          $scope.shellScript.mkdir({ args: args }, { done: function(result) {
            callback(result.msg);
          } });
        },
        completion: function(cmd, arg, line, callback) {
          callback($scope.shell.bestMatch(arg, ['world', 'josh']))
        }
      });

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
            }).catch(N.reportQError);
          } else {
            callback('Usage: host              returns current host name\n'+
            '       host [new-host]   sets the new host');
          }
        },
        completion: function(cmd, arg, line, callback) {
          callback($scope.shell.bestMatch(arg, ['world', 'josh']));
        }
      });

      $scope.shell.setCommandHandler('pwd', {
        exec: function (cmd, args, callback) {
          callback($scope.getCurrentPath());
        }
      });

      $scope.shell.setCommandHandler('env', {
        exec: function (cmd, args, callback) {
          var scriptRunner = new N.ShellScript($scope);
          var responseText = '';
          scriptRunner.runScript('env'+args.join(' '), [], {
            log: function (msg) { responseText += msg; },
            done: function (msg) { callback(responseText + msg);}
          });
        }
      });

      $scope.shell.setCommandHandler('view', {
        exec: function (cmd, args, callback) {
          var scriptRunner = new N.ShellScript($scope);
          var responseText = '';
          scriptRunner.runScript('view'+args.join(' '), args, {
            log: function (msg) { responseText += msg; },
            done: function (msg) { callback(responseText + msg);}
          });
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
            var ps = path.split('/');
            var dir = $scope.cd;
            for(var i=0; i<ps.length; i++) {
              var dirName = ps[i];
              dir = _.find(dir.directories, function(d) {
                return (d.name === dirName);
              });

              if(!dir) {
                callback('cd: ' + dirName + ': No such directory');
                return;
              }
            }
            $scope.cd = dir;
            for(i = 0; i<ps.length; i++) {
              if(ps[i] === '.') {
                _.noop();
              } else if(ps[i] === '..') {
                $scope.pwd.pop();
              } else {
                $scope.pwd.push(ps[i]);
              }
            }
          }
          callback('');
        }
      });

      $scope.shell.setCommandHandler('ls', {
        exec: function (cmd, args, callback) {
          var dir = $scope.fileSystem;
          for(var i=0; i<$scope.pwd.length; i++) {
            var dirName = $scope.pwd[i];
            dir = _.find(dir.directories, function(d) {
              return (d.name === dirName);
            });
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
          try {
            var usage = 'Usage: edit [-n] [filepath]';

            if(args.length < 1 || args.length > 2) {

              callback(usage)

            } else if(args.length === 1) {

              if(args[0].indexOf('$') === 0) {
                var obj = $scope.variables[args[0]];
                if(obj) {
                  if(obj.type === 'compiled' || obj.type === 'history') {
                    $scope.editorPanel.addEditor(obj);
                  }
                  callback('');
                } else {
                  callback('Unable to find variable ' + args[0]);
                }

              } else {

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
                  $scope.editorPanel.addEditor(file);

                  callback('File loaded');
                }, function (err) {
                  callback('Error opening file for edit: ' + err.httpStatusCodeDescription);
                }).catch(N.reportQError);
              }

            } else if(args.length === 2) {

              if (args[0] !== '-n') {
                callback(usage);
                return;
              }
              var sourceFile = new N.SourceFile();
              var fullPath;
              if (args[1].indexOf('/') === 1) {
                fullPath = args[1];
              } else if ($scope.pwd.length === 0) {
                fullPath = '/' + args[1];
              } else {
                fullPath = $scope.getCurrentPath() + '/' + args[1];
              }

              sourceFile.setPath(fullPath);
              $scope.sources.addSource(sourceFile);

              $scope.editorPanel.addEditor(sourceFile);
              callback('');
            }
          } catch(err) {
            callback('ERROR: '+err.stack)
          }
        }
      });

      $scope.shell.setCommandHandler('compile', {
        exec: function (cmd, args, callback) {
          var usage = 'Usage: compile [source-file-path] [output-object-name]';

          if (args.length === 2) {
            var filePath = $scope.makeFullPath(args[0]);
            var outputName = args[1];

            var compiler = new N.Compiler($scope.scriptHost, $scope.sources);

            compiler.compile(filePath).then(function(config) {
              $scope.variables[outputName] = { type: 'compiled', source: filePath, displayShort: outputName, output: config, guid: 'guid'+N.generateUUID() };
              callback('Compile successful');
            }, function(err) {
              callback('ERROR: Unable to compile: '+err.description);
            }).catch(N.reportQError);

          } else {
            callback(usage);
          }
        }
      });


      $scope.shell.setCommandHandler('build', {
        exec: function (cmd, args, callback) {
          var usage = 'Usage: build [source-file-path | environment-variable] [output-object-name]';

          if (args.length === 2) {
            var outputName = args[1];

            if(args[0].indexOf('$') === 0) {
              var obj = $scope.variables[args[0]];
              if(!obj) {
                callback('Unable to find variable ' + args[0]);
                return;
              }
              if(obj.type !== 'compiled') {
                callback('Variable ' + args[0] + ' is of type "' + obj.type + '", not of type compiled');
                return;
              }
              var config = obj.output;

              $scope.buildFromJSON(config).then(function(builtObject) {
                $scope.variables[outputName] = { type: 'object', output: builtObject, guid: 'guid'+N.generateUUID() };
                callback('Build successful');
              }, function(err) {
                callback('ERROR: Unable to build the object: '+err.description);
              }).catch(N.reportQError);

            } else {
              var filePath = $scope.makeFullPath(args[0]);
              $scope.loadFile(filePath).then(function (sourceFile) {
                var config = JSON.parse(sourceFile.getText());

                $scope.buildFromJSON(config).then(function(builtObject) {
                  $scope.variables[outputName] = { type: 'object', output: builtObject, guid: 'guid'+N.generateUUID() };
                  callback('Build successful');
                }, function(err) {
                  callback('ERROR: Unable to build object: '+err.description);
                }).catch(N.reportQError);

              }, function (err) {
                callback('ERROR: Unable to load file "' + filePath + '": ' + err.description);
              }).catch(N.reportQError);
            }
          } else {
            callback(usage);
          }
        }
      });

      $scope.shell.setCommandHandler('run', {
        exec: function (cmd, args, callback) {
          var usage = 'Usage: run [compiled-system-env-var] [compiled-network-env-var] [output-object-name]';

          if (args.length === 3) {
            try {
              var systemEnvVar = args[0];
              var networkEnvVar = args[1];
              var outputName = args[2];

              // Get or build the system object.
              var systemDeferred = Q.defer();
              var systemObj = $scope.variables[systemEnvVar];
              if (systemObj) {
                systemDeferred.resolve();
              } else {
                var compiler = new N.Compiler($scope.scriptHost, $scope.sources);
                compiler.compileAndBuild(systemEnvVar).then(function (builtSystem) {
                  systemObj = builtSystem;
                  systemDeferred.resolve();
                }, function (err) {
                  systemDeferred.reject(err);
                }).catch(function (err) {
                  N.reportQError(err);
                  callback('Unexpected error building system: ' + err.description);
                });
              }

              // On return of the system promise, get or build the network object.
              systemDeferred.promise.then(function () {
                var networkDeferred = Q.defer();

                var networkObj = $scope.variables[networkEnvVar];
                if (networkObj) {
                  networkDeferred.resolve();
                } else {
                  var compiler = new N.Compiler($scope.scriptHost, $scope.sources);
                  compiler.compileAndBuild(networkEnvVar).then(function (builtNetwork) {
                    networkObj = builtNetwork;
                    networkDeferred.resolve();
                  }, function (err) {
                    networkDeferred.reject(err);
                  }).catch(function (err) {
                    N.reportQError(err);
                    callback('Unexpected error building network: ' + err.description);
                  });
                }

                // On return of the network promise, run the system with the network.
                networkDeferred.promise.then(function () {

                  // Run the system.
                  var network = networkObj;
                  var system = systemObj;

                  system.connectToNetwork(network);
                  system.run();

                  var history = system.getHistory();

                  system.disconnect();

                  $scope.variables[outputName] = {type: 'history', displayShort: outputName, output: history, guid: 'guid' + N.generateUUID()};
                  callback('Run successful');

                }, function (err) {
                  callback('Error building system: '+err.description);
                  console.log('       Stack trace:\n'+err.stack);
                }).catch(function (err) {
                  N.reportQError(err);
                  callback('Unexpected error building the network: ' + err.description);
                });

              }, function (callbackMsg) {
                callback(callbackMsg);
              });
            } catch(err) {
              console.log(err.stack);
              callback('Unexpected error: ' + err.description);
            }
          } else {
            callback(usage);
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
            }).catch(N.reportQError);
          }
        }
      });

      $scope.initializePage();

    }
  };
}]);
