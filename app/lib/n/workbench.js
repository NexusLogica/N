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
 * Returns the object type.
 * @method SetTargets
 * @returns {N.Workbench}
 */
N.Workbench.prototype.SetTargets = function(targets) {
  this.Targets = _.cloneDeep(targets);
  var config = this.CreateNetwork();
  console.log(JSON.stringify(config, undefined, 2));
  this.Network = (new N.Network()).AddTemplates(this.AdditionalTemplates).LoadFrom(config);

  // Add inputs
  var inputNetwork = this.Network.GetNetworkByName('Inputs');
  var targetNetwork = this.Network.GetNetworkByName('Targets');
  for(var i in targetNetwork.Neurons) {
    var neuron = targetNetwork.Neurons[i];
    for(var j in neuron.Compartments) {
      var compartment = neuron.Compartments[j];
      console.log('Compartment name = ' + compartment.Name);
      var meta = compartment.IoMetaData;
      for(var k in meta.Inputs) {
        var inputMeta = meta.Inputs[k];
        this.AddInputSource(compartment, inputMeta, inputNetwork);
      }
    }
  }

  var outputNetwork = this.Network.GetNetworkByName('Outputs');

  this.Network.Connect();
  return this;
}

/**
 * Returns the object type.
 * @method AddInputSource
 * @returns {N.Workbench}
 */
N.Workbench.prototype.AddInputSource = function(compartment, inputMeta, inputNetwork) {
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
  connection.Path = 'Inputs:'+fullCleanName+'>OP->Targets:'+compartment.Neuron.Name+'>'+compartment.Name+(inputMeta.Name != 'Main' ? '['+inputMeta.Name+']': '');

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
