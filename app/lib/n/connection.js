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
  this.ClassName  = 'N.Connection';
  this.Id         = N.GenerateUUID();
  this.Network    = network;
  this.SourcePath = null;
  this.SinkPath   = null;
  this.Source     = null;
  this.Sink       = null;
}

/**
 * Attach to the source and sink compartments.
 * @method Connect
 */
N.Connection.prototype.Connect = function() {
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
    if(i === 'Compartments') {
      for(var j=0; j<json.Compartments.length; j++) {
        var compartmentJson = json.Compartments[j];
        var compartment = N.NewN(compartmentJson.ClassName, this).LoadFrom(compartmentJson);
        this.AddCompartment(compartment);
      }
    }
    else if(i === 'Display') {
      this.Display = this.Display || {};
      _.merge(this.Display, json.Display);
    }
    else if(i !== 'Template') {
      this[i] = json[i];
    }
  }

  return this;
}

N.Connection.prototype.ToData = function() {
  var str = JSON.stringify(this, function(k, v) { return (k === '_finder' ? undefined : v); });
  return str;
}

N.Connection.prototype.FromData = function(json) {

}
