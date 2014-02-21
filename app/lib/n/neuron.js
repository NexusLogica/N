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

N.Neuron = function() {
  this.ClassName  = "N.Neuron";
  this.Id         = N.M.GenerateUUID();
  this.Name       = "";
  this.ShortName  = "";
  this.Category   = 'Default';
  this.Compartments = [];
}

N.Neuron.prototype.AddCompartment = function(compartment) {
  this.Compartments.push(compartment);
}

N.Neuron.prototype.GetNumCompartments = function() {
  return this.Compartments.length;
}

N.Neuron.prototype.ToJSON = function() {
  var str = JSON.stringify(this, function(k, v) { return (k === "_finder" ? undefined : v); });
  return str;
}

  //***********************
  //* N.OutputCompartment *
  //***********************

N.OutputCompartment = function() {
  this.ClassName  = "N.OutputCompartment";
}
