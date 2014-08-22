/**********************************************************************

File     : connection.js
Project  : N Simulator Library
Purpose  : Source file for connection object.
Revisions: Original definition by Lawrence Gunn.
           2014/03/13

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

/**
 * This is the N simulator.
 * @module N
 */
var N = N || {};

/**
 * A connection object. This object is essentially a shell around N.Compartment objects.
 * @class Connection
 * @param network
 * @constructor
 */
N.Connection = function(network) {
  this.network        = network;
  this.id             = N.generateUUID();
  this.path           = null;
  this.source         = null;
  this.sink           = null;
  this.output         = 0.0;
  this.outputStore    = new N.AnalogSignal('OutputStore', 'OS');
  this.gain           = 1.0;
  this.delay          = N.TimeStep;
  this.category       = 'Excitatory'; // or 'Inhibitory', 'Spine', 'GapJunction'
  this.validationMessages = [];
}

/**
 * Returns the object type.
 * @method getType
 * @returns {N.Type.Connection}
 */
N.Connection.prototype.getType = function() {
  return N.Type.Connection;
}

/**
 * Returns the object type.
 * @method getPath
 * @returns {N.Type.Connection}
 */
N.Connection.prototype.getPath = function() {
  return this.Path;
}

/**
 * Attach to the source and sink compartments.
 * @method connect
 */
N.Connection.prototype.connect = function() {
  var endPoints = N.fromConnectionPaths(this.network, this.path);
  if(!endPoints.error) {
    this.source = endPoints.source.connectOutput(this);
    this.sink = endPoints.sink.connectInput(this);
  }
  return this;
}

/**
 * Updates the connection output.
 * @method update
 * @param {Real} t The time of the update.
 */
N.Connection.prototype.update = function(t) {
  this.output = this.gain*this.source.getOutputAt(t-this.delay);
  this.outputStore.appendData(t, this.output);
}

/***
 * Clears stored data from previous simulations. Does not clear input data.
 * @method clear
 */
N.Connection.prototype.clear = function() {
  this.output = 0.0;
  this.outputStore.clear();
}


/**
 * Validates the output compartment. Reports an error of there is no output Warns if there are no compartments.
 * @method validate
 * @param report
 */
N.Connection.prototype.validate = function(report) {
  for(var j in this.validationMessages) {
    report.error(this.getPath(), this.validationMessages[j]);
  }

  if(!this.source) { report.warning(this.getPath(), 'The connection has no source.'); }
  if(!this.sink)   { report.warning(this.getPath(), 'The connection has no sink.'); }
}

/**
 * Load a connection from a JSON object. Note that if the JSON object has a 'Template' member then this is loaded from first.
 * @method loadFrom
 * @param {JSON} json
 * @returns {Connection}
 */
N.Connection.prototype.loadFrom = function(json) {
  if(json.template) {
    var template = this.network.getTemplate(json.Template);
    if(template === null) {
      this.validationMessages.push('ERROR: Unable to find template "'+json.template+'"');
      N.L(this.validationMessages[this.validationMessages.length-1]);
      return;
    }
    this.loadFrom(template);
  }

  for(var i in json) {
    if(i === 'display') {
      this.display = this.display || {};
      _.merge(this.display, json.display);
    }
    else if(i !== 'template') {
      this[i] = json[i];
    }
  }

  return this;
}
