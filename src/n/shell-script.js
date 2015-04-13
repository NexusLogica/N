/**********************************************************************
 
File     : shell-script.js
Project  : N Simulator Library
Purpose  : Source file for a shell-script object.
Revisions: Original definition by Lawrence Gunn.
           2015/04/11

Copyright (c) 2015 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

var N = N || {};

  //*****************
  //* N.ShellScript *
  //*****************

/**
 * A network object which can contain neurons or child networks.
 * @class Workbench
 * @constructor
 */
N.ShellScript = function(scope) {
  this.className  = 'N.ShellScript';
  this.id         = null;
  this.scope      = scope;
};

/***
 * Add an input object to the system.
 * @method runScript
 * @param {string} script - The script text
 * @return {number} - Returns 0 on success, 1 otherwise.
 */
N.ShellScript.prototype.runScript = function(script, scriptArgs, response) {

  try {
    var _this = this;
    var lines = script.split('\n');
    var parsedLines = [];
    for (var i = 0; i < lines.length; i++) {
      var line = $.trim(lines[i]);

      var regexp = /('[^']*'|"(\\"|[^"])*"|(?:\/(\\\/|[^\/])+\/[gimy]*)(?= |$)|(\\ |[^ ])+|[\w-]+)/gi;
      var args = line.match(regexp);
      if (args && args[0][0] !== '#') {
        parsedLines.push(args);
      }
    }

    if (parsedLines.length > 0) {
      this.runScriptLine(parsedLines, scriptArgs, response);
    }
  } catch(err) {
    console.log(err.stack);
  }
};

N.ShellScript.prototype.runScriptLine = function(lines, scriptArgs, response) {
  var line = lines.shift();
  var method = line[0];
  if (this[method]) {
    line.shift();
    this[method]({args: line}, response).then(function (result) {
      if(lines.length > 0) {
        this.runScriptLine(lines, scriptArgs, response);
      } else {
        response.done(result);
      }
    }, function (result) {
      response.done(result);
    });
  }
};

N.ShellScript.prototype.mkdir = function(request, response) {
  var deferred = Q.defer();

  var args = request.args;
  if(args.length === 1) {
    var path = args[0];
    var fullPath;
    if(path.substr(0,1) === '/') {
      fullPath = path;
    } else {
      fullPath = this.scope.getCurrentPath()+path;
    }

    var formData = new FormData();
    formData.append('action', 'create');

    N.Http.post(this.scope.scriptHost+'/directory'+fullPath, formData).then(function(data) {
      var output = 'Created: '+fullPath;
      deferred.resolve( { msg: output, status: 0 });
    }, function(err) {
      deferred.reject( { msg: 'Not a valid host name: '+err.httpStatusCodeDescription, status: 1 });
    }).catch(N.reportQError);
  } else {
    deferred.reject( { msg: 'Usage: mkdir [path] - Makes a new directory or directories.', status: 1 });
  }

  return deferred.promise;
};

/*
this.scope.shell.setCommandHandler('host', {
  exec: function(cmd, args, callback) {
    if(args.length === 0) {
      callback(this.scope.scriptHost || 'Script host not set');
    } else if(args.length === 1) {
      var host = args[0];
      N.Http.get(host+'/files').then(function(data) {
        this.scope.fileSystem = data;
        this.scope.pwd = [];
        this.scope.scriptHost = host;
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
    callback(this.scope.shell.bestMatch(arg, ['world', 'josh']));
  }
});

this.scope.shell.setCommandHandler('pwd', {
  exec: function (cmd, args, callback) {
    callback(this.scope.getCurrentPath());
  }
});

this.scope.shell.setCommandHandler('cd', {
  exec: function (cmd, args, callback) {
    var path = args[0];
    if(path === '.') {
      _.noop();
    } else if(path ==='..') {
      if(this.scope.pwd.length > 0) {
        this.scope.pwd.pop();
      }
    } else {
      var ps = path.split('/');
      var dir = this.scope.cd;
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
      this.scope.cd = dir;
      for(i = 0; i<ps.length; i++) {
        if(ps[i] === '.') {
          _.noop();
        } else if(ps[i] === '..') {
          this.scope.pwd.pop();
        } else {
          this.scope.pwd.push(ps[i]);
        }
      }
    }
    callback('');
  }
});

this.scope.shell.setCommandHandler('ls', {
  exec: function (cmd, args, callback) {
    var dir = this.scope.fileSystem;
    for(var i=0; i<this.scope.pwd.length; i++) {
      var dirName = this.scope.pwd[i];
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

this.scope.shell.setCommandHandler('edit', {
  exec: function (cmd, args, callback) {
    try {
      var usage = 'Usage: edit [-n] [filepath]';

      if(args.length < 1 || args.length > 2) {

        callback(usage)

      } else if(args.length === 1) {

        if(args[0].indexOf('$') === 0) {
          var obj = this.scope.variables[args[0]];
          if(obj) {
            if(obj.type === 'compiled' || obj.type === 'history') {
              this.scope.editorPanel.addEditor(obj);
            }
            callback('');
          } else {
            callback('Unable to find variable ' + args[0]);
          }

        } else {

          var file = args[0];
          var path = this.scope.getCurrentPath() + file;

          N.Http.get(this.scope.scriptHost + '/file' + path, {
            contentType: 'text/plain',
            dataType: 'text'
          }).then(function (data) {

            // Add the file to the list of sources.
            var file = new N.SourceFile();
            file.setPath(path);
            file.setText(data);
            this.scope.sources.addSource(file);
            this.scope.editorPanel.addEditor(file);

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
        } else if (this.scope.pwd.length === 0) {
          fullPath = '/' + args[1];
        } else {
          fullPath = this.scope.getCurrentPath() + '/' + args[1];
        }

        sourceFile.setPath(fullPath);
        this.scope.sources.addSource(sourceFile);

        this.scope.editorPanel.addEditor(sourceFile);
        callback('');
      }
    } catch(err) {
      callback('ERROR: '+err.stack)
    }
  }
});

this.scope.shell.setCommandHandler('view', {
  exec: function (cmd, args, callback) {
    try {
      var usage = 'Usage: view [env-var]';

      if(args.length !== 1) {

        callback(usage)

      } else {

        if (args[0].indexOf('$') === 0) {
          var obj = this.scope.variables[args[0]];
          if (obj) {
            if (obj.type === 'history') {
              this.scope.editorPanel.addHistoryViewer(obj);
            }
            callback('');
          } else {
            callback('Unable to find variable ' + args[0]);
          }

        }
      }
    } catch(err) {
      callback('ERROR: '+err.stack)
    }
  }
});

this.scope.shell.setCommandHandler('compile', {
  exec: function (cmd, args, callback) {
    var usage = 'Usage: compile [source-file-path] [output-object-name]';

    if (args.length === 2) {
      var filePath = this.scope.makeFullPath(args[0]);
      var outputName = args[1];

      this.scope.compile(filePath).then(function(config) {
        this.scope.variables[outputName] = { type: 'compiled', source: filePath, displayShort: outputName, output: config, guid: 'guid'+N.generateUUID() };
        callback('Compile successful');
      }, function(err) {
        callback('ERROR: Unable to compile: '+err.description);
      }).catch(N.reportQError);

    } else {
      callback(usage);
    }
  }
});


this.scope.shell.setCommandHandler('build', {
  exec: function (cmd, args, callback) {
    var usage = 'Usage: build [source-file-path | environment-variable] [output-object-name]';

    if (args.length === 2) {
      var outputName = args[1];

      if(args[0].indexOf('$') === 0) {
        var obj = this.scope.variables[args[0]];
        if(!obj) {
          callback('Unable to find variable ' + args[0]);
          return;
        }
        if(obj.type !== 'compiled') {
          callback('Variable ' + args[0] + ' is of type "' + obj.type + '", not of type compiled');
          return;
        }
        var config = obj.output;

        this.scope.buildFromJSON(config).then(function(builtObject) {
          this.scope.variables[outputName] = { type: 'object', output: builtObject, guid: 'guid'+N.generateUUID() };
          callback('Build successful');
        }, function(err) {
          callback('ERROR: Unable to build the object: '+err.description);
        }).catch(N.reportQError);

      } else {
        var filePath = this.scope.makeFullPath(args[0]);
        this.scope.loadFile(filePath).then(function (sourceFile) {
          var config = JSON.parse(sourceFile.getText());

          this.scope.buildFromJSON(config).then(function(builtObject) {
            this.scope.variables[outputName] = { type: 'object', output: builtObject, guid: 'guid'+N.generateUUID() };
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

this.scope.shell.setCommandHandler('run', {
  exec: function (cmd, args, callback) {
    var usage = 'Usage: run [compiled-system-env-var] [compiled-network-env-var] [output-object-name]';

    if (args.length === 3) {
      try {
        var systemEnvVar = args[0];
        var networkEnvVar = args[1];
        var outputName = args[2];

        // Get or build the system object.
        var systemDeferred = Q.defer();
        var systemObj = this.scope.variables[systemEnvVar];
        if (systemObj) {
          systemDeferred.resolve();
        } else {
          this.scope.buildFromFile(systemEnvVar).then(function (builtSystem) {
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

          var networkObj = this.scope.variables[networkEnvVar];
          if (networkObj) {
            networkDeferred.resolve();
          } else {
            this.scope.buildFromFile(networkEnvVar).then(function (builtNetwork) {
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

            this.scope.variables[outputName] = {type: 'history', displayShort: outputName, output: history, guid: 'guid' + N.generateUUID()};
            callback('Run successful');

          }, function (err) {
            callback('Error building system: '+err.description);
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

this.scope.shell.setCommandHandler('save', {
  exec: function (cmd, args, callback) {
    if (args.length) {
      var file = args[0];
      callback('NOT IMPLEMENTED');
    } else {
      this.scope.editorPanel.saveAllFilesToSourceFiles();
      var num = 0;
      var all = [];
      _.forEach(this.scope.sources.sourcesByGuid, function(sourceFile) {

        if (sourceFile.dirty) {
          num++;
          var formData = new FormData();
          formData.append('file', new Blob([sourceFile.getText()], {
            type: 'text/plain'
          }));

          var deferred = N.Http.post(this.scope.scriptHost + '/file' + sourceFile.path, formData);
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

*/