/**********************************************************************

File     : input.js
Project  : N Simulator Library
Purpose  : Source file for a simple input object.
Revisions: Original definition by Lawrence Gunn.
           2015/04/01

Copyright (c) 2015 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

/**
 * This is the N simulator.
 * @module N
 */
var N = N || {};

  //***********
  //* N.Input *
  //***********
/**
 * A neuron object. This object is essentially a shell around N.Compartment objects.
 * @class Neuron
 * @param network
 * @constructor
 */
N.Input = function(network) {
  this.className  = 'N.Input';
  this.id         = N.generateUUID();
  this.category   = 'default';
  this.target     = '';
  this.targetCompartment = undefined;
  this.signalPoints = [[0, 0.0]];
  this.currentPointIndex = 0;
  this.history    = new N.AnalogSignal();
};

/**
 * Returns the object type.
 * @method getType
 * @returns {N.Type.Neuron}
 */
N.Input.prototype.getType = function() {
  return N.Type.Input;
};

/***
 * Update the compartment values.
 * @method update
 * @param time
 */
N.Input.prototype.update = function(time) {
  var out = 0.0;
  // If the last point...
  if(this.signalPoints.length === this.currentPointIndex) {
    out = this.signalPoints[this.currentPointIndex][1];
  } else {

    if(this.signalPoints[this.currentPointIndex+1][0] >= time) {
      this.currentPointIndex++;
      if(this.signalPoints.length === this.currentPointIndex) {
        out = this.signalPoints[this.currentPointIndex][1];

        // The logic is simpler if we just escape from here.
        this.history.appendData(time, out);
        this.targetCompartment.output = out;
        return;
      }
    }

    var p0 = this.signalPoints[this.currentPointIndex];
    var p1 = this.signalPoints[this.currentPointIndex+1];
    if(p0.length > 2 && p0[2] === 'i') {
      out = (time-p0[0])/(p1[0]-p0[0])*(p1[1]-p0[1])+p0[1];
    } else {
      out = p0[1];
    }
  }
  this.history.appendData(time, out);
  this.targetCompartment.output = out;
};

/**
 * Validates the neuron. Warns if there are no compartments.
 * @method validate
 * @param report
 */
N.Input.prototype.validate = function(report) {
  if(this.signalPoints.length === 0) { report.Warning(this.target, 'The signal points array is zero length.'); }
};

/**
 * Load the input from a JSON object.
 * @method loadFrom
 * @param {JSON} json
 * @returns {N.Input}
 */
N.Input.prototype.loadFrom = function(json) {
  var deferred = Q.defer();
  var _this = this;
  var jsonToFill = _.cloneDeep(json);

  this.loadTemplate(jsonToFill).then(
    function(mergedJson) {

      _.merge(_this, _.omit(mergedJson, ['template']));

    }, function(status) {
      console.log('REJECT: N.Input.loadFrom[1]: '+status.errMsg);
      deferred.reject(status);
    }
  ).catch(N.reportQError);
  return deferred.promise;
};

N.Input.prototype.loadTemplate = function(json) {
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

N.Input.prototype.toData = function() {
  return JSON.stringify(this, function(k, v) { return (k === '_finder' ? undefined : v); });
};

N.Input.prototype.fromData = function(json) {

};

N.Input.prototype.routeErrorMsg = function(errMsg) {
  this.validationMessages.push(errMsg);
  N.log(errMsg);
  return errMsg;
};