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
  this.ClassName  = 'N.Neuron';
  this.Id         = N.GenerateUUID();
  this.Name       = '';
  this.ShortName  = '';
  this.Category   = 'Default';
  this.Compartments = [];
  this.CompartmentsByName = {};
  this.Network    = network;
  this.ValidationMessages = [];
}

/**
 * Returns the object type.
 * @method GetType
 * @returns {N.Type.Neuron}
 */
N.Neuron.prototype.GetType = function() {
  return N.Type.Neuron;
}

/**
 * Get the full path of the neuron.
 * @method GetPath
 * @returns {string}
 */
N.Neuron.prototype.GetPath = function() {
  return this.Network.GetPath()+':'+this.ShortName;
}

/**
 * Get the full path of the neuron.
 * @method GetPath
 * @returns {string}
 */
N.Neuron.prototype.SetNetwork = function(network) {
  return this.Network = network;
}

/**
 * Add a compartment to the neuron.
 * @method AddCompartment
 * @param {N.Comp.*} compartment
 * @return {N.Comp.*} The compartment passed into the method is returned.
 */
N.Neuron.prototype.AddCompartment = function(compartment) {
  this.Compartments.push(compartment);
  this.CompartmentsByName[compartment.Name] = compartment;
  this.CompartmentsByName[compartment.ShortName] = compartment;
  return compartment;
}

N.Neuron.prototype.GetCompartmentByIndex = function(index) {
  return this.Compartments[index];
}

N.Neuron.prototype.GetCompartmentByName = function(name) {
  return this.CompartmentsByName[name];
}

N.Neuron.prototype.GetNumCompartments = function() {
  return this.Compartments.length;
}

/**
 * Calls each child compartment telling it to connect to any other compartment it requires communication with.
 * @method ConnectCompartments
 */
N.Neuron.prototype.ConnectCompartments = function() {
  var num = this.Compartments.length;
  for(var i=0; i<num; i++) {
    this.Compartments[i].ConnectToCompartments();
  }
}

N.Neuron.prototype.Update = function(time) {
  var num = this.Compartments.length;
  for(var i=0; i<num; i++) {
    this.Compartments[i].Update(time);
  }
}

/**
 * Validates the neuron. Warns if there are no compartments.
 * @method Validate
 * @param report
 */
N.Neuron.prototype.Validate = function(report) {
  if(this.Compartments.length === 0) { report.Warning(this.GetPath(), 'The neuron has no components.'); }

  for(var j in this.ValidationMessages) {
    report.Error(this.GetPath(), this.ValidationMessages[j]);
  }

  for(var i=0; i<this.Compartments.length; i++) {
    try {
      this.Compartments[i].Validate(report);
    }
    catch (err) {
      report.Error(this.Compartments[i].GetPath(), 'The compartment of type '+this.Compartments[i].ClassName+' threw an exception when validating.');
    }
  }
}

/**
 * Load a neuron from a JSON object. Note that if the JSON object has a 'Template' member then this is loaded from first.
 * @method LoadFrom
 * @param {JSON} json
 * @returns {Neuron}
 */
N.Neuron.prototype.LoadFrom = function(json) {
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

N.Neuron.prototype.ToData = function() {
  var str = JSON.stringify(this, function(k, v) { return (k === '_finder' ? undefined : v); });
  return str;
}

N.Neuron.prototype.FromData = function(json) {

}
