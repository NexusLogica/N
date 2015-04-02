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

N.Comp.getTypeFunc = function() { return N.Type.compartment; }

N.Comp.connectOutput = function(connection) {
  this.outputConnections.push(connection);
  return this;
}

N.Comp.connectInput = function(connection) {
  this.inputConnections.push(connection);
  return this;
}

N.Comp.getNumInputConnections = function() {
  return this.inputConnections.length;
}

N.Comp.getNumOutputConnections = function() {
  return this.outputConnections.length;
}

N.Comp.getPath = function() {
  return this.neuron.getPath()+'>'+this.name;
}

N.Comp.addComparmentSink = function(compartment) {
  this.compartmentSinks.push(compartment);
}

N.Comp.getNumComparmentSinks = function() {
  return this.compartmentSinks.length;
}

N.Comp.connectToCompartments = function() {
  if(this.outputLogic) {
    for(var i in this.outputLogic.sources) {
      var source = this.outputLogic.sources[i];
      source.compartment = this.neuron.getCompartmentByName(source.componentName);
      source.compartment.addComparmentSink(this);
      if(!source.compartment) {
        this.neuron.network.getRoot().linkReport.error(this.getPath(), 'N.Comp.connectToCompartments: Unable to find component '+source.componentName);
      }
      if(!source.hasOwnProperty('Delay')) {
        source.delay = N.timeStep;
      }
    }
  }
}

N.Comp.getOutputAt = function(t) {
  if(t < this.outputStore.timeMin) {
    return this.preSignalOutput;
  }
  return this.outputStore.getValue(t);
}

N.Comp.loadFrom = function(json) {
  var deferred = Q.defer();
  for(var i in json) {
    if(i === 'outputStore') {
      this.outputStore.loadFrom(json[i]);
    }
    this[i] = json[i];
  }
  deferred.resolve();
  return deferred.promise;
}

N.Comp.extend = function(constructorFunction) {
  constructorFunction.prototype.getType = N.Comp.getTypeFunc;
  constructorFunction.prototype.connectOutput = N.Comp.connectOutput;
  constructorFunction.prototype.connectInput = N.Comp.connectInput;
  constructorFunction.prototype.getNumInputConnections = N.Comp.getNumInputConnections;
  constructorFunction.prototype.getNumOutputConnections = N.Comp.getNumOutputConnections;
  constructorFunction.prototype.getPath = N.Comp.getPath;
  constructorFunction.prototype.addComparmentSink = N.Comp.addComparmentSink;
  constructorFunction.prototype.getNumComparmentSinks = N.Comp.getNumComparmentSinks;
  constructorFunction.prototype.connectToCompartments = N.Comp.connectToCompartments;
  constructorFunction.prototype.getOutputAt = N.Comp.getOutputAt;
  constructorFunction.prototype.loadFrom = N.Comp.loadFrom;
}

N.Comp.initializeCompartment = function(compartment) {
  compartment.outputStore = new N.AnalogSignal('outputStore', 'OS');
  compartment.inputConnections = [];
  compartment.outputConnections = [];
  compartment.compartmentSinks = [];
  compartment.preSignalOutput = 0.0;
}

  //***********************
  //* N.Comp.SignalSource *
  //***********************

/**
 * An output compartment that has a signal object as the value for the output. This is typically used as an external input
 * to a system, but it can also be used as a neuron that bursts based on an internal clock.
 *
 * The signal can be analog, discrete, or a custom signal object.
 *
 * @class Comp.SignalSource
 * @param neuron
 * @param name
 * @constructor
 */
N.Comp.SignalSource = function(neuron, name) {
  this.className  = 'N.Comp.SignalSource';
  this.name  = name;
  this.category   = 'Output';

  this.neuron     = neuron;
  this.signal     = null;
  this.output     = 0.0;
  this.IsOutputComponent = true;
  this.ioMetaData = {
    inputs:[],
    outputs:[{
      name: 'main', propName: 'outputConnections'
    }],
    signals:[{
      name: 'main', propName: 'outputStore'
    }]
  };
  N.Comp.initializeCompartment(this);
};

N.Comp.extend(N.Comp.SignalSource);

N.Comp.SignalSource.prototype.setSignal = function(outputName, signal) {
  this.signal = signal;
};

/**
 * Upates the output value of the compartment. The output value is from the signal object.
 * @method update
 * @param t
 * @returns {float}
 */
N.Comp.SignalSource.prototype.update = function(t) {
  if(this.signal) {
    this.output = this.signal.getValue(t);
  }
  this.outputStore.appendData(t, this.output);
  return this.output;
};

/***
 * Clears stored data from previous simulations. Does not clear input data.
 * @method clear
 */
N.Comp.SignalSource.prototype.clear = function() {
  this.outputStore.clear();
};

N.Comp.SignalSource.prototype.loadFrom = function(json) {
  var deferred = Q.defer();
  for(var i in json) {
    if(i === 'Signal') {
      // TODO: figure out how to incorporate name
      this.SetSignal('main', N.newN(json[i].className).loadFrom(json[i]));
    }
    else { this[i] = json[i]; }
  }
  deferred.resolve();
  return deferred.promise;
}

N.Comp.SignalSource.prototype.validate = function(report) {
  if(!this.signal) { report.warning(this.getPath(), 'Signal object is not set.'); }
  if(this.getNumInputConnections() !== 0) { report.warning(this.getPath(), 'Input connections to the output signal are ignored.'); }
  if(this.getNumOutputConnections() === 0) { report.warning(this.getPath(), 'The output component has no output connections.'); }
}

  //**********************
  //* N.Comp.InputSource *
  //**********************

N.Comp.InputSource = function(neuron, name) {
  this.className   = 'N.Comp.InputSource';
  this.name        = name;
  this.category    = 'Output';

  this.neuron      = neuron;
  this.output      = 0.0;
  this.IsOutputComponent = true;
  this.outputLogic = null;
  this.ioMetaData = {
    inputs:[{
      name: 'main', propName: 'inputConnections'
    }],
    outputs:[{
      name: 'main', propName: 'outputConnections'
    }],
    signals:[{
      name: 'main', propName: 'outputStore'
    }]
  };
  N.Comp.initializeCompartment(this);
};

N.Comp.extend(N.Comp.InputSource);

N.Comp.InputSource.prototype.addInput = function(input) {
  this.input = input;
};

N.Comp.InputSource.prototype.update = function(t) {
  var main = this.outputLogic.sources.main;
  this.output = main.compartment.getOutputAt(t-main.delay);
  this.outputStore.appendData(t, this.output);
  return this.output;
};

/***
 * Clears stored data from previous simulations. Does not clear input data.
 * @method clear
 */
N.Comp.InputSource.prototype.clear = function() {
  this.outputStore.clear();
};

/**
 * Validates the output compartment. Reports an error of there is no output Warns if there are no compartments.
 * @method Validate
 * @param report
 */
N.Comp.InputSource.prototype.validate = function(report) {
  if(!this.outputLogic) {
    report.error(this.getPath(), 'The OutputLogic object is not set.');
  } else if(!this.outputLogic.outputFunc) {
    report.error(this.getPath(), 'The OutputLogic\'s outputFunc is not set.');
  }
  else {
    this.outputLogic.outputFunc.validate(this, report);
  }

  if(this.getNumInputConnections()  !== 0) { report.warning(this.getPath(), 'Input connections to the output signal are ignored.'); }
  if(this.getNumOutputConnections() === 0) { report.warning(this.getPath(), 'The output component has no output connections.'); }
};

  //*********************
  //* N.Comp.OutputSink *
  //*********************
/**
 * A component that acts as an end sink. It should have inputs but no outputs.
 * @class N.Comp.OutputSink
 * @param neuron
 * @param name
 * @constructor
 */
N.Comp.OutputSink = function(neuron, name) {
  this.className   = 'N.Comp.OutputSink';
  this.name        = name;
  this.category    = 'Output';

  this.neuron      = neuron;
  this.output      = 0.0;
  this.isOutputComponent = true;
  this.outputLogic = null;
  this.ioMetaData = {
    inputs:[{
      name: 'main', propName: 'inputConnections'
    }],
    outputs:[],
    signals:[{
      name: 'main', propName: 'outputStore'
    }]
  };
  N.Comp.initializeCompartment(this);
};

N.Comp.extend(N.Comp.OutputSink);

N.Comp.OutputSink.prototype.addInput = function(input) {
  this.input = input;
};

N.Comp.OutputSink.prototype.update = function(t) {
  var len = this.inputConnections.length;
  this.output = 0.0;
  for(var i=0; i<len; i++) {
    this.output += this.inputConnections[i].output;
  }
  this.outputStore.appendData(t, this.output);
  return this.output;
};

/***
 * Clears stored data from previous simulations. Does not clear input data.
 * @method clear
 */
N.Comp.OutputSink.prototype.clear = function() {
  this.outputStore.clear();
};

/**
 * Validates the output compartment. Reports an error of there is no output Warns if there are no compartments.
 * @method Validate
 * @param report
 */
N.Comp.OutputSink.prototype.validate = function(report) {
  if(this.getNumInputConnections()  === 0) { report.warning(this.getPath(), 'The input sink has no input connections.'); }
  if(this.getNumOutputConnections() !== 0) { report.warning(this.getPath(), 'The input only component has output connections.'); }
}

N.Comp.OutputSink.prototype.loadFrom = function(json) {
  var deferred = Q.defer();
  for(var i in json) {
    this[i] = json[i];
  }
  deferred.resolve();
  return deferred.promise;
}

  //***************************
  //* N.Comp.InhibitoryOutput *
  //***************************

N.Comp.InhibitoryOutput = function(neuron, name) {
  this.className  = 'N.Comp.InhibitoryOutput';
  this.name       = name;
  this.category   = 'InhibitoryOutput';

  this.neuron     = neuron;
  this.output     = 0.0;
  this.isOutputComponent = true;
  N.Comp.initializeCompartment(this);
}

N.Comp.extend(N.Comp.InhibitoryOutput);

N.Comp.InhibitoryOutput.prototype.addInput = function(input) {
  this.input = input;
}

N.Comp.InhibitoryOutput.prototype.update = function(t) {
  if(this.input) {
    this.output = this.input.updateInput(t);
  }
  this.outputStore.appendData(t, this.output);
  return this.output;
}

/***
 * Clears stored data from previous simulations. Does not clear input data.
 * @method clear
 */
N.Comp.InhibitoryOutput.prototype.clear = function() {
  this.outputStore.clear();
}

N.Comp.InhibitoryOutput.prototype.loadFrom = function(json) {
  var deferred = Q.defer();
  for(var i in json) {
    this[i] = json[i];
  }
  deferred.resolve();
  return deferred.promise;
}

  //*****************************
  //* N.Comp.LinearSummingInput *
  //*****************************

N.Comp.LinearSummingInput = function(neuron, name) {
  this.className   = 'N.Comp.LinearSummingInput';
  this.name       = name;
  this.category   = 'Input';

  this.neuron     = neuron;
  this.sum         = 0.0;
  this.connections = [];
  this.ioMetaData = {
    inputs:[
      { name: 'main', propName: 'inputConnections' }
    ],
    outputs:[],
    signals:[{
      name: 'main', propName: 'outputStore'
    }]
  };
  N.Comp.initializeCompartment(this);
};

N.Comp.extend(N.Comp.LinearSummingInput);

N.Comp.LinearSummingInput.prototype.connect = function(connection) {
  this.connections.push(connection);
};

/**
 * Sum the inputs.
 * @method sumInputs
 * @returns {float}
 */
N.Comp.LinearSummingInput.prototype.sumInputs = function() {
  var len = this.inputConnections.length;
  this.sum = 0.0;
  for(var i=0; i<len; i++) {
    this.sum += this.inputConnections[i].output;
  }
  return this.sum;
};

/**
 * update the output of the compartment.
 * @method update
 * @param {float} t Time
 * @returns {float}
 */
N.Comp.LinearSummingInput.prototype.update = function(t) {
  this.outputStore.appendData(t, this.sumInputs());
};

/***
 * Clears stored data from previous simulations. Does not clear input data.
 * @method clear
 */
N.Comp.LinearSummingInput.prototype.clear = function() {
  this.outputStore.clear();
}

/**
 * Validates the output compartment. Reports an error of there is no output Warns if there are no compartments.
 * @method Validate
 * @param report
 */
N.Comp.LinearSummingInput.prototype.validate = function(report) {
  if(this.getNumOutputConnections() !== 0) { report.warning(this.getPath(), 'The input component has output connections.'); }
  if(this.getNumInputConnections() === 0) { report.warning(this.getPath(), 'The input component has no input connections.'); }
  if(this.getNumComparmentSinks() === 0)   { report.warning(this.getPath(), 'The input component has no compartmental listeners.'); }
}

N.Comp.LinearSummingInput.prototype.loadFrom = function(json) {
  var deferred = Q.defer();
  for(var i in json) {
    this[i] = json[i];
  }
  deferred.resolve();
  return deferred.promise;
}

N.Comp.LinearSummingInput.prototype.toJSON = function() {
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
  this.className   = 'N.Comp.SignalInput';
  this.name       = name;
  this.category   = 'Input';

  this.neuron     = neuron;
  this.signalInput = null;
  this.sum         = 0.0;
  N.Comp.initializeCompartment(this);
}

N.Comp.extend(N.Comp.SignalInput);

/**
 * Sets the signal.
 * @method SetSignal
 * @param {N.Signal} signal
 * @constructor
 */
N.Comp.SignalInput.prototype.setSignal = function(outputName, signal) {
  this.signalInput = signal;
}

N.Comp.SignalInput.prototype.updateInput = function(t) {
  if(this.signalInput) {
    this.sum = this.signalInput.getValue(t);
  }
  return this.sum;
}

/**
 * Validates the compartment.
 * @method Validate
 * @param report
 */
N.Comp.SignalInput.prototype.validate = function(report) {
  if(this.getNumInputConnections() !== 0)  { report.warning(this.getPath(), 'The component does not use input connections.'); }
  if(this.getNumComparmentSinks() === 0)   { report.warning(this.getPath(), 'The component has no compartmental listeners.'); }
  if(this.getNumOutputConnections() !== 0) { report.warning(this.getPath(), 'The component has output connections. It is an not intended as an output component (but can be used that way)'); }
}

N.Comp.SignalInput.prototype.loadFrom = function(json) {
  var deferred = Q.defer();
  for(var i in json) {
    if(i === 'signalInput') {
      this.signalInput = N.newN(json[i].className).loadFrom(json[i]);
    }
    else { this[i] = json[i]; }
  }
  deferred.resolve();
  return deferred.promise;
}

N.Comp.SignalInput.prototype.toJSON = function() {
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
  this.className   = 'N.Comp.LinearSummingInput';
  this.name       = name;
  this.category   = 'Input';

  this.neuron     = neuron;
  this.sum         = 0.0;
  this.connections = [];
  N.Comp.initializeCompartment(this);
}

N.Comp.extend(N.Comp.AcetylcholineInput);

N.Comp.AcetylcholineInput.prototype.connect = function(connection) {
  this.connections.push(connection);
}

N.Comp.AcetylcholineInput.prototype.sumInputs = function(t) {
  var len = this.connections.length;
  this.sum = 0.0;
  for(var i=0; i<len; i++) {
    this.sum += this.connections[i].getOutput();
  }
  return this.sum;
}

/**
 * Updates the output of the compartment.
 * @method update
 * @param {float} t Time
 * @returns {float}
 */
N.Comp.AcetylcholineInput.prototype.update = function(t) {
  this.outputStore.appendData(t, this.sumInputs());
}

/***
 * Clears stored data from previous simulations. Does not clear input data.
 * @method clear
 */
N.Comp.AcetylcholineInput.prototype.clear = function() {
  this.outputStore.clear();
}

/**
 * Validates the output compartment. Reports an error of there is no output Warns if there are no compartments.
 * @method Validate
 * @param report
 */
N.Comp.AcetylcholineInput.prototype.validate = function(report) {
  if(this.getNumInputConnections() === 0) { report.warning(this.getPath(), 'The input component has no input connections.'); }
  if(this.getNumComparmentSinks() === 0) { report.warning(this.getPath(), 'The input component has no compartmental listeners.'); }
  if(this.getNumOutputConnections() !== 0) { report.warning(this.getPath(), 'The input component has output connections.'); }
}

N.Comp.AcetylcholineInput.prototype.loadFrom = function(json) {
  var deferred = Q.defer();
  for(var i in json) {
    this[i] = json[i];
  }
  deferred.resolve();
  return deferred.promise;
}

N.Comp.AcetylcholineInput.prototype.toJSON = function() {
  var str = JSON.stringify(this, function(k, v) { return (k === '_finder' ? undefined : v); });
  return str;
}
