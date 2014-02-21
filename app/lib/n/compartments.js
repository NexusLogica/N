/**********************************************************************

File     : compartments.js
Project  : N Simulator Library
Purpose  : Source file for standard compartment objects.
Revisions: Original definition by Lawrence Gunn.
           2014/02/19

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

var N = N || {};
N.Comp = N.Comp || {};

  //**********************
  //* N.Comp.StateOutput *
  //**********************

N.Comp.StateOutput = function(neuron, name, shortName, inputObject) {
  this.ClassName  = "N.Comp.StateOutput";
  this.Name       = name;
  this.ShortName  = (shortName && shortName.length > 0 ? shortName : N.ShortName(name));
  this.Category   = 'StateOutput';

  this.Neuron     = neuron;
  this.Input      = null;
  this.Output     = 0.0;
  this.IsOutputComponent = false;
}

N.Comp.StateOutput.prototype.SetInput = function(input) {
  if(this.Input) {
    this.Input.Component = null;
  }
  this.Input = input;
}

N.Comp.StateOutput.prototype.Update = function(t) {
  if(this.Input) {
    this.Output = this.Input.UpdateInput(t);
  }
  return this.Output;
}

N.Comp.StateOutput.prototype.ToJSON = function() {
  var str = JSON.stringify(this, function(k, v) { return (k === "_finder" ? undefined : v); });
  return str;
}

  //****************
  //* N.Comp.Input *
  //****************

N.Comp.Input = function(component) {
  this.Component   = component;
  this.ClassName   = "N.Comp.Input";
  this.Sum         = 0.0;
  this.Connections = [];
}

N.Comp.Input.prototype.Connect = function(connection) {
  this.Connections.push(connection);
}

N.Comp.Input.prototype.SumInputs = function(t) {
  var len = this.Connections.length;
  this.Sum = 0.0;
  for(var i=0; i<len; i++) {
    this.Sum += this.Connections[i].GetOutput();
  }
  return this.Sum;
}

N.Comp.Input.prototype.ToJSON = function() {
  var str = JSON.stringify(this, function(k, v) { return (k === "_finder" ? undefined : v); });
  return str;
}

  //**********************
  //* N.Comp.SignalInput *
  //**********************

N.Comp.SignalInput = function(component) {
  this.Component   = component;
  this.ClassName   = "N.Comp.SignalInput";
  this.SignalInput = null;
  this.Sum         = 0.0;
}

N.Comp.SignalInput.prototype.SetSignal = function(signal) {
  this.SignalInput = signal;
}

N.Comp.SignalInput.prototype.UpdateInput = function(t) {
  if(this.SignalInput) {
    this.Sum = this.SignalInput.GetValue(t);
  }
  return this.Sum;
}

N.Comp.SignalInput.prototype.ToJSON = function() {
  var str = JSON.stringify(this, function(k, v) { return (k === "_finder" ? undefined : v); });
  return str;
}
