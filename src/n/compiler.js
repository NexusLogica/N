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

/**********************************************************************
 * A connection object. This object is essentially a shell around N.Compartment objects.
 * @class N.Compiler
 * @constructor
 */
N.Compiler = function(scriptHost, sources) {
  this.scriptHost = scriptHost;
  this.sources = sources || new N.Sources();
};

N.Compiler.prototype.compileAndBuild = function(filePath) {
  var deferred = Q.defer();

  var _this = this;
  this.compile(filePath).then(function(config) {
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
 * @return {promise} The return is a promise which when resolved is the configuration JSON for the system, or an error on reject.
 */
N.Compiler.prototype.compile = function(filePath) {
  var deferred = Q.defer();

  var rootTemplate = {
    import: { '$$root': filePath },
    loadedImports: {},
    func: function() {} // no-op
  };
  var loader = { templatesByPath: {} };

  var deferredGroup = new N.Compiler.DeferredRequestGroup();
  var promise = deferredGroup.begin();

  this.loadImport(loader, rootTemplate, '$$root', filePath, deferredGroup);

  promise.then(function() {
    var compiler = new N.Compiler.RecursiveCompiler();
    var config = {};
    var root = rootTemplate.loadedImports.$$root;
    root.func({ root: config, self: config, imports: root.loadedImports, compiler: compiler });
    if(config.networks && config.networks.length === 1) {
      deferred.resolve(config.networks[0]);
    } else {
      deferred.resolve(config);
    }
  }, function(err) {
    deferred.reject(err);
  }).catch(N.reportQError);
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
 * Load an import.
 * @method loadImport
 * @param loader - This is the loader object.
 * @param requestingTemplate - This is the instantiated template object (i.e. imports, loadedImports, function).
 * @param key - Import key name
 * @param path - Import path
 * @param {DeferredRequestGroup} deferredGroup - The deferred object. Resolving the current load must be done after starting the child imports.
 * @returns {*}
 */
N.Compiler.prototype.loadImport = function(loader, requestingTemplate, key, path, deferredGroup) {
  var deferred = Q.defer();
  var _this = this;
  if (loader.templatesByPath[path]) {
    requestingTemplate.loadedImports[key] = loader.templatesByPath[path];
    deferred.resolve();
  } else {
    // Block other load requests from uploading this file.
    loader.templatesByPath[path] = {};
    this.loadFile(path).then(function (sourceFile) {

      // This is a template file so compile and load it.
      var srcText = sourceFile.getText();
      if(srcText.indexOf('N.Template') !== -1 || srcText.indexOf('N.ConnectionTemplate') !== -1) {
        try {
          var configTemplate = N.compileTemplateFunction(srcText, path);
          requestingTemplate.loadedImports[key] = configTemplate;
          loader.templatesByPath[path] = configTemplate;

          // Now, load the imports.
          for (var importKey in configTemplate.imports) {
            if (configTemplate.imports.hasOwnProperty(importKey)) {
              _this.loadImport(loader, configTemplate, importKey, configTemplate.imports[importKey], deferredGroup);
            }
          }
        } catch(err) {
          console.log('ERROR: Unable to compile '+path+': '+err.description);
          deferred.reject(err);
        }

        deferred.resolve();
      }

      // This is (hopefully) a JSON file so just parse it.
      else {
        try {
          var includeJson = JSON.parse(srcText);
          includeJson.$$path = path;
          requestingTemplate.loadedImports[key] = includeJson;
          loader.templatesByPath[path] = includeJson;
        } catch(err) {
          deferred.reject(err)
        }
        deferred.resolve();
      }

    }, function (err) {
      deferred.reject(err);
    }).catch(N.reportQError);
  }
  deferredGroup.addPromise(deferred.promise);
};

N.Compiler.prototype.loadFile = function(filePath) {
  var deferred = Q.defer();
  var _this = this;
  var sourceFile = this.sources.sourcesByPath[filePath];
  if(sourceFile) {
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
N.Compiler.RecursiveCompiler = function() {
};

N.Compiler.RecursiveCompiler.prototype.buildOut = function(context) {
  if(context.self.include) {
    for(var i=0; i<context.self.include.length; i++) {
      var includeMetadata = context.self.include[i];
      var include = context.imports[includeMetadata.template];
      if(!include) {
        return { description: 'Import template '+includeMetadata.template+'not found'}
      }
      if(context.self[includeMetadata.target]) {
        _.merge(context.self[includeMetadata.target], include);
      } else {
        context.self[includeMetadata.target] = include;
      }
    }
  }
  if(context.self.build) {
    for(var j=0; j<context.self.build.length; j++) {
      var command = context.self.build[j];
      var template = context.imports[command.template];
      if(!template) {
        return { description: 'Import template '+command.template+'not found'}
      }
      context.compiler = this;
      var args = [].concat(context, command.args);
      template.func.apply(this, args);
    }

    delete context.self.build;
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

