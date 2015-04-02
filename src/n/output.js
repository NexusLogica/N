/**********************************************************************

File     : output.js
Project  : N Simulator Library
Purpose  : Source file for a simple output object.
Revisions: Original definition by Lawrence Gunn.
           2015/04/02

Copyright (c) 2015 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

/**
 * This is the N simulator.
 * @module N
 */
var N = N || {};

  //************
  //* N.Output *
  //************
/**
 * A neuron object. This object is essentially a shell around N.Compartment objects.
 * @class Neuron
 * @param network
 * @constructor
 */
N.Output = function(network) {
  this.className  = 'N.Output';
  this.id         = N.generateUUID();
  this.category   = 'default';
  this.target     = '';
  this.targetCompartment = undefined;
  this.history    = new N.AnalogSignal();
  this.currentPointIndex = 0;
};

/**
 * Returns the object type.
 * @method getType
 * @returns {N.Type.Neuron}
 */
N.Output.prototype.getType = function() {
  return N.Type.Input;
};

/***
 * Update the compartment values.
 * @method update
 * @param time
 */
N.Output.prototype.update = function(time) {
  this.history.appendData(time, this.targetCompartment.output);
};

/**
 * Validates the neuron. Warns if there are no compartments.
 * @method validate
 * @param report
 */
N.Output.prototype.validate = function(report) {
};

/**
 * Load the input from a JSON object.
 * @method loadFrom
 * @param {JSON} json
 * @returns {N.Output}
 */
N.Output.prototype.loadFrom = function(json) {
  var deferred = Q.defer();
  var _this = this;
  var jsonToFill = _.cloneDeep(json);

  this.loadTemplate(jsonToFill).then(
    function(mergedJson) {

      _.merge(_this, _.omit(mergedJson, ['template']));

    }, function(status) {
      console.log('REJECT: N.Output.loadFrom[1]: '+status.errMsg);
      deferred.reject(status);
    }
  ).catch(N.reportQError);
  return deferred.promise;
};

N.Output.prototype.loadTemplate = function(json) {
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

N.Output.prototype.toData = function() {
  return JSON.stringify(this, function(k, v) { return (k === '_finder' ? undefined : v); });
};

N.Output.prototype.fromData = function(json) {

};

N.Output.prototype.routeErrorMsg = function(errMsg) {
  this.validationMessages.push(errMsg);
  N.log(errMsg);
  return errMsg;
};