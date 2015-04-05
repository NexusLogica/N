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

/***
 * This is the N simulator.
 * @module N
 */
var N = N || {};

  //***********
  //* N.Input *
  //***********

/***
 * A neuron object. This object is essentially a shell around N.Compartment objects.
 * @class N.Input
 * @param system
 * @constructor
 */
N.Input = function(system) {
  this.className  = 'N.Input';
  this.system     = system;
  this.id         = N.generateUUID();
  this.category   = 'default';
  this.target     = '';
  this.targetCompartment = undefined;
  this.signal = [[0, 0.0]];
  this.currentSignalIndex = 0;
  this.history    = new N.AnalogSignal();
};

/***
 * Returns the object type.
 * @method getType
 * @returns {N.Type.Neuron}
 */
N.Input.prototype.getType = function() {
  return N.Type.Input;
};

/***
 * Returns the object type.
 * @method connect
 */
N.Input.prototype.connect = function() {
  this.currentPointIndex = 0;
  this.history = new N.AnalogSignal();

  this.targetCompartment = undefined;
  var t = N.fromPath(this.system.network, this.target);
  if(t.error) {
    return t;
  }
  this.targetCompartment = t;
};

/**
 * Returns the object type.
 * @method disconnect
 */
N.Input.prototype.disconnect = function() {
  this.currentSignalIndex = 0;
  this.targetCompartment = undefined;
};

/***
 * Update the compartment values.
 * @method update
 * @param {float} t - time
 */
N.Input.prototype.update = function(t) {
  var out = 0.0;
  var i = this.chooseIndex(t);

  if(i === this.signal.length-1) {
    out = this.signal[i][1];
  } else if(this.signal[i][2] === 'i') {
    var t0 = this.signal[i][0];
    var t1 = this.signal[i+1][0];
    var v0 = this.signal[i][1];
    var v1 = this.signal[i+1][1];
    out = v0+(v1-v0)*(t-t0)/(t1-t0);
  } else {
    out = this.signal[i][1];
  }

  this.history.appendData(t, out);
  this.targetCompartment.output = out;
};

/***
 * Determine the signal index to use
 * @method chooseIndex
 * @param t
 */
N.Input.prototype.chooseIndex = function(t) {
  if(this.currentSignalIndex < this.signal.length-2) {
    if(this.signal[this.currentSignalIndex][0] <= t) {
      this.currentSignalIndex++;
    }
  }
  return this.currentSignalIndex;
};

/***
 * Validates the neuron. Warns if there are no compartments.
 * @method validate
 * @param report
 */
N.Input.prototype.validate = function(report) {
  if(this.signal.length === 0) { report.warning('Input to '+this.target, 'The signal points array is zero length.'); }
  for(var i=0; i<this.signal.length; i++) {
    if(i > 0) {
      if(this.signal[i][0] <= this.signal[i-1][0]) {
        report.error('Input to '+this.target, 'Signal time values duplicated reversed.');
      }
    }
  }
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

      deferred.resolve();
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