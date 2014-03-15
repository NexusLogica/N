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

/**
 * This is the N simulator.
 * @module N
 */
var N = N || {};
N.Comp = N.Comp || {};

N.Comp.GetTypeFunc = function() { return N.Type.Compartment; }

N.Comp.ConnectOutput = function(connection) {
  this.OutputConnections.push(connection);
}

N.Comp.ConnectInput = function(connection) {
  this.InputConnections.push(connection);
}

N.Comp.GetNumInputConnections = function() {
  return this.InputConnections.length;
}

N.Comp.GetNumOutputConnections = function() {
  return this.OutputConnections.length;
}

N.Comp.Extend = function(constructorFunction) {
  constructorFunction.prototype.GetType = N.Comp.GetTypeFunc;
  constructorFunction.prototype.ConnectOutput = N.Comp.ConnectOutput;
  constructorFunction.prototype.ConnectInput = N.Comp.ConnectInput;
  constructorFunction.prototype.GetNumInputConnections = N.Comp.GetNumInputConnections;
  constructorFunction.prototype.GetNumOutputConnections = N.Comp.GetNumOutputConnections;
}

N.Comp.Initialize = function(connection) {
  connection.InputConnections = [];
  connection.OutputConnections = [];
}

  //***************************
  //* N.Comp.OutputFromSignal *
  //***************************

/**
 * An output compartment that has a signal object as the value for the output. This is typically used as an external input
 * to a system, but it can also be used as a neuron that bursts based on an internal clock.
 *
 * The signal can be analog, discrete, or a custom signal object.
 *
 * @class Comp.OutputFromSignal
 * @param neuron
 * @param name
 * @param shortName
 * @constructor
 */
N.Comp.OutputFromSignal = function(neuron, name, shortName) {
  this.ClassName  = 'N.Comp.OutputFromSignal';
  this.Name       = name;
  this.ShortName  = (shortName && shortName.length > 0 ? shortName : N.ShortName(name));
  this.Category   = 'Output';

  this.Neuron     = neuron;
  this.Signal     = null;
  this.Output     = 0.0;
  this.IsOutputComponent = true;
  N.Comp.Initialize(this);
}

N.Comp.Extend(N.Comp.OutputFromSignal);

N.Comp.OutputFromSignal.prototype.SetSignal = function(signal) {
  this.Signal = signal;
}

N.Comp.OutputFromSignal.prototype.Update = function(t) {
  if(this.Signal) {
    this.Output = this.Signal.GetValue(t);
  }
  return this.Output;
}

N.Comp.OutputFromSignal.prototype.LoadFrom = function(json) {
  for(var i in json) {
    if(i === 'Signal') {
      this.SetSignal(N.NewN(json[i].ClassName).LoadFrom(json[i]));
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
  this.Category   = 'Output';

  this.Neuron     = neuron;
  this.Output     = 0.0;
  this.IsOutputComponent = true;
  N.Comp.Initialize(this);
}

N.Comp.Extend(N.Comp.Output);

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
  N.Comp.Initialize(this);
}

N.Comp.Extend(N.Comp.InhibitoryOutput);

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

N.Comp.LinearSummingInput = function(neuron, name, shortName) {
  this.ClassName   = 'N.Comp.LinearSummingInput';
  this.Name       = name;
  this.ShortName  = (shortName && shortName.length > 0 ? shortName : N.ShortName(name));
  this.Category   = 'Input';

  this.Neuron     = neuron;
  this.Sum         = 0.0;
  this.Connections = [];
  N.Comp.Initialize(this);
}

N.Comp.Extend(N.Comp.LinearSummingInput);

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

/**
 * A compartment that has, as its output, a signal object.
 *
 * @class Comp.SignalInput
 * @param neuron
 * @param name
 * @param shortName
 * @constructor
 */
N.Comp.SignalInput = function(neuron, name, shortName) {
  this.ClassName   = 'N.Comp.SignalInput';
  this.Name       = name;
  this.ShortName  = (shortName && shortName.length > 0 ? shortName : N.ShortName(name));
  this.Category   = 'Input';

  this.Neuron     = neuron;
  this.SignalInput = null;
  this.Sum         = 0.0;
  N.Comp.Initialize(this);
}

N.Comp.Extend(N.Comp.SignalInput);

/**
 * Sets the signal.
 * @method SetSignal
 * @param {N.Signal} signal
 * @constructor
 */
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

  //*****************************
  //* N.Comp.AcetylcholineInput *
  //*****************************

/**
 * A modulator input that receives input from acetylcholine source.
 * @class Comp.AcetylcholineInput
 * @param {N.Neuron} neuron
 * @param {String} name
 * @param {Stirng} shortName
 * @constructor
 */
N.Comp.AcetylcholineInput = function(neuron, name, shortName) {
  this.ClassName   = 'N.Comp.LinearSummingInput';
  this.Name       = name;
  this.ShortName  = (shortName && shortName.length > 0 ? shortName : N.ShortName(name));
  this.Category   = 'Input';

  this.Neuron     = neuron;
  this.Sum         = 0.0;
  this.Connections = [];
  N.Comp.Initialize(this);
}

N.Comp.Extend(N.Comp.AcetylcholineInput);

N.Comp.AcetylcholineInput.prototype.Connect = function(connection) {
  this.Connections.push(connection);
}

N.Comp.AcetylcholineInput.prototype.SumInputs = function(t) {
  var len = this.Connections.length;
  this.Sum = 0.0;
  for(var i=0; i<len; i++) {
    this.Sum += this.Connections[i].GetOutput();
  }
  return this.Sum;
}

N.Comp.AcetylcholineInput.prototype.LoadFrom = function(json) {
  for(var i in json) {
    this[i] = json[i];
  }
  return this;
}

N.Comp.AcetylcholineInput.prototype.ToJSON = function() {
  var str = JSON.stringify(this, function(k, v) { return (k === '_finder' ? undefined : v); });
  return str;
}
