/**********************************************************************

File     : compiler.js
Project  : N Simulator Library
Purpose  : Source file for a simulator compiler.
Revisions: Original definition by Lawrence Gunn.
           2015/04/27

Copyright (c) 2015 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

// Modules attach to this namespace.
N.Mod = N.Mod || {};
N.Mod.Network = N.Mod.Network || {};
N.Mod.Neuron  = N.Mod.Neuron  || {};
N.Mod.Synapse = N.Mod.Synapse || {};

/**********************************************************************
 * A connection object. This object is essentially a shell around N.Compartment objects.
 * @class N.Compiler
 * @constructor
 */
N.Compiler = function(scriptHost, sources) {
  this.scriptHost = scriptHost;
  this.sources = sources || new N.Sources();
};

N.Compiler.prototype.compileAndBuild = function(filePath, projectModuleName) {
  var deferred = Q.defer();

  var _this = this;
  this.compile(filePath, projectModuleName).then(function(config) {
    _this.build(config).then(function(nObject) {
      nObject.sourceConfiguration = config;
      deferred.resolve(nObject);
    }, function(err) {
      deferred.reject(err);
    });
  }, function(err) {
    deferred.reject(err);
  });

  return deferred.promise;
};

/**
 * Adds the source object.
 * @method compile
 * @param {string} filePath
 * @param {string} projectModuleName
 * @return {promise} The return is a promise which when resolved is the configuration JSON for the system, or an error on reject.
 */
N.Compiler.prototype.compile = function(filePath, projectModuleName) {
  var deferred = Q.defer();

  var _this = this;
  this.loadFile(filePath).then(
    function(source) {
      try {
        eval(source.getText());
      } catch(err) {
        var msg = 'ERROR: N.Compiler.compile: '+err.description;
        console.log(msg);
        console.log(err.stack);
        throw msg;
      }

      var context = new N.Compiler.Context();
      var projectModule = N.newN(projectModuleName, context);
      if(!projectModule) {
        var msg2 = 'ERROR: N.Compiler.compile: Unable to find project module '+projectModuleName;
        deferred.reject({ description: msg2 });
        return;
      }
      var files = projectModule.getDependencies();

      // Download the files.
      var promises = [];
      var downloadedFiles = [];
      for(var i=0; i<files.length; i++) {
        var promise = _this.loadFile(files[i], downloadedFiles, i);
        promises.push(promise);
      }

      Q.all(promises).then(function() {
        for(var i=0; i<downloadedFiles.length; i++) {
          var source = downloadedFiles[i];
          try {
            eval(source.getText());
          } catch(err) {
            var msg = 'ERROR: N.Compiler.compile: compiling dependency '+source.path+' - '+err.description;
            console.log(msg);
            console.log(err.stack);
            throw msg;
          }
        }

        var compiledObj = projectModule.create();
        deferred.resolve(compiledObj);
      }, function(err) {
        var msg = 'ERROR: N.Compiler.compile: Unable to download files: '+err.description;
        console.log(msg);
        console.log(err.stack);
        throw msg;
      })
      .catch(function(err) {
        var msg = 'ERROR: N.Compiler.compile: Catch while trying to download files: '+err.description;
        console.log(msg);
        console.log(err.stack);
        deferred.reject({ msg: msg+'\n'+err.stack, status: 1 });
      });
    }, function(err) {
      deferred.reject({ msg: 'ERROR: '+err.description+'\n'+err.stack, status: 1 });
    })
    .catch(N.reportQError);

  return deferred.promise;
};

/***
 * Build a network or system from a configuration JSON.
 * @method build
 * @param {JSON} config - A configuration JSON file, usually the output of a call to the compile function.
 * @return {promise} The return is a promise which when resolved is the built system or network, or an error on reject.
 */
N.Compiler.prototype.build = function(config) {
  var deferred = Q.defer();
  if (!config.className) {
    deferred.reject({description: 'No className entry - could not build object'});
    return;
  }

  var nObject = N.newN(config.className);

  nObject.loadFrom(config).then(function () {
    deferred.resolve(nObject);
  }, function (status) {
    deferred.reject(status);
  }).catch(N.reportQError);

  return deferred.promise;
};

/***
 * Loads a file.
 * @method loadFile
 * @param filePath
 * @param arrayToAddTo - Optional: An array to insert the file into.
 * @param arrayIndex - Optional: The index to insert to in the above array.
 * @returns {*}
 */
N.Compiler.prototype.loadFile = function(filePath, arrayToAddTo, arrayIndex) {
  var deferred = Q.defer();
  var _this = this;
  var sourceFile = this.sources.sourcesByPath[filePath];
  if(sourceFile) {
    if(arrayToAddTo) {
      arrayToAddTo[arrayIndex] = sourceFile;
    }
    deferred.resolve(sourceFile);
  } else {
    N.Http.get(this.scriptHost + '/file' + filePath, {
      contentType: 'text/plain',
      dataType: 'text'
    }).then(function (fileContents) {

      // Add the file to the list of sources.
      sourceFile = new N.SourceFile();
      sourceFile.setPath(filePath);
      sourceFile.setText(fileContents);

      _this.sources.addSource(sourceFile);

      if(arrayToAddTo) {
        arrayToAddTo[arrayIndex] = sourceFile;
      }
      deferred.resolve(sourceFile);
    }, function (err) {
      err.description = 'Unable to load file '+filePath+' - '+err.httpStatusCodeDescription;
      console.log(err.description);
      deferred.reject(err);
    }).catch(N.reportQError);
  }
  return deferred.promise;
};


/**********************************************************************
 * This object is passed through the configuration JS to build out the scripts into a full configuration.
 * @class N.Compiler.RecursiveCompiler
 * @constructor
 */
N.Compiler.Context = function(script) {
  eval(script);
};

N.Compiler.Context.prototype.makeModule = function(name) {
  var module = N.newN(name, this);
  if(!module) {
    var err2 = 'ERROR: N.Compiler.Context.makeModule: name passed ('+name+') does not have namespaces';
    console.log(err2);
    throw err2;
  }
  return module;
};

N.Compiler.Context.prototype.createEmptyNetwork = function(name) {
  return {
    'className': 'N.Network',
    'name': name,
    'description': '',
    'networks': [],
    'neurons': [],
    'connections': []
  }
};

N.Compiler.Context.prototype.createEmptyNeuron = function(name) {
  return {
    'className': 'N.Neuron',
    'name': name,
    'description': '',
    'compartments': []
  }
};

N.Compiler.Context.prototype.createEmptyConnection = function(source, sink, category) {
  return {
    'className': 'N.Connection',
    'description': '',
    'path': source+'->'+sink,
    'output': 0.0,
    'gain': 1.0,
    'delay': N.timeStep,
    'category': category        // 'Excitatory' or 'Inhibitory', 'Spine', 'GapJunction'
  }
};

/**********************************************************************
 * An object for waiting on multiple promises, often requested asynchronously.
 * @class N.Compiler.DeferredRequestGroup
 * @constructor
 */
N.Compiler.DeferredRequestGroup = function() {
  this.deferred = Q.defer();
  this.active = false;
  this.numPromises = 0;
  this.rejected = false;
};

N.Compiler.DeferredRequestGroup.prototype.begin = function() {
  return this.deferred.promise;
};

N.Compiler.DeferredRequestGroup.prototype.addPromise = function(promise) {
  this.numPromises++;
  var _this = this;
  promise.then(function() {
    _this.numPromises--;
    if(_this.numPromises === 0 && !_this.rejected) {
      _this.deferred.resolve();
    }
  }, function(err) {
    _this.numPromises--;
    _this.rejected = true;
    _this.deferred.reject(err);
  }).catch(N.reportQError);
};

