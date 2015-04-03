/**********************************************************************
 
File     : system.js
Project  : N Simulator Library
Purpose  : Source file for a system object.
Revisions: Original definition by Lawrence Gunn.
           2015/04/01

Copyright (c) 2015 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

var N = N || {};

  //************
  //* N.System *
  //************

/**
 * A network object which can contain neurons or child networks.
 * @class Workbench
 * @constructor
 */
N.System = function() {
  this.className  = 'N.System';
  this.id         = null;
  this.name       = '';
  this.inputs     = [];
  this.outputs    = [];
};

/***
 * Add an input object to the system.
 * @method addInput
 * @param input
 */
N.System.prototype.addInput = function(input) {
  this.inputs.push(input);
};

/***
 * Add an output object to the system.
 * @method addOutput
 * @param output
 */
N.System.prototype.addOutput = function(output) {
  this.outputs.push(output);
};

/**
 * Runs a test.
 * @method runTest
 * @param test
 */
N.System.prototype.runTest = function(test) {
console.log('RUN TEST');
  var network = this.network;
  network.clear();

  var duration = test.duration;
  var inc = N.timeStep;
  var t = 0.0;
  var maxSteps = 100000;
  var breakAfterStep = false;

  for(var i=0; i<maxSteps; i++) {
    network.update(t);
    if(breakAfterStep) {
      break;
    }
    t += inc;
    if(t >= duration) {
      t = duration;
      breakAfterStep = true;
    }
  }
};

/**
 * Load a neuron from a JSON object. Note that if the JSON object has a 'template' member then this is loaded from first.
 * @method loadFrom
 * @param {JSON} json
 * @returns {Neuron}
 */
N.System.prototype.loadFrom = function(json) {
  var deferred = Q.defer();
  var _this = this;
  var jsonToFill = _.cloneDeep(json);

  this.loadTemplate(jsonToFill).then(
    function(mergedJson) {

      _.merge(_this, _.omit(mergedJson, ['inputs', 'outputs', 'template']));

      _this.loadInputsAndOutputs(mergedJson).then(
        function() {
          console.log('RESOLVE: N.System.loadFrom[0]: '+_this.name);
          deferred.resolve();
        }, function(status) {
          console.log('REJECT: N.System.loadFrom[0]: '+status.errMsg);
          deferred.reject(status);
        }
      ).catch(N.reportQError);
    }, function(status) {
      console.log('REJECT: N.System.loadFrom[1]: '+status.errMsg);
      deferred.reject(status);
    }
  ).catch(N.reportQError);
  return deferred.promise;
};

N.System.prototype.loadTemplate = function(json) {
  var deferred = Q.defer();
  var _this = this;

  if(json.template && json.template.hasOwnProperty('local')) {
    var localTemplate = this.network.getTemplate(json.template.local);
    if(localTemplate === null) {
      debugger;
      deferred.reject({ success: false, errMsg: this.routeErrorMsg('ERROR: Unable to find local template "'+json.template.local+'"') });
      return deferred.promise;
    }

    if(localTemplate.template) {
      this.loadTemplate(localTemplate).then(
        function(childMerged) {
          var merged = _.merge(childMerged, json);
          deferred.resolve(merged);
        }, function(status) {
          deferred.reject(status);
        }
      ).catch(N.reportQError);
    } else {
      var merged = _.merge(localTemplate, json);
      deferred.resolve(merged);
    }
  } else if(json.template &&  json.template.hasOwnProperty('remote')) {
    this.network.getRemoteTemplate(json.template.remote).then(

      function(remoteTemplate) {
        if(remoteTemplate.template) {
          _this.loadTemplate(remoteTemplate).then(
            function(childMerged) {
              var merged = _.merge(childMerged, json);
              deferred.resolve(merged);
            }, function(status) {
              deferred.reject(status);
            }
          ).catch(N.reportQError);
        } else {
          var merged = _.merge(remoteTemplate, json);
          deferred.resolve(merged);
        }
      }, function(status) {
        debugger;
        _this.routeErrorMsg('ERROR: Unable to find remote template "'+json.template.remote.url+'/'+json.template.remote.id+'"');
        deferred.reject(status);
      }
    ).catch(N.reportQError);
  } else {
    deferred.resolve(json);
  }

  return deferred.promise;
};

/**
 * Load all of the neuron's compartments from a JSON object.
 * This is a private internal function.
 * @method loadInputsAndOutputs
 * @param {JSON} json
 * @returns { Q.promise}
 */
N.System.prototype.loadInputsAndOutputs = function(json) {
  var promises = [];
  var promise;
  var num = json.inputs ? json.inputs.length : 0;
  for(var i=0; i<num; i++) {
    var inputJson = json.inputs[i];
    promise = this.createInputOutput(inputJson, 'input');
    promises.push(promise);
  }

  num = json.outputs ? json.outputs.length : 0;
  for(i=0; i<num; i++) {
    var outputJson = json.outputs[i];
    promise = this.createInputOutput(outputJson, 'output');
    promises.push(promise);
  }

  return Q.all(promises);
};

/**
 * Create and load a compartment from a JSON object.
 * This is a private internal function.
 * @method createCompartment
 * @param {JSON} json
 * @returns { Q.promise}
 */
N.System.prototype.createInputOutput = function(json, ioType) {
  var deferred = Q.defer();
  var _this = this;
  var ioObject = N.newN(json.className, this);
  if(!ioObject) {
    deferred.reject({ errMsg: this.routeErrorMsg('ERROR: Unable to create input/output object "'+json+'"') });
    return deferred.promise;
  }
  ioObject.loadFrom(json).then(
    function() {
      if(ioType === 'input') {
        _this.addInput(ioObject);
      } else {
        _this.addOutput(ioObject);
      }
      deferred.resolve(ioObject);
    },
    function(status) {
      deferred.reject(status);
    }
  ).catch(N.reportQError);
  return deferred.promise;
};
