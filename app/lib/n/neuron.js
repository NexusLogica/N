/**********************************************************************

File     : neuron.js
Project  : N Simulator Library
Purpose  : Source file for neuron relate objects.
Revisions: Original definition by Lawrence Gunn.
           2014/02/19

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

/**
 * This is the N simulator.
 * @module N
 */
var N = N || {};

  //************
  //* N.Neuron *
  //************
/**
 * A neuron object. This object is essentially a shell around N.Compartment objects.
 * @class Neuron
 * @param network
 * @constructor
 */
N.Neuron = function(network) {
  this.className  = 'N.Neuron';
  this.id         = N.generateUUID();
  this.category   = 'default';
  this.compartments = [];
  this.compartmentsByName = {};
  this.network    = network;
  this.validationMessages = [];
}

/**
 * Returns the object type.
 * @method getType
 * @returns {N.Type.Neuron}
 */
N.Neuron.prototype.getType = function() {
  return N.Type.Neuron;
}

/**
 * Get the full path of the neuron.
 * @method getPath
 * @returns {string}
 */
N.Neuron.prototype.getPath = function() {
  return this.network.getPath()+':'+this.name;
}

/**
 * Set the network.
 * @method setNetwork
 * @returns {this}
 */
N.Neuron.prototype.setNetwork = function(network) {
  this.network = network;
  return this;
}

/**
 * Set the name.
 * @method setName
 * @returns {this}
 */
N.Neuron.prototype.setName = function(name) {
  this.name = name;
  return this;
}

/**
 * Add a compartment to the neuron.
 * @method addCompartment
 * @param {N.Comp.*} compartment
 * @return {N.Comp.*} The compartment passed into the method is returned.
 */
N.Neuron.prototype.addCompartment = function(compartment) {
  this.compartments.push(compartment);
  this.compartmentsByName[compartment.name] = compartment;
  return compartment;
}

N.Neuron.prototype.getCompartmentByIndex = function(index) {
  return this.compartments[index];
}

N.Neuron.prototype.getCompartmentByName = function(name) {
  return this.compartmentsByName[name];
}

N.Neuron.prototype.getNumCompartments = function() {
  return this.compartments.length;
}

/**
 * Calls each child compartment telling it to connect to any other compartment it requires communication with.
 * @method connectCompartments
 */
N.Neuron.prototype.connectCompartments = function() {
  var num = this.compartments.length;
  for(var i=0; i<num; i++) {
    this.compartments[i].connectToCompartments();
  }
}

/***
 * Update the compartment values.
 * @method update
 * @param time
 */
N.Neuron.prototype.update = function(time) {
  var num = this.compartments.length;
  for(var i=0; i<num; i++) {
    this.compartments[i].update(time);
  }
}

/***
 * Clears any stored data from a previous simulation. Does not clear input data.
 * @method clear
 */
N.Neuron.prototype.clear = function() {
  var num = this.compartments.length;
  for(var i=0; i<num; i++) {
    this.compartments[i].clear();
  }
}

/**
 * Validates the neuron. Warns if there are no compartments.
 * @method validate
 * @param report
 */
N.Neuron.prototype.validate = function(report) {
  if(this.compartments.length === 0) { report.Warning(this.getPath(), 'The neuron has no components.'); }

  for(var j in this.validationMessages) {
    report.error(this.getPath(), this.validationMessages[j]);
  }

  for(var i=0; i<this.compartments.length; i++) {
    try {
      this.compartments[i].validate(report);
    }
    catch (err) {
      report.error(this.compartments[i].getPath(), 'The compartment of type '+this.compartments[i].className+' threw an exception when validating.');
    }
  }
}

/**
 * Load a neuron from a JSON object. Note that if the JSON object has a 'template' member then this is loaded from first.
 * @method loadFrom
 * @param {JSON} json
 * @returns {Neuron}
 */
N.Neuron.prototype.loadFrom = function(json) {
  var deferred = Q.defer();
  var _this = this;
  var jsonToFill = _.cloneDeep(json);

  this.loadTemplate(jsonToFill).then(
    function(mergedJson) {

      _.merge(_this, _.omit(mergedJson, ['compartments', 'template']));

      _this.loadCompartments(mergedJson).then(
        function() {
          console.log('RESOLVE: N.Neuron.loadFrom[0]: '+_this.name);
          deferred.resolve();
        }, function(status) {
          console.log('REJECT: N.Neuron.loadFrom[0]: '+status.errMsg);
          deferred.reject(status);
        }
      ).catch(N.reportQError);
    }, function(status) {
      console.log('REJECT: N.Neuron.loadFrom[1]: '+status.errMsg);
      deferred.reject(status);
    }
  ).catch(N.reportQError);
  return deferred.promise;
}

N.Neuron.prototype.loadTemplate = function(json) {
  var deferred = Q.defer();
  var _this = this;

  if(json.template.hasOwnProperty('local')) {
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
  } else if(json.template.hasOwnProperty('remote')) {
    this.network.getRemoteTemplate(json.template.remote).then(
      function(remoteTemplate) {
        debugger;
        var merged = _.merge(json, remoteTemplate);
        deferred.resolve(merged);
      }, function(status) {
        debugger;
        deferred.reject(status);
      }
    ).catch(N.reportQError);
  } else {
    deferred.resolve(json);
  }

  return deferred.promise;
}

/**
 * Load all of the neuron's compartments from a JSON object.
 * This is a private internal function.
 * @method loadCompartments
 * @param {JSON} json
 * @returns { Q.promise}
 */
N.Neuron.prototype.loadCompartments = function(json) {
  var promises = [];
  var num = json.compartments ? json.compartments.length : 0;
  for(var i=0; i<num; i++) {
    var compartmentJson = json.compartments[i];
    var promise = this.createCompartment(compartmentJson);
    promises.push(promise);
  }

  return Q.all(promises);
}

/**
 * Create and load a compartment from a JSON object.
 * This is a private internal function.
 * @method createCompartment
 * @param {JSON} json
 * @returns { Q.promise}
 */
N.Neuron.prototype.createCompartment = function(json) {
  var deferred = Q.defer();
  var _this = this;
  var compartment = N.newN(json.className, this);
  if(!compartment) {
    deferred.reject({ errMsg: this.routeErrorMsg('ERROR: Unable to create compartment "'+json+'"') });
    return deferred.promise;
  }
  compartment.loadFrom(json).then(
    function() {
      _this.addCompartment(compartment);
      deferred.resolve();
    },
    function(status) {
      deferred.reject(status);
    }
  ).catch(N.reportQError);
  return deferred.promise;
}

N.Neuron.prototype.initialize = function() {
  for(var i in this.compartments) {
    var compartment = this.compartments[i];
    if(compartment.initialize) {
      compartment.initialize();
    }
  }
}

N.Neuron.prototype.toData = function() {
  var str = JSON.stringify(this, function(k, v) { return (k === '_finder' ? undefined : v); });
  return str;
}

N.Neuron.prototype.fromData = function(json) {

}

N.Neuron.prototype.routeErrorMsg = function(errMsg) {
  this.validationMessages.push(errMsg);
  N.log(errMsg);
  return errMsg;
}