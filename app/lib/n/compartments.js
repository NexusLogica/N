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
N.Comp.UpdateFunc = N.Comp.UpdateFunc || {};

N.Comp.GetTypeFunc = function() { return N.Type.Compartment; }

N.Comp.ConnectOutput = function(connection) {
  this.OutputConnections.push(connection);
  return this;
}

N.Comp.ConnectInput = function(connection) {
  this.InputConnections.push(connection);
  return this;
}

N.Comp.GetNumInputConnections = function() {
  return this.InputConnections.length;
}

N.Comp.GetNumOutputConnections = function() {
  return this.OutputConnections.length;
}

N.Comp.GetPath = function() {
  return this.Neuron.GetPath()+'>'+this.Name;
}

N.Comp.AddComparmentSink = function(compartment) {
  this.CompartmentSinks.push(compartment);
}

N.Comp.GetNumComparmentSinks = function() {
  return this.CompartmentSinks.length;
}

N.Comp.ConnectToCompartments = function() {
  if(this.OutputLogic) {
    for(var i in this.OutputLogic.Sources) {
      var source = this.OutputLogic.Sources[i];
      source.Compartment = this.Neuron.GetCompartmentByName(source.ComponentName);
      source.Compartment.AddComparmentSink(this);
      if(!source.Compartment) {
        this.Neuron.Network.GetRoot().LinkReport.Error(this.GetPath(), 'N.Comp.ConnectToCompartments: Unable to find component '+source.ComponentName);
      }
      if(!source.hasOwnProperty('Delay')) {
        source.Delay = 1;
      }
    }
  }
}

N.Comp.GetOutputAt = function(t) {
  if(t < this.OutputStore.TimeMin) {
    return this.PreSignalOutput;
  }
  return this.OutputStore.GetValue(t);
}

N.Comp.LoadFrom = function(json) {
  for(var i in json) {
    if(i === 'OutputStore') {
      this.OutputStore.LoadFrom(json[i]);
    }
    this[i] = json[i];
  }
  return this;
}

N.Comp.Extend = function(constructorFunction) {
  constructorFunction.prototype.GetType = N.Comp.GetTypeFunc;
  constructorFunction.prototype.ConnectOutput = N.Comp.ConnectOutput;
  constructorFunction.prototype.ConnectInput = N.Comp.ConnectInput;
  constructorFunction.prototype.GetNumInputConnections = N.Comp.GetNumInputConnections;
  constructorFunction.prototype.GetNumOutputConnections = N.Comp.GetNumOutputConnections;
  constructorFunction.prototype.GetPath = N.Comp.GetPath;
  constructorFunction.prototype.AddComparmentSink = N.Comp.AddComparmentSink;
  constructorFunction.prototype.GetNumComparmentSinks = N.Comp.GetNumComparmentSinks;
  constructorFunction.prototype.ConnectToCompartments = N.Comp.ConnectToCompartments;
  constructorFunction.prototype.GetOutputAt = N.Comp.GetOutputAt;
  constructorFunction.prototype.LoadFrom = N.Comp.LoadFrom;
}

N.Comp.InitializeCompartment = function(compartment) {
  compartment.OutputStore = new N.AnalogSignal('OutputStore', 'OS');
  compartment.InputConnections = [];
  compartment.OutputConnections = [];
  compartment.CompartmentSinks = [];
  compartment.PreSignalOutput = 0.0;
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
 * @constructor
 */
N.Comp.OutputFromSignal = function(neuron, name) {
  this.ClassName  = 'N.Comp.OutputFromSignal';
  this.Name  = name;
  this.Category   = 'Output';

  this.Neuron     = neuron;
  this.Signal     = null;
  this.Output     = 0.0;
  this.IsOutputComponent = true;
  this.IoMetaData = {
    Inputs:[],
    Outputs:[{
      Name: 'Main', PropName: 'OutputConnections'
    }],
    Signals:[{
      Name: 'Main', PropName: 'OutputStore'
    }]
  }
  N.Comp.InitializeCompartment(this);
}

N.Comp.Extend(N.Comp.OutputFromSignal);

N.Comp.OutputFromSignal.prototype.SetSignal = function(signal) {
  this.Signal = signal;
}

/**
 * Upates the output value of the compartment. The output value is from the signal object.
 * @method Update
 * @param t
 * @returns {Real}
 */
N.Comp.OutputFromSignal.prototype.Update = function(t) {
  if(this.Signal) {
    this.Output = this.Signal.GetValue(t);
  }
  this.OutputStore.AppendData(t, this.Output);
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

N.Comp.OutputFromSignal.prototype.Validate = function(report) {
  if(!this.Signal) { report.Warning(this.GetPath(), 'Signal object is not set.'); }
  if(this.GetNumInputConnections() !== 0) { report.Warning(this.GetPath(), 'Input connections to the output signal are ignored.'); }
  if(this.GetNumOutputConnections() === 0) { report.Warning(this.GetPath(), 'The output component has no output connections.'); }
}

  //*****************
  //* N.Comp.Output *
  //*****************

N.Comp.Output = function(neuron, name) {
  this.ClassName   = 'N.Comp.Output';
  this.Name        = name;
  this.Category    = 'Output';

  this.Neuron      = neuron;
  this.Output      = 0.0;
  this.IsOutputComponent = true;
  this.OutputLogic = null;
  this.IoMetaData = {
    Inputs:[{
      Name: 'Main', PropName: 'InputConnections'
    }],
    Outputs:[{
      Name: 'Main', PropName: 'OutputConnections'
    }],
    Signals:[{
      Name: 'Main', PropName: 'OutputStore'
    }]
  }
  N.Comp.InitializeCompartment(this);
}

N.Comp.Extend(N.Comp.Output);

N.Comp.Output.prototype.AddInput = function(input) {
  this.Input = input;
}

N.Comp.Output.prototype.Update = function(t) {
  var main = this.OutputLogic.Sources.Main;
  this.Output = main.Compartment.GetOutputAt(t-main.Delay);
  this.OutputStore.AppendData(t, this.Output);
  return this.Output;
}

/**
 * Validates the output compartment. Reports an error of there is no output Warns if there are no compartments.
 * @method Validate
 * @param report
 */
N.Comp.Output.prototype.Validate = function(report) {
  if(!this.OutputLogic) {
    report.Error(this.GetPath(), 'The OutputLogic object is not set.');
  } else if(!this.OutputLogic.OutputFunc) {
    report.Error(this.GetPath(), 'The OutputLogic\'s OutputFunc is not set.');
  }
  else {
    this.OutputLogic.OutputFunc.Validate(this, report);
  }

  if(this.GetNumInputConnections()  !== 0) { report.Warning(this.GetPath(), 'Input connections to the output signal are ignored.'); }
  if(this.GetNumOutputConnections() === 0) { report.Warning(this.GetPath(), 'The output component has no output connections.'); }
}

  //********************
  //* N.Comp.InputSink *
  //********************
/**
 * A component that acts as an end sink. It should have inputs but no outputs.
 * @class N.Comp.InputSink
 * @param neuron
 * @param name
 * @constructor
 */
N.Comp.InputSink = function(neuron, name) {
  this.ClassName   = 'N.Comp.InputSink';
  this.Name        = name;
  this.Category    = 'Output';

  this.Neuron      = neuron;
  this.Output      = 0.0;
  this.IsOutputComponent = true;
  this.OutputLogic = null;
  this.IoMetaData = {
    Inputs:[{
      Name: 'Main', PropName: 'InputConnections'
    }],
    Outputs:[],
    Signals:[{
      Name: 'Main', PropName: 'OutputStore'
    }]
  }
  N.Comp.InitializeCompartment(this);
}

N.Comp.Extend(N.Comp.InputSink);

N.Comp.InputSink.prototype.AddInput = function(input) {
  this.Input = input;
}

N.Comp.InputSink.prototype.Update = function(t) {
  var len = this.InputConnections.length;
  this.Output = 0.0;
  for(var i=0; i<len; i++) {
    this.Output += this.InputConnections[i].Output;
  }
  this.OutputStore.AppendData(t, this.Output);
  return this.Output;
}

/**
 * Validates the output compartment. Reports an error of there is no output Warns if there are no compartments.
 * @method Validate
 * @param report
 */
N.Comp.InputSink.prototype.Validate = function(report) {
  if(this.GetNumInputConnections()  === 0) { report.Warning(this.GetPath(), 'The input sink has no input connections.'); }
  if(this.GetNumOutputConnections() !== 0) { report.Warning(this.GetPath(), 'The input only component has output connections.'); }
}

N.Comp.InputSink.prototype.LoadFrom = function(json) {
  for(var i in json) {
    this[i] = json[i];
  }
  return this;
}

  //***************************
  //* N.Comp.InhibitoryOutput *
  //***************************

N.Comp.InhibitoryOutput = function(neuron, name) {
  this.ClassName  = 'N.Comp.InhibitoryOutput';
  this.Name       = name;
  this.Category   = 'InhibitoryOutput';

  this.Neuron     = neuron;
  this.Output     = 0.0;
  this.IsOutputComponent = true;
  N.Comp.InitializeCompartment(this);
}

N.Comp.Extend(N.Comp.InhibitoryOutput);

N.Comp.InhibitoryOutput.prototype.AddInput = function(input) {
  this.Input = input;
}

N.Comp.InhibitoryOutput.prototype.Update = function(t) {
  if(this.Input) {
    this.Output = this.Input.UpdateInput(t);
  }
  this.OutputStore.AppendData(t, this.Output);
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

N.Comp.LinearSummingInput = function(neuron, name) {
  this.ClassName   = 'N.Comp.LinearSummingInput';
  this.Name       = name;
  this.Category   = 'Input';

  this.Neuron     = neuron;
  this.Sum         = 0.0;
  this.Connections = [];
  this.IoMetaData = {
    Inputs:[
      { Name: 'Main', PropName: 'InputConnections' }
    ],
    Outputs:[],
    Signals:[{
      Name: 'Main', PropName: 'OutputStore'
    }]
  }
  N.Comp.InitializeCompartment(this);
}

N.Comp.Extend(N.Comp.LinearSummingInput);

N.Comp.LinearSummingInput.prototype.Connect = function(connection) {
  this.Connections.push(connection);
}

/**
 * Sum the inputs.
 * @method SumInputs
 * @returns {Real}
 */
N.Comp.LinearSummingInput.prototype.SumInputs = function() {
  var len = this.InputConnections.length;
  this.Sum = 0.0;
  for(var i=0; i<len; i++) {
    this.Sum += this.InputConnections[i].Output;
  }
  return this.Sum;
}

/**
 * Update the output of the compartment.
 * @method Update
 * @param {Real} t Time
 * @returns {Real}
 */
N.Comp.LinearSummingInput.prototype.Update = function(t) {
  this.OutputStore.AppendData(t, this.SumInputs());
}

/**
 * Validates the output compartment. Reports an error of there is no output Warns if there are no compartments.
 * @method Validate
 * @param report
 */
N.Comp.LinearSummingInput.prototype.Validate = function(report) {
  if(this.GetNumOutputConnections() !== 0) { report.Warning(this.GetPath(), 'The input component has output connections.'); }
  if(this.GetNumInputConnections() === 0) { report.Warning(this.GetPath(), 'The input component has no input connections.'); }
  if(this.GetNumComparmentSinks() === 0)   { report.Warning(this.GetPath(), 'The input component has no compartmental listeners.'); }
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
 * @constructor
 */
N.Comp.SignalInput = function(neuron, name) {
  this.ClassName   = 'N.Comp.SignalInput';
  this.Name       = name;
  this.Category   = 'Input';

  this.Neuron     = neuron;
  this.SignalInput = null;
  this.Sum         = 0.0;
  N.Comp.InitializeCompartment(this);
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

/**
 * Validates the compartment.
 * @method Validate
 * @param report
 */
N.Comp.SignalInput.prototype.Validate = function(report) {
  if(this.GetNumInputConnections() !== 0)  { report.Warning(this.GetPath(), 'The component does not use input connections.'); }
  if(this.GetNumComparmentSinks() === 0)   { report.Warning(this.GetPath(), 'The component has no compartmental listeners.'); }
  if(this.GetNumOutputConnections() !== 0) { report.Warning(this.GetPath(), 'The component has output connections. It is an not intended as an output component (but can be used that way)'); }
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
 * @constructor
 */
N.Comp.AcetylcholineInput = function(neuron, name) {
  this.ClassName   = 'N.Comp.LinearSummingInput';
  this.Name       = name;
  this.Category   = 'Input';

  this.Neuron     = neuron;
  this.Sum         = 0.0;
  this.Connections = [];
  N.Comp.InitializeCompartment(this);
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

/**
 * Update the output of the compartment.
 * @method Update
 * @param {Real} t Time
 * @returns {Real}
 */
N.Comp.AcetylcholineInput.prototype.Update = function(t) {
  this.OutputStore.AppendData(t, this.SumInputs());
}

/**
 * Validates the output compartment. Reports an error of there is no output Warns if there are no compartments.
 * @method Validate
 * @param report
 */
N.Comp.AcetylcholineInput.prototype.Validate = function(report) {
  if(this.GetNumInputConnections() === 0) { report.Warning(this.GetPath(), 'The input component has no input connections.'); }
  if(this.GetNumComparmentSinks() === 0) { report.Warning(this.GetPath(), 'The input component has no compartmental listeners.'); }
  if(this.GetNumOutputConnections() !== 0) { report.Warning(this.GetPath(), 'The input component has output connections.'); }
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
