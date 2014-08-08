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
  this.Network        = network;
  this.Id             = N.GenerateUUID();
  this.Path           = null;
  this.Source         = null;
  this.Sink           = null;
  this.Output         = 0.0;
  this.OutputStore    = new N.AnalogSignal('OutputStore', 'OS');
  this.Gain           = 1.0;
  this.Delay          = 1;
  this.Category       = 'Excitatory'; // or 'Inhibitory', 'Spine', 'GapJunction'
  this.ValidationMessages = [];
}

/**
 * Returns the object type.
 * @method GetType
 * @returns {N.Type.Connection}
 */
N.Connection.prototype.GetType = function() {
  return N.Type.Connection;
}

/**
 * Returns the object type.
 * @method GetPath
 * @returns {N.Type.Connection}
 */
N.Connection.prototype.GetPath = function() {
  return this.Path;
}

/**
 * Attach to the source and sink compartments.
 * @method Connect
 */
N.Connection.prototype.Connect = function() {
  var endPoints = N.FromConnectionPaths(this.Network, this.Path);
  if(!endPoints.error) {
    this.Source = endPoints.Source.ConnectOutput(this);
    this.Sink = endPoints.Sink.ConnectInput(this);
  }
  return this;
}

/**
 * Updates the connection output.
 * @method Update
 * @param {Real} t The time of the update.
 */
N.Connection.prototype.update = function(t) {
  this.Output = this.Gain*this.Source.GetOutputAt(t-this.Delay);
  this.OutputStore.AppendData(t, this.Output);
}

/***
 * Clears stored data from previous simulations. Does not clear input data.
 * @method clear
 */
N.Connection.prototype.clear = function() {
  this.Output = 0.0;
  this.OutputStore.clear();
}


/**
 * Validates the output compartment. Reports an error of there is no output Warns if there are no compartments.
 * @method Validate
 * @param report
 */
N.Connection.prototype.Validate = function(report) {
  for(var j in this.ValidationMessages) {
    report.Error(this.GetPath(), this.ValidationMessages[j]);
  }

  if(!this.Source) { report.Warning(this.GetPath(), 'The connection has no source.'); }
  if(!this.Sink)   { report.Warning(this.GetPath(), 'The connection has no sink.'); }
}

/**
 * Load a connection from a JSON object. Note that if the JSON object has a 'Template' member then this is loaded from first.
 * @method LoadFrom
 * @param {JSON} json
 * @returns {Connection}
 */
N.Connection.prototype.LoadFrom = function(json) {
  if(json.Template) {
    var template = this.Network.GetTemplate(json.Template);
    if(template === null) {
      this.ValidationMessages.push('ERROR: Unable to find template "'+json.Template+'"');
      N.L(this.ValidationMessages[this.ValidationMessages.length-1]);
      return;
    }
    this.LoadFrom(template);
  }

  for(var i in json) {
    if(i === 'Display') {
      this.Display = this.Display || {};
      _.merge(this.Display, json.Display);
    }
    else if(i !== 'Template') {
      this[i] = json[i];
    }
  }

  return this;
}
