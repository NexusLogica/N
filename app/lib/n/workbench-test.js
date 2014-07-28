/**********************************************************************
 
File     : workbench-test.js
Project  : N Simulator Library
Purpose  : Source file for workbench test definition objects.
Revisions: Original definition by Lawrence Gunn.
           2014/07/23

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

var N = N || {};

  //*******************
  //* N.WorkbenchTest *
  //*******************

/**
 * A network object which can contain neurons or child networks.
 * @class Workbench
 * @constructor
 */
N.WorkbenchTest = function(parentNetwork) {
  this.ClassName           = 'N.WorkbenchTest';
  this.Id                  = null;
  this.name                = '';
  this.inputSignals        = [];
  this.inputSignals.push({ type: 'voltage', start: 0.0, duration: 0.010, shape: 'square', amplitude: '0.02'});
}

/**
 * Sets the extra templates.
 * @method AddTemplates
 * @returns {N.WorkbenchTest}
 */
N.WorkbenchTest.prototype.AddTemplates = function(templates) {
  this.AdditionalTemplates = _.cloneDeep(templates);
  return this;
}

/**
 * Returns the object type.
 * @method SetTargets
 * @returns {N.WorkbenchTest}
 */
N.WorkbenchTest.prototype.SetTargets = function(targets) {
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
        this.AddInputSource(compartment, inputMeta, inputNetwork);
      }

      for(var m in meta.Outputs) {
        var outputMeta = meta.Outputs[m];
        this.AddOutputSource(compartment, outputMeta, outputNetwork);
      }
    }
  }

  this.Network.Connect();
  return this;
}

/**
 * Adds an input sink to the input network.
 * @method AddInputSource
 * @returns {N.WorkbenchTest}
 */
N.WorkbenchTest.prototype.AddInputSource = function(compartment, inputMeta, inputNetwork) {
  var cleanName = N.CleanName(compartment.Neuron.Name);
  var cleanCompartmentName = N.CleanName(compartment.Name+(inputMeta.Name !== 'Main' ? '['+inputMeta.Name+']' : ''));
  var fullCleanName = 'SRC['+cleanName+(!_.isEmpty(cleanCompartmentName) ? '-'+cleanCompartmentName : '')+']';

  var source = (new N.Neuron(inputNetwork)).SetName(fullCleanName);
  source.Display = {
    Template: 'N.UI.StandardNeuronTemplates.InputSource',
    Radius: 0.1,
    CompartmentMap : { 'Body': 'OP'  }
  }

  var sourceCompartment = new N.Comp.OutputFromSignal(source, 'OP');
  source.AddCompartment(sourceCompartment);

  inputNetwork.AddNeuron(source);

  var connection = new N.Connection(this.Network);
  connection.Path = 'Inputs:'+fullCleanName+'>OP->Targets:'+compartment.Neuron.Name+'>'+compartment.Name+(inputMeta.Name !== 'Main' ? '['+inputMeta.Name+']': '');

  this.Network.AddConnection(connection);
}

/**
 * Adds an output sink to the output network.
 * @method AddOutputSource
 * @returns {N.WorkbenchTest}
 */
N.WorkbenchTest.prototype.AddOutputSource = function(compartment, outputMeta, outputNetwork) {
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
N.WorkbenchTest.prototype.CreateNetwork = function() {
  var config = { Networks: [], Connections: [] };
  var inputNetwork = { Name: 'Inputs', Neurons: [] };
  var targetNetwork = { Name: 'Targets', Neurons: this.Targets };
  var outputNetwork = { Name: 'Outputs', Neurons: [] };
  config.Networks.push(inputNetwork);
  config.Networks.push(targetNetwork);
  config.Networks.push(outputNetwork);
  return config;
}
