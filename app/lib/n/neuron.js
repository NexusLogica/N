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

var N = N || {};

  //************
  //* N.Neuron *
  //************

N.Neuron = function(network) {
  this.ClassName  = 'N.Neuron';
  this.Id         = N.GenerateUUID();
  this.Name       = '';
  this.ShortName  = '';
  this.Category   = 'Default';
  this.Compartments = [];
  this.CompartmentsByName = {};
  this.Network    = network;
}

N.Neuron.prototype.AddCompartment = function(compartment) {
  this.Compartments.push(compartment);
  this.CompartmentsByName[compartment.Name] = compartment;
  this.CompartmentsByName[compartment.ShortName] = compartment;
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

N.Neuron.prototype.Update = function(time) {
  var num = this.Compartments.length;
  for(var i=0; i<num; i++) {
    this.Compartments[i].Update(time);
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
    var template = N.GetN(json.Template);
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
