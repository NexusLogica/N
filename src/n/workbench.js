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
  this.id                  = null;
  this.name                = '';
  this.tests               = []; // N.WorkbenchTest array
  this.signalSources       = [];
  this.outputSinks         = [];
}

/**
 * Sets the extra templates.
 * @method addTemplates
 * @returns {N.Workbench}
 */
N.Workbench.prototype.addTemplates = function(templates) {
  this.additionalTemplates = _.cloneDeep(templates);
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
  var network = this.network;
  network.clear();

  var duration = test.duration;
  var inc = N.timeStep;
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
};

/**
 * Returns the object type.
 * @method setTargets
 * @returns {N.Workbench}
 */
N.Workbench.prototype.setTargets = function(targets) {
  var deferred = Q.defer();
  var _this = this;

  this.targets = _.cloneDeep(targets);
  var config = this.createNetwork();

  this.network = (new N.Network()).addTemplates(this.additionalTemplates);

  this.network.loadFrom(config).then(
    function() {
      var inputNetwork = _this.network.getNetworkByName('Inputs');
      var targetNetwork = _this.network.getNetworkByName('Targets');
      var outputNetwork = _this.network.getNetworkByName('Outputs');
      for(var i in targetNetwork.neurons) {

        var neuron = targetNetwork.neurons[i];

        for(var j in neuron.compartments) {
          var compartment = neuron.compartments[j];
          var meta = compartment.ioMetaData;

          for(var k in meta.inputs) {
            var inputMeta = meta.inputs[k];
            _this.addInputSource(compartment, inputMeta, inputNetwork);
          }

          for(var m in meta.outputs) {
            var outputMeta = meta.outputs[m];
            _this.addOutputSink(compartment, outputMeta, outputNetwork);
          }
        }
      }

      _this.network.connect();

      deferred.resolve();
    }, function(status) {
      deferred.reject(status);
    }
  ).catch(N.reportQError);

  // Add inputs
  return deferred.promise;
};

/**
 * Adds an input sink to the input network.
 * @method addInputSource
 * @returns {N.Workbench}
 */
N.Workbench.prototype.addInputSource = function(compartment, inputMeta, inputNetwork) {
  var cleanName = N.cleanName(compartment.neuron.name);
  var cleanCompartmentName = N.cleanName(compartment.name+(inputMeta.name !== 'main' ? '['+inputMeta.name+']' : ''));
  var fullCleanName = 'SRC['+cleanName+(!_.isEmpty(cleanCompartmentName) ? '-'+cleanCompartmentName : '')+']';

  var source = (new N.Neuron(inputNetwork)).setName(fullCleanName);
  source.display = {
    template: 'N.UI.StandardNeuronTemplates.InputSource',
    radius: 0.1,
    compartmentMap : { 'Body': 'OP'  }
  };

  var sourceCompartment = new N.Comp.SignalSource(source, 'OP');
  source.addCompartment(sourceCompartment);

  this.signalSources.push(sourceCompartment.getPath());

  inputNetwork.addNeuron(source);

  var connection = new N.Connection(this.network);
  connection.path = 'Inputs:'+fullCleanName+'>OP->Targets:'+compartment.neuron.name+'>'+compartment.name+(inputMeta.name !== 'main' ? '['+inputMeta.name+']': '');

  this.network.addConnection(connection);
};

/**
 * Adds an output sink to the output network.
 * @method addOutputSink
 * @returns {N.Workbench}
 */
N.Workbench.prototype.addOutputSink = function(compartment, outputMeta, outputNetwork) {
  var cleanName = N.cleanName(compartment.neuron.name);
  var cleanCompartmentName = N.cleanName(compartment.name+(outputMeta.name !== 'main' ? '['+outputMeta.name+']' : ''));
  var fullCleanName = 'SNK['+cleanName+(!_.isEmpty(cleanCompartmentName) ? '-'+cleanCompartmentName : '')+']';

  var sink = (new N.Neuron(outputNetwork)).setName(fullCleanName);
  sink.display = {
    template: 'N.UI.StandardNeuronTemplates.OutputSink',
    radius: 0.125,
    compartmentMap : { 'Input': 'IP'  }
  };

  var sinkCompartment = new N.Comp.InputSink(sink, 'IP');
  sink.addCompartment(sinkCompartment);


  this.outputSinks.push(sinkCompartment.getPath());

  outputNetwork.addNeuron(sink);

  var connection = new N.Connection(this.network);
  connection.path = 'Targets:'+compartment.neuron.name+'>'+compartment.name+(outputMeta.name !== 'main' ? '['+outputMeta.name+']': '')+'->Outputs:'+fullCleanName+'>IP';

  this.network.addConnection(connection);
};

/**
 * Creates a network.
 * @method createNetwork
 * @returns {Object}
 */
N.Workbench.prototype.createNetwork = function() {
  var config = { networks: [], connections: [] };
  var inputNetwork = { name: 'Inputs', neurons: [] };
  var targetNetwork = { name: 'Targets', neurons: this.targets };
  var outputNetwork = { name: 'Outputs', neurons: [] };
  config.networks.push(inputNetwork);
  config.networks.push(targetNetwork);
  config.networks.push(outputNetwork);
  return config;
};
