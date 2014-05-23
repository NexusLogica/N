/**********************************************************************
 
File     : network.js
Project  : N Simulator Library
Purpose  : Source file for neuron relate objects.
Revisions: Original definition by Lawrence Gunn.
           2014/02/19

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

var N = N || {};

  //*************
  //* N.Network *
  //*************

/**
 * A network object which can contain neurons or child networks.
 * @class Network
 * @constructor
 * @param {Object} parentNetwork The parent network, if one exists.
 */
N.Network = function(parentNetwork) {
  this.ClassName           = 'N.Network';
  this.Id                  = null;
  this.Name                = '';
  this.ShortName           = '';
  this.Category            = 'Default';
  this.Neurons             = [];
  this.NeuronsByName       = {};
  this.Connections         = [];
  this.ConnectionsByPath   = {};
  this.ParentNetwork       = parentNetwork;
  this.Networks            = [];
  this.NetworksByName      = {};
  this.Templates           = {};
  this.ValidationMessages  = [];
}

/**
 * Returns the object type.
 * @method GetType
 * @returns {N.Type.Network}
 */
N.Network.prototype.GetType = function() {
  return N.Type.Network;
}

/**
 * Get the full path of the network.
 * @method GetPath
 * @returns {string}
 */
N.Network.prototype.GetPath = function() {
  return (this.ParentNetwork ? this.ParentNetwork.GetPath() : '/')+this.ShortName;
}

/**
 * Sets the parent network.
 * @method SetParentNetwork
 * @param {N.Network} the parent network
 * @returns {N.Network} Returns a reference to this network.
 */
N.Network.prototype.SetParentNetwork = function(parentNetwork) {
  this.ParentNetwork = parentNetwork;
  return this;
}

/**
 * Get the parent network. This call is implemented by all network, neuron, and compartment objects.
 * @method GetParent
 * @returns {Object} The parent network object or null if there is none.
 */
N.Network.prototype.GetParent = function() {
  return this.ParentNetwork;
}

/**
 * Get the the root/top level network.
 * @method GetRoot
 * @returns {N.Network} The root network object or self if this is the root.
 */
N.Network.prototype.GetRoot = function() {
  return this.ParentNetwork ? this.ParentNetwork.GetRoot() : this;
}

/**
 * Adds a child network to the network.
 * @method AddNetwork
 * @param network
 * @returns {N.Network}
 */
N.Network.prototype.AddNetwork = function(network) {
  if(network.ShortName.length === 0) {
    throw N.L('ERROR: N.Network.AddNetwork: No name for network.');
  }
  if(this.NetworksByName[network.ShortName]) {
    throw N.L('ERROR: N.Network.AddNetwork: The network '+network.ShortName+' already exists in '+this.ShortName+'.');
  }
  this.Networks.push(network);
  this.NetworksByName[network.ShortName] = network;
  network.SetParentNetwork(this);
  return network;
}

/**
 * Get number of networks directly owned by this network.
 * @method GetNumNetworks
 * @returns {Integer}
 */
N.Network.prototype.GetNumNetworks = function() {
  return this.Networks.length;
}

/**
 * Get a network owned by this network by index.
 * @method
 * workByIndex
 * @param {Integer} index
 * @returns {N.Network}
 */
N.Network.prototype.GetNetworkByIndex = function(index) {
  return this.Networks[index];
}

/**
 * Get a network owned by this network given the network short string.
 * @method GetNetworkByName
 * @param {String} shortName
 * @returns {N.Network}
 */
N.Network.prototype.GetNetworkByName = function(name) {
  return this.NetworksByName[name];
}

/**
 * Adds a neuron to the network.
 * @method AddNeuron
 * @param neuron
 * @returns {N.Neuron}
 */
N.Network.prototype.AddNeuron = function(neuron) {
  if(neuron.ShortName.length === 0) {
    N.L('ERROR: N.Network.AddNeuron: No short name for neuron.');
    throw 'ERROR: N.Network.AddNeuron: No short name for neuron.';
  }
  this.Neurons.push(neuron);
  this.NeuronsByName[neuron.ShortName] = neuron;
  neuron.SetNetwork(this);
  return neuron;
}

/**
 * Get number of neurons directly owned by this network.
 * @method GetNumNeurons
 * @returns {Integer}
 */
N.Network.prototype.GetNumNeurons = function() {
  return this.Neurons.length;
}

/**
 * Get a neuron owned by this network by index.
 * @method GetNeuronByIndex
 * @param {Integer} index
 * @returns {N.Neuron}
 */
N.Network.prototype.GetNeuronByIndex = function(index) {
  return this.Neurons[index];
}

/**
 * Get a neuron owned by this network given the neuron short string.
 * @method GetNeuronByName
 * @param {String} shortName
 * @returns {N.Neuron}
 */
N.Network.prototype.GetNeuronByName = function(name) {
  return this.NeuronsByName[name];
}

/**
 * Add a connection and connect it immmediately.
 * @method AddConnection
 * @param {N.Connection} connection
 */
N.Network.prototype.AddConnection = function(connection) {
  this.Connections.push(connection);
  this.ConnectionsByPath[connection.GetPath()] = connection;
  connection.SetNetwork(this);
  return connection;
}

/**
 * Get the number of connections owned by this network.
 * @method GetNumConnections
 * @returns {Number}
 */
N.Network.prototype.GetNumConnections = function() {
  return this.Connections.length;
}

/**
 * Get a connection by index
 * @method GetConnectionsByIndex
 * @param {Integer} index
 * @returns {N.Connection}
 */
N.Network.prototype.GetConnectionsByIndex = function(index) {
  return this.Connections[index];
}

/**
 * Get a connection given the connection path string.
 * @method GetConnectionsByPath
 * @param {String} path
 * @returns {N.Connection}
 */
N.Network.prototype.GetConnectionsByPath = function(path) {
  return this.ConnectionsByPath[path];
}

/**
 * Returns the full path from the top level network to this network.
 * @method GetFullPath
 * @returns {String} The concatinated short names of this network and its parents, separated by '/'.
 */
N.Network.prototype.GetFullPath = function() {
  return (this.ParentNetwork ? this.ParentNetwork.GetFullPath() : '') + '/' + this.ShortName;
}

N.Network.prototype.Link = function() {
  this.LinkReport = new N.ConfigurationReport();
  this.Connect();
  return this.LinkReport;
}

N.Network.prototype.Connect = function() {
  var numConnections = this.Connections.length;
  for(var i=0; i<numConnections; i++) {
    this.Connections[i].Connect();
  }

  var num = this.Neurons.length;
  for(i=0; i<num; i++) {
    this.Neurons[i].ConnectCompartments();
  }
  return this;
}

/**
 * Update the output of all child networks, neurons, and connections.
 * @method Upate
 * @param {Real} time The time of the current simulation step.
 * @return {Network} Returns a reference to self.
 */
N.Network.prototype.Update = function(time) {
  var numConnections = this.Connections.length;
  for(var i=0; i<numConnections; i++) {
    this.Connections[i].Update(time);
  }

  var num = this.Neurons.length;
  for(i=0; i<num; i++) {
    this.Neurons[i].Update(time);
  }
  return this;
}

/**
 * Validates the network. Warns if there are no child networks or neurons. It will report an error if there are no networks
 * or neurons but there are connections.
 * @method Validate
 * @param report
 * @return {N.ConfigurationReport} Returns the configuration report object.
 */
N.Network.prototype.Validate = function(report) {
  if(this.Networks.length === 0 && this.Neurons.length === 0) {
    report.Warning(this.GetPath(), 'The network has no neurons or child networks.');
    if(this.Connections.length) { report.Error(this.GetPath(), 'The network has connections but no child networks or neurons, so the connections will fail.'); }
  }

  for(var j in this.ValidationMessages) {
    report.Error(this.GetPath(), this.ValidationMessages[j]);
  }

  for(var i=0; i<this.Networks.length; i++) { this.Networks[i].Validate(report); }
  for(i=0; i<this.Neurons.length; i++)           { this.Neurons[i].Validate(report); }
  for(i=0; i<this.Connections.length; i++) {
    try {
      this.Connections[i].Validate(report);
    }
    catch (err) {
      report.Error(this.Connections[i].GetPath(), 'The connection of type '+this.Connections[i].ClassName+' threw an exception when validating.');
    }
  }
  return report;
}

/**
 * Loads the properties of the JSON configuration to self. In doing so it creates any child neurons.
 * @method LoadFrom
 * @param {JSON} json The JSON object containing the configuration.
 * @returns {Network} Returns a reference to self
 */
N.Network.prototype.LoadFrom = function(json) {
  if(json.Templates) {
    this.Templates = _.clone(json.Templates);
  }

  if(json.Template) {
    var template = this.GetTemplate(json.Template);
    if(template === null) {
      this.ValidationMessages.push('ERROR: Unable to find template "'+json.Template+'"');
      N.L(this.ValidationMessages[this.ValidationMessages.length-1]);
      return;
    }
    this.LoadFrom(template);
  }

  for(var i in json) {
    if(i === 'Neurons') {
      for(var j=0; j<json.Neurons.length; j++) {
        var neuronJson = json.Neurons[j];
        var neuron = N.NewN(neuronJson.ClassName || 'N.Neuron', this).LoadFrom(neuronJson);
        this.Neurons.push(neuron);
        this.NeuronsByName[neuron.ShortName] = neuron;
      }
    }
    else if(i === 'Networks') {
      for(var k=0; k<json.Networks.length; k++) {
        var networkJson = json.Networks[k];
        var network = N.NewN(networkJson.ClassName || 'N.Network', this).LoadFrom(networkJson);
        this.AddNetwork(network);
      }
    }
    else if(i === 'Display') {
      this.Display = {};
      _.merge(this.Display, json[i]);
    }
    else if(i !== 'Templates' && i !== 'Template' && i !== 'Connections') {
      this[i] = json[i];
    }
  }

  if(json.Connections) {
    for(var m in json.Connections) {
      var connectionJson = json.Connections[m];
      var connection = N.NewN(connectionJson.ClassName || 'N.Connection', this).LoadFrom(connectionJson);
      connection.Connect();
    }
  }

  return this;
}

N.Network.prototype.GetTemplate = function(templateName) {
  if(this.Templates[templateName]) {
    return this.Templates[templateName];
  }
  if(this.ParentNetwork) {
    return this.ParentNetwork.GetTemplate(templateName);
  }
  return null;
}

N.Network.prototype.AddTemplates = function(templates) {
  for(var i in templates) {
    var template = templates[i];
    this.Templates[i] = _.clone(template);
  }
}
