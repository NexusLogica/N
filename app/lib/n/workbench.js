/**********************************************************************
 
File     : workbench.js
Project  : N Simulator Library
Purpose  : Source file for neuron relate objects.
Revisions: Original definition by Lawrence Gunn.
           2014/02/19

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

var N = N || {};

  //***************
  //* N.Workbench *
  //***************

/**
 * A network object which can contain neurons or child networks.
 * @class Workbench
 * @constructor
 */
N.Workbench = function(parentNetwork) {
  this.ClassName           = 'N.Workbench';
  this.Id                  = null;
  this.Name                = '';
  this.tests               = []; // N.WorkbenchTest array
  this.signalSources       = [];
  this.outputSinks         = [];
}

/**
 * Sets the extra templates.
 * @method AddTemplates
 * @returns {N.Workbench}
 */
N.Workbench.prototype.AddTemplates = function(templates) {
  this.AdditionalTemplates = _.cloneDeep(templates);
  return this;
}

/**
 * Adds a new blank test.
 * @method addTest
 * @returns {N.WorkbenchTest}
 */
N.Workbench.prototype.addTest = function() {
  var test = new N.WorkbenchTest(this);
  this.tests.push(test);
  return test;
}

/**
 * Runs a test.
 * @method runTest
 * @param test
 * @returns {N.WorkbenchTest}
 */
N.Workbench.prototype.runTest = function(test) {
console.log("RUN TEST");
  var network = this.Network;
  network.clear();

  var duration = test.duration;
  var inc = N.TimeStep;
  var t = 0.0;
  var maxSteps = 100000;
  var breakAfterStep = false;

  for(var i=0; i<maxSteps; i++) {
    network.update(t);
    if(breakAfterStep) {
      break;
    }
    t += inc;
    if(t >= duration) {
      t = duration;
      breakAfterStep = true;
    }
  }
}

/**
 * Returns the object type.
 * @method SetTargets
 * @returns {N.Workbench}
 */
N.Workbench.prototype.SetTargets = function(targets) {
  this.Targets = _.cloneDeep(targets);
  var config = this.CreateNetwork();

/////////  console.log(JSON.stringify(config, undefined, 2));

  this.Network = (new N.Network()).AddTemplates(this.AdditionalTemplates).LoadFrom(config);

  // Add inputs
  var inputNetwork = this.Network.GetNetworkByName('Inputs');
  var targetNetwork = this.Network.GetNetworkByName('Targets');
  var outputNetwork = this.Network.GetNetworkByName('Outputs');
  for(var i in targetNetwork.Neurons) {

    var neuron = targetNetwork.Neurons[i];

    for(var j in neuron.Compartments) {
      var compartment = neuron.Compartments[j];
///////////      console.log('Compartment name = ' + compartment.Name);
      var meta = compartment.IoMetaData;

      for(var k in meta.Inputs) {
        var inputMeta = meta.Inputs[k];
        this.addInputSource(compartment, inputMeta, inputNetwork);
      }

      for(var m in meta.Outputs) {
        var outputMeta = meta.Outputs[m];
        this.addOutputSink(compartment, outputMeta, outputNetwork);
      }
    }
  }

  this.Network.Connect();
  return this;
}

/**
 * Adds an input sink to the input network.
 * @method addInputSource
 * @returns {N.Workbench}
 */
N.Workbench.prototype.addInputSource = function(compartment, inputMeta, inputNetwork) {
  var cleanName = N.CleanName(compartment.Neuron.Name);
  var cleanCompartmentName = N.CleanName(compartment.Name+(inputMeta.Name !== 'Main' ? '['+inputMeta.Name+']' : ''));
  var fullCleanName = 'SRC['+cleanName+(!_.isEmpty(cleanCompartmentName) ? '-'+cleanCompartmentName : '')+']';

  var source = (new N.Neuron(inputNetwork)).SetName(fullCleanName);
  source.Display = {
    Template: 'N.UI.StandardNeuronTemplates.InputSource',
    Radius: 0.1,
    CompartmentMap : { 'Body': 'OP'  }
  }

  var sourceCompartment = new N.Comp.SignalSource(source, 'OP');
  source.AddCompartment(sourceCompartment);

  this.signalSources.push(sourceCompartment.GetPath());

  inputNetwork.AddNeuron(source);

  var connection = new N.Connection(this.Network);
  connection.Path = 'Inputs:'+fullCleanName+'>OP->Targets:'+compartment.Neuron.Name+'>'+compartment.Name+(inputMeta.Name !== 'Main' ? '['+inputMeta.Name+']': '');

  this.Network.AddConnection(connection);
}

/**
 * Adds an output sink to the output network.
 * @method addOutputSink
 * @returns {N.Workbench}
 */
N.Workbench.prototype.addOutputSink = function(compartment, outputMeta, outputNetwork) {
  var cleanName = N.CleanName(compartment.Neuron.Name);
  var cleanCompartmentName = N.CleanName(compartment.Name+(outputMeta.Name !== 'Main' ? '['+outputMeta.Name+']' : ''));
  var fullCleanName = 'SNK['+cleanName+(!_.isEmpty(cleanCompartmentName) ? '-'+cleanCompartmentName : '')+']';

  var sink = (new N.Neuron(outputNetwork)).SetName(fullCleanName);
  sink.Display = {
    Template: 'N.UI.StandardNeuronTemplates.OutputSink',
    Radius: 0.125,
    CompartmentMap : { 'Input': 'IP'  }
  }

  var sinkCompartment = new N.Comp.InputSink(sink, 'IP');
  sink.AddCompartment(sinkCompartment);


  this.outputSinks.push(sinkCompartment.GetPath());

  outputNetwork.AddNeuron(sink);

  var connection = new N.Connection(this.Network);
  connection.Path = 'Targets:'+compartment.Neuron.Name+'>'+compartment.Name+(outputMeta.Name !== 'Main' ? '['+outputMeta.Name+']': '')+'->Outputs:'+fullCleanName+'>IP';

  this.Network.AddConnection(connection);
}

/**
 * Creates a network.
 * @method CreateNetwork
 * @returns {Object}
 */
N.Workbench.prototype.CreateNetwork = function() {
  var config = { Networks: [], Connections: [] };
  var inputNetwork = { Name: 'Inputs', Neurons: [] };
  var targetNetwork = { Name: 'Targets', Neurons: this.Targets };
  var outputNetwork = { Name: 'Outputs', Neurons: [] };
  config.Networks.push(inputNetwork);
  config.Networks.push(targetNetwork);
  config.Networks.push(outputNetwork);
  return config;
}
