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
  response.log('$ '+line.join(' '));

  var method = line[0];
  var _this = this;
  if (this[method]) {
    line.shift();
    this[method]({args: line}, response).then(function (result) {
      if(lines.length > 0) {
        if(result.msg) {
          response.log(result.msg);
        }
        _this.runScriptLine(lines, scriptArgs, response);
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

N.ShellScript.prototype.pwd = function(request, response) {
  var deferred = Q.defer();
  deferred.resolve({ msg: this.scope.getCurrentPath(), status: 0 });
  return deferred.promise;
};


N.ShellScript.prototype.cd = function(request, response) {
  var deferred = Q.defer();

  var args = request.args;
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
    var isDirName = function(d) { return (d.name === this.$$dirName); };
    for(var i=0; i<ps.length; i++) {
      this.$$dirName = ps[i];
      dir = _.find(dir.directories, isDirName, this);

      if(!dir) {
        deferred.reject({ msg: 'cd: ' + this.$$dirName + ': No such directory', status: 1 });
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
  deferred.resolve({ status: 0 });
  return deferred.promise;
};

N.ShellScript.prototype.ls = function(request, response) {
  var deferred = Q.defer();

  var args = request.args;
  var dir = this.scope.fileSystem;
  var isDirName = function(d) { return (d.name === this.$$dirName); };

  for(var i=0; i<this.scope.pwd.length; i++) {
    this.$$dirName = this.scope.pwd[i];
    dir = _.find(dir.directories, isDirName, this);
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
  deferred.resolve({ msg: output, status: 0 });

  return deferred.promise;
};

N.ShellScript.prototype.host = function(request, response) {
  var deferred = Q.defer();

  var args = request.args;
  if(args.length === 0) {
    if(this.scope.scriptHost) {
      deferred.resolve({ msg: this.scope.scriptHost, status: 0 });
    } else {
      deferred.reject({ msg: 'Script host not set', status: 1 });
    }
  } else if(args.length === 1) {
    var host = args[0];
    var _this = this;
    N.Http.get(host+'/files').then(function(data) {
      _this.scope.fileSystem = data;
      _this.scope.pwd = [];
      _this.scope.scriptHost = host;
      localStorage.setItem('lastScriptHost', host);
      deferred.resolve({ msg: 'Setting host to: '+host, status: 0 });
    }, function(err) {
      deferred.reject({ msg: 'Not a valid host name: '+err.httpStatusCodeDescription, status: 1 });
    }).catch(function(err) {
      deferred.reject({ msg: 'ERROR: '+err.description+'\n'+err.stack, status: 1 });
    });
  } else {
    deferred.reject({ msg: 'Usage: host              returns current host name\n'+
    '       host [new-host]   sets the new host', status: 1 });
  }
  return deferred.promise;
};


N.ShellScript.prototype.edit = function(request, response) {
  var deferred = Q.defer();

  try {
    var args = request.args;
    var usage = 'Usage: edit [-n] [filepath]';

    if(args.length < 1 || args.length > 2) {

      deferred.reject({ msg: usage, status: 1 });

    } else if(args.length === 1) {

      if(args[0].indexOf('$') === 0) {
        var obj = this.scope.variables[args[0]];
        if(obj) {
          if(obj.type === 'compiled' || obj.type === 'history') {
            this.scope.editorPanel.addEditor(obj);
          }
          deferred.resolve({ status: 0 });
        } else {
          deferred.reject({ msg: 'Unable to find variable ' + args[0], status: 1 });
        }

      } else {

        var file = args[0];
        var path = this.scope.getCurrentPath() + file;

        var _this = this;
        N.Http.get(this.scope.scriptHost + '/file' + path, {
          contentType: 'text/plain',
          dataType: 'text'
        }).then(function (data) {

          // Add the file to the list of sources.
          var file = new N.SourceFile();
          file.setPath(path);
          file.setText(data);
          _this.scope.sources.addSource(file);
          _this.scope.editorPanel.addEditor(file);

          deferred.resolve({ msg: 'File loaded', status: 0 });
        }, function (err) {
          deferred.reject({ msg: 'Error opening file for edit: ' + err.httpStatusCodeDescription, status: 1 });
        }).catch(function(err) {
          deferred.reject({ msg: 'ERROR: '+err.description+'\n'+err.stack, status: 1 });
        });
      }

    } else if(args.length === 2) {

      if (args[0] !== '-n') {
        deferred.reject({ msg: usage, status: 1 });
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
      deferred.resolve({ status: 0 });
    }
  } catch(err) {
    deferred.reject({ msg: 'ERROR: '+err.description+'\n'+err.stack, status: 1 });
  }
  return deferred.promise;
};

N.ShellScript.prototype.view = function(request, response) {
  var deferred = Q.defer();

  var args = request.args;
  try {
    var usage = 'Usage: view [env-var]';

    if(args.length !== 1) {

      deferred.reject({ msg: usage, status: 1 });

    } else {

      if (args[0].indexOf('$') === 0) {
        var obj = this.scope.variables[args[0]];
        if (obj) {
          if (obj.type === 'history') {
            this.scope.editorPanel.addHistoryViewer(obj);
          }
          deferred.reject({ status: 0 });
        } else {
          deferred.reject({ msg: 'Unable to find variable ' + args[0], status: 1 });
        }

      }
    }
  } catch(err) {
    deferred.reject({ msg: 'ERROR: '+err.stack, status: 1 });
  }
  return deferred.promise;
};

N.ShellScript.prototype.compile = function(request, response) {
  var deferred = Q.defer();

  var args = request.args;
  var usage = 'Usage: compile [source-file-path] [output-object-name]';

  if (args.length === 2) {
    var filePath = this.scope.makeFullPath(args[0]);
    var outputName = args[1];

    var _this = this;
    this.scope.compile(filePath).then(function(config) {
      _this.scope.variables[outputName] = { type: 'compiled', source: filePath, displayShort: outputName, output: config, guid: 'guid'+N.generateUUID() };
      deferred.resolve({ msg: 'Compile successful', status: 0 });
    }, function(err) {
      deferred.reject({ msg: 'ERROR: Unable to compile: '+err.description, status: 1 });
    }).catch(function(err) {
      deferred.reject({ msg: 'ERROR: '+err.description+'\n'+err.stack, status: 1 });
    });

  } else {
    deferred.reject({ msg: usage, status: 1 });
  }
  return deferred.promise;
};


N.ShellScript.prototype.build = function(request, response) {
  var deferred = Q.defer();

  var args = request.args;
  var usage = 'Usage: build [source-file-path | environment-variable] [output-object-name]';

  if (args.length === 2) {
    var outputName = args[1];

    if(args[0].indexOf('$') === 0) {
      var obj = this.scope.variables[args[0]];
      if(!obj) {
        deferred.reject({ msg: 'Unable to find variable ' + args[0], status: 1 });
        return;
      }
      if(obj.type !== 'compiled') {
        deferred.reject({ msg: 'Variable ' + args[0] + ' is of type "' + obj.type + '", not of type compiled', status: 1 });
        return;
      }
      var config = obj.output;

      var _this = this;
      this.scope.buildFromJSON(config).then(function(builtObject) {
        _this.scope.variables[outputName] = { type: 'object', output: builtObject, guid: 'guid'+N.generateUUID() };
        deferred.resolve({ msg: 'Build successful', status: 0 });
      }, function(err) {
        deferred.reject({ msg: 'ERROR: Unable to build the object: '+err.description, status: 1 });
      }).catch(function(err) {
        deferred.reject({ msg: 'ERROR: '+err.description+'\n'+err.stack, status: 1 });
      });

    } else {
      var filePath = this.scope.makeFullPath(args[0]);
      this.scope.loadFile(filePath).then(function (sourceFile) {
        var config = JSON.parse(sourceFile.getText());

        this.scope.buildFromJSON(config).then(function(builtObject) {
          this.scope.variables[outputName] = { type: 'object', output: builtObject, guid: 'guid'+N.generateUUID() };
          deferred.resolve({ msg: 'Build successful', status: 0 });
        }, function(err) {
          deferred.reject({ msg: 'ERROR: Unable to build object: '+err.description, status: 1 });
        }).catch(function(err) {
          deferred.reject({ msg: 'ERROR: '+err.description+'\n'+err.stack, status: 1 });
        });

      }, function (err) {
        deferred.reject({ msg: 'ERROR: Unable to load file "' + filePath + '": ' + err.description, status: 1 });
      }).catch(function(err) {
        deferred.reject({ msg: 'ERROR: '+err.description+'\n'+err.stack, status: 1 });
      });
    }
  } else {
    deferred.reject({ msg: usage, status: 1 });
  }
  return deferred.promise;
};

N.ShellScript.prototype.run = function(request, response) {
  var deferred = Q.defer();

  var args = request.args;
  var usage = 'Usage: run [compiled-system-env-var] [compiled-network-env-var] [output-object-name]';

  if (args.length === 3) {
    try {
      var systemEnvVar = args[0];
      var networkEnvVar = args[1];
      var outputName = args[2];
      var _this = this;

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
        }).catch(function(err) {
          deferred.reject({ msg: 'Unexpected error building system: '+err.description+'\n'+err.stack, status: 1 });
        });
      }

      // On return of the system promise, get or build the network object.
      systemDeferred.promise.then(function () {
        var networkDeferred = Q.defer();

        var networkObj = _this.scope.variables[networkEnvVar];
        if (networkObj) {
          networkDeferred.resolve();
        } else {
          _this.scope.buildFromFile(networkEnvVar).then(function (builtNetwork) {
            networkObj = builtNetwork;
            networkDeferred.resolve();
          }, function (err) {
            networkDeferred.reject(err);
          }).catch(function (err) {
            deferred.reject({ msg: 'Unexpected error building network: '+err.description+'\n'+err.stack, status: 1 });
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

          _this.scope.variables[outputName] = {type: 'history', displayShort: outputName, output: history, guid: 'guid' + N.generateUUID()};
          deferred.resolve({ msg: 'Run successful', status: 0 });

        }, function (err) {
          deferred.reject({ msg: 'Error building system: '+err.description, status: 1 });
        }).catch(function (err) {
          deferred.reject({ msg: 'Unexpected error building the network: '+err.description+'\n'+err.stack, status: 1 });
        });

      }, function (callbackMsg) {
        deferred.reject({ msg: callbackMsg, status: 1 });
      });
    } catch(err) {
      deferred.reject({ msg: 'Unexpected error: '+err.description+'\n'+err.stack, status: 1 });
    }
  } else {
    deferred.reject({ msg: usage, status: 1 });
  }
  return deferred.promise;
};

N.ShellScript.prototype.save = function(request, response) {
  var deferred = Q.defer();

  var args = request.args;
  if (args.length) {
    var file = args[0];
    deferred.reject({ msg: 'NOT IMPLEMENTED', status: 1 });
  } else {
    this.scope.editorPanel.saveAllFilesToSourceFiles();
    var num = 0;
    var all = [];
    var _this = this;
    _.forEach(this.scope.sources.sourcesByGuid, function(sourceFile) {

      if (sourceFile.dirty) {
        num++;
        var formData = new FormData();
        formData.append('file', new Blob([sourceFile.getText()], {
          type: 'text/plain'
        }));

        var deferred = N.Http.post(_this.scope.scriptHost + '/file' + sourceFile.path, formData);
        all.push(deferred);
      }
    });
    $.when.apply($, all).then(function() {
      deferred.resolve({ msg: num === 1 ? '1 file was saved' :  num+' files were saved', status: 0 });
    }, function(err) {
      deferred.reject({ msg: 'ERROR: Unable to save the files', status: 1 });
    }).catch(function(err) {
      deferred.reject({ msg: 'ERROR: '+err.description+'\n'+err.stack, status: 1 });
    });
  }
  return deferred.promise;
};
