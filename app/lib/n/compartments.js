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

N.Comp.StateOutput = function(neuron, name, shortName) {
  this.ClassName  = 'N.Comp.StateOutput';
  this.Name       = name;
  this.ShortName  = (shortName && shortName.length > 0 ? shortName : N.ShortName(name));
  this.Category   = 'StateOutput';

  this.Neuron     = neuron;
  this.Input      = null;
  this.Output     = 0.0;
  this.IsOutputComponent = true;
}

N.Comp.StateOutput.prototype.AddInput = function(input) {
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

N.Comp.StateOutput.prototype.LoadFrom = function(json) {
  for(var i in json) {
    if(i === 'Input') {
      this.Input = N.NewN(json[i].ClassName).LoadFrom(json[i]);
    }
    else { this[i] = json[i]; }
  }
  return this;
}

  //*****************
  //* N.Comp.Output *
  //*****************

N.Comp.Output = function(neuron, name, shortName) {
  this.ClassName  = 'N.Comp.Output';
  this.Name       = name;
  this.ShortName  = (shortName && shortName.length > 0 ? shortName : N.ShortName(name));
  this.Category   = 'StateOutput';

  this.Neuron     = neuron;
  this.Output     = 0.0;
  this.IsOutputComponent = true;
}

N.Comp.Output.prototype.AddInput = function(input) {
  this.Input = input;
}

N.Comp.Output.prototype.Update = function(t) {
  if(this.Input) {
    this.Output = this.Input.UpdateInput(t);
  }
  return this.Output;
}

N.Comp.Output.prototype.LoadFrom = function(json) {
  for(var i in json) {
    this[i] = json[i];
  }
  return this;
}

  //***************************
  //* N.Comp.InhibitoryOutput *
  //***************************

N.Comp.InhibitoryOutput = function(neuron, name, shortName) {
  this.ClassName  = 'N.Comp.InhibitoryOutput';
  this.Name       = name;
  this.ShortName  = (shortName && shortName.length > 0 ? shortName : N.ShortName(name));
  this.Category   = 'InhibitoryOutput';

  this.Neuron     = neuron;
  this.Output     = 0.0;
  this.IsOutputComponent = true;
}

N.Comp.InhibitoryOutput.prototype.AddInput = function(input) {
  this.Input = input;
}

N.Comp.InhibitoryOutput.prototype.Update = function(t) {
  if(this.Input) {
    this.Output = this.Input.UpdateInput(t);
  }
  return this.Output;
}

N.Comp.InhibitoryOutput.prototype.LoadFrom = function(json) {
  for(var i in json) {
    this[i] = json[i];
  }
  return this;
}

  //*****************************
  //* N.Comp.LinearSummingInput *
  //*****************************

N.Comp.LinearSummingInput = function(component) {
  this.Component   = component;
  this.ClassName   = 'N.Comp.LinearSummingInput';
  this.Sum         = 0.0;
  this.Connections = [];
}

N.Comp.LinearSummingInput.prototype.Connect = function(connection) {
  this.Connections.push(connection);
}

N.Comp.LinearSummingInput.prototype.SumInputs = function(t) {
  var len = this.Connections.length;
  this.Sum = 0.0;
  for(var i=0; i<len; i++) {
    this.Sum += this.Connections[i].GetOutput();
  }
  return this.Sum;
}

N.Comp.LinearSummingInput.prototype.LoadFrom = function(json) {
  for(var i in json) {
    this[i] = json[i];
  }
  return this;
}

N.Comp.LinearSummingInput.prototype.ToJSON = function() {
  var str = JSON.stringify(this, function(k, v) { return (k === '_finder' ? undefined : v); });
  return str;
}

  //**********************
  //* N.Comp.SignalInput *
  //**********************

N.Comp.SignalInput = function(component) {
  this.Component   = component;
  this.ClassName   = 'N.Comp.SignalInput';
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

N.Comp.SignalInput.prototype.LoadFrom = function(json) {
  for(var i in json) {
    if(i === 'SignalInput') {
      this.SignalInput = N.NewN(json[i].ClassName).LoadFrom(json[i]);
    }
    else { this[i] = json[i]; }
  }
  return this;
}

N.Comp.SignalInput.prototype.ToJSON = function() {
  var str = JSON.stringify(this, function(k, v) { return (k === '_finder' ? undefined : v); });
  return str;
}
