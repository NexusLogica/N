/**********************************************************************
 
File     : workbench.js
Project  : N Simulator Library
Purpose  : Source file for a workbench object.
Revisions: Original definition by Lawrence Gunn.
           2014/07/19

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
N.Workbench = function() {
  this.className           = 'N.Workbench';
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
  var deferred = Q.defer();
  var _this = this;

  this.Targets = _.cloneDeep(targets);
  var config = this.CreateNetwork();

/////////  console.log(JSON.stringify(config, undefined, 2));

  this.Network = (new N.Network()).AddTemplates(this.AdditionalTemplates).loadFrom(config).then(
    function() {
      var inputNetwork = _this.Network.GetNetworkByName('Inputs');
      var targetNetwork = _this.Network.GetNetworkByName('Targets');
      var outputNetwork = _this.Network.GetNetworkByName('Outputs');
      for(var i in targetNetwork.Neurons) {

        var neuron = targetNetwork.Neurons[i];

        for(var j in neuron.Compartments) {
          var compartment = neuron.Compartments[j];
          var meta = compartment.IoMetaData;

          for(var k in meta.Inputs) {
            var inputMeta = meta.Inputs[k];
            _this.addInputSource(compartment, inputMeta, inputNetwork);
          }

          for(var m in meta.Outputs) {
            var outputMeta = meta.Outputs[m];
            _this.addOutputSink(compartment, outputMeta, outputNetwork);
          }
        }
      }

      _this.Network.Connect();
    }, function(status) {

    }
  );

  // Add inputs
  return deferred.promise;
}

/**
 * Adds an input sink to the input network.
 * @method addInputSource
 * @returns {N.Workbench}
 */
N.Workbench.prototype.addInputSource = function(compartment, inputMeta, inputNetwork) {
  var cleanName = N.CleanName(compartment.Neuron.name);
  var cleanCompartmentName = N.CleanName(compartment.Name+(inputMeta.Name !== 'Main' ? '['+inputMeta.Name+']' : ''));
  var fullCleanName = 'SRC['+cleanName+(!_.isEmpty(cleanCompartmentName) ? '-'+cleanCompartmentName : '')+']';

  var source = (new N.Neuron(inputNetwork)).setName(fullCleanName);
  source.Display = {
    Template: 'N.UI.StandardNeuronTemplates.InputSource',
    Radius: 0.1,
    CompartmentMap : { 'Body': 'OP'  }
  }

  var sourceCompartment = new N.Comp.SignalSource(source, 'OP');
  source.AddCompartment(sourceCompartment);

  this.signalSources.push(sourceCompartment.getPath());

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


  this.outputSinks.push(sinkCompartment.getPath());

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
  var config = { networks: [], connections: [] };
  var inputNetwork = { name: 'Inputs', neurons: [] };
  var targetNetwork = { name: 'Targets', neurons: this.targets };
  var outputNetwork = { name: 'Outputs', neurons: [] };
  config.networks.push(inputNetwork);
  config.networks.push(targetNetwork);
  config.networks.push(outputNetwork);
  return config;
}
