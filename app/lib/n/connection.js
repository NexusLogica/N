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
N.Connection = function() {
  this.ClassName      = 'N.Connection';
  this.Id             = N.GenerateUUID();
  this.Network        = null;
  this.ConnectionPath = null;
  this.Source         = null;
  this.Sink           = null;
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
  return this.ConnectionPath;
}

N.Connection.prototype.SetNetwork = function(network) {
  this.Network = network;
}

/**
 * Attach to the source and sink compartments.
 * @method Connect
 */
N.Connection.prototype.Connect = function() {
  var endPoints = N.FromConnectionPaths(this.Network, this.ConnectionPath);
  if(!endPoints.error) {
    endPoints.Source.ConnectOutput(this);
    endPoints.Sink.ConnectInput(this);
  }
  return this;
}

N.Connection.prototype.GetConnectionPath = function() {
  return this.ConnectionPath;
}

/**
 * Validates the output compartment. Reports an error of there is no output Warns if there are no compartments.
 * @method Validate
 * @param report
 */
N.Connection.prototype.Validate = function(report) {
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
    var template = _.isString(json.Template) ? N.GetN(json.Template) : json.Template;
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
