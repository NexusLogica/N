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
  this.className           = 'N.Network';
  this.id                  = null;
  this.name                = '';
  this.category            = 'Default';
  this.neurons             = [];
  this.neuronsByName       = {};
  this.connections         = [];
  this.connectionsByPath   = {};
  this.parentNetwork       = parentNetwork;
  this.networks            = [];
  this.networksByName      = {};
  this.templates           = {};
  this.validationMessages  = [];
  this.random              = (parentNetwork ? parentNetwork.random : new N.Rand.RandomGenerator());
  this.display             = {};
}

/**
 * Returns the object type.
 * @method getType
 * @returns {N.Type.Network}
 */
N.Network.prototype.getType = function() {
  return N.Type.Network;
}

/**
 * Get the full path of the network.
 * @method getPath
 * @returns {string}
 */
N.Network.prototype.getPath = function() {
  return (this.parentNetwork ? this.parentNetwork.getPath() : '/')+this.name;
}

/**
 * Sets the parent network.
 * @method setParentNetwork
 * @param {N.Network} the parent network
 * @returns {N.Network} Returns a reference to this network.
 */
N.Network.prototype.setParentNetwork = function(parentNetwork) {
  this.parentNetwork = parentNetwork;
  return this;
}

/**
 * Set the name.
 * @method setName
 * @returns {this}
 */
N.Network.prototype.setName = function(name) {
  this.name = name;
  return this;
}

/**
 * Get the parent network. This call is implemented by all network, neuron, and compartment objects.
 * @method getParent
 * @returns {Object} The parent network object or null if there is none.
 */
N.Network.prototype.getParent = function() {
  return this.parentNetwork;
}

/**
 * Get the the root/top level network.
 * @method getRoot
 * @returns {N.Network} The root network object or self if this is the root.
 */
N.Network.prototype.getRoot = function() {
  return this.parentNetwork ? this.parentNetwork.getRoot() : this;
}

/**
 * Adds a child network to the network.
 * @method addNetwork
 * @param network
 * @returns {N.Network}
 */
N.Network.prototype.addNetwork = function(network) {
  if(network.name.length === 0) {
    throw N.log('ERROR: N.Network.addNetwork: No name for network.');
  }
  if(this.networksByName[network.name]) {
    throw N.log('ERROR: N.Network.addNetwork: The network '+network.name+' already exists in '+this.name+'.');
  }
  this.networks.push(network);
  this.networksByName[network.name] = network;
  network.setParentNetwork(this);
  return network;
}

/**
 * Get number of networks directly owned by this network.
 * @method getNumNetworks
 * @returns {Integer}
 */
N.Network.prototype.getNumNetworks = function() {
  return this.networks.length;
}

/**
 * Get a network owned by this network by index.
 * @method getNetworkByIndex
 * @param {Integer} index
 * @returns {N.Network}
 */
N.Network.prototype.getNetworkByIndex = function(index) {
  return this.networks[index];
}

/**
 * Get a network owned by this network given the network short string.
 * @method getNetworkByName
 * @param {String} shortName
 * @returns {N.Network}
 */
N.Network.prototype.getNetworkByName = function(name) {
  return this.networksByName[name];
}

/**
 * Adds a neuron to the network.
 * @method AddNeuron
 * @param neuron
 * @returns {N.Neuron}
 */
N.Network.prototype.addNeuron = function(neuron) {
  if(neuron.name.length === 0) {
    N.log('ERROR: N.Network.addNeuron: No short name for neuron.');
    throw 'ERROR: N.Network.addNeuron: No short name for neuron.';
  }
  this.neurons.push(neuron);
  this.neuronsByName[neuron.name] = neuron;
  neuron.setNetwork(this);
  return neuron;
}

/**
 * Get number of neurons directly owned by this network.
 * @method getNumNeurons
 * @returns {Integer}
 */
N.Network.prototype.getNumNeurons = function() {
  return this.neurons.length;
}

/**
 * Get a neuron owned by this network by index.
 * @method getNeuronByIndex
 * @param {Integer} index
 * @returns {N.Neuron}
 */
N.Network.prototype.getNeuronByIndex = function(index) {
  return this.neurons[index];
}

/**
 * Get a neuron owned by this network given the neuron short string.
 * @method getNeuronByName
 * @param {String} shortName
 * @returns {N.Neuron}
 */
N.Network.prototype.getNeuronByName = function(name) {
  return this.neuronsByName[name];
}

/**
 * Add a connection and connect it immmediately.
 * @method addConnection
 * @param {N.Connection} connection
 */
N.Network.prototype.addConnection = function(connection) {
  this.connections.push(connection);
  this.connectionsByPath[connection.getPath()] = connection;
  return connection;
}

/**
 * Get the number of connections owned by this network.
 * @method getNumConnections
 * @returns {Number}
 */
N.Network.prototype.getNumConnections = function() {
  return this.connections.length;
}

/**
 * Get a connection by index
 * @method getConnectionsByIndex
 * @param {Integer} index
 * @returns {N.Connection}
 */
N.Network.prototype.getConnectionsByIndex = function(index) {
  return this.connections[index];
}

/**
 * Get a connection given the connection path string.
 * @method getConnectionsByPath
 * @param {String} path
 * @returns {N.Connection}
 */
N.Network.prototype.getConnectionsByPath = function(path) {
  return this.connectionsByPath[path];
}

/**
 * Returns the full path from the top level network to this network.
 * @method getFullPath
 * @returns {String} The concatinated short names of this network and its parents, separated by '/'.
 */
N.Network.prototype.getFullPath = function() {
  return (this.parentNetwork ? this.parentNetwork.getFullPath() : '/') + this.name;
}

N.Network.prototype.link = function() {
  this.linkReport = new N.ConfigurationReport();
  this.connect();
  return this.linkReport;
}

/***
 * Link up connections and compartments.
 * @method connect
 * @returns {N.Network}
 */
N.Network.prototype.connect = function() {
  var numConnections = this.connections.length;
  for(var i=0; i<numConnections; i++) {
    this.connections[i].connect();
  }

  var num = this.neurons.length;
  for(i=0; i<num; i++) {
    this.neurons[i].connectCompartments();
  }

  var numNetworks = this.networks.length;
  for(i=0; i<numNetworks; i++) {
    this.networks[i].connect();
  }
  return this;
}

/**
 * Update the output of all child networks, neurons, and connections.
 * @method upate
 * @param {Real} time The time of the current simulation step.
 * @return {Network} Returns a reference to self.
 */
N.Network.prototype.update = function(time) {
  this.updateConnections(time);
  this.updateNeurons(time);
}

/**
 * Update all connection outputs. This should only be called by a top level or parent network.
 * @method updateConnections
 * @param {Real} time The time of the current simulation step.
 * @return {Network} Returns a reference to self.
 */
N.Network.prototype.updateConnections = function(time) {
  var numConnections = this.connections.length;
  for(var i=0; i<numConnections; i++) {
    this.connections[i].update(time);
  }

  var numNetworks = this.networks.length;
  for(var j=0; j<numNetworks; j++) {
    this.networks[j].updateConnections(time);
  }
  return this;
}

/**
 * Update all neuron outputs. This should only be called by a top level or parent network.
 * @method updateNeurons
 * @param {Real} time The time of the current simulation step.
 * @return {Network} Returns a reference to self.
 */
N.Network.prototype.updateNeurons = function(time) {
  var num = this.neurons.length;
  for(var i=0; i<num; i++) {
    this.neurons[i].update(time);
  }

  var numNetworks = this.networks.length;
  for(var j=0; j<numNetworks; j++) {
    this.networks[j].updateNeurons(time);
  }
  return this;
}

/**
 * Returns the network and all neurons, compartments, and connections to the initial state. All output signal values will
 * be cleared as part of this.
 * @method clear
 * @return {Network} Returns a reference to self.
 */
N.Network.prototype.clear = function() {
  var numConnections = this.connections.length;
  for(var i=0; i<numConnections; i++) {
    this.connections[i].clear();
  }

  var num = this.neurons.length;
  for(i=0; i<num; i++) {
    this.neurons[i].clear();
  }

  var numNetworks = this.networks.length;
  for(i=0; i<numNetworks; i++) {
    this.networks[i].clear();
  }
  return this;
}

/**
 * Validates the network. Warns if there are no child networks or neurons. It will report an error if there are no networks
 * or neurons but there are connections.
 * @method validate
 * @param report
 * @return {N.ConfigurationReport} Returns the configuration report object.
 */
N.Network.prototype.validate = function(report) {
  if(this.networks.length === 0 && this.neurons.length === 0) {
    report.warning(this.getPath(), 'The network has no neurons or child networks.');
    if(this.connections.length) { report.error(this.getPath(), 'The network has connections but no child networks or neurons, so the connections will fail.'); }
  }

  for(var j in this.validationMessages) {
    report.error(this.getPath(), this.validationMessages[j]);
  }

  for(var i=0; i<this.networks.length; i++) { this.networks[i].validate(report); }
  for(i=0; i<this.neurons.length; i++)           { this.neurons[i].validate(report); }
  for(i=0; i<this.connections.length; i++) {
    try {
      this.connections[i].validate(report);
    }
    catch (err) {
      report.error(this.connections[i].getPath(), 'The connection of type '+this.connections[i].className+' threw an exception when validating.');
    }
  }
  return report;
}

/**
 * Loads the properties of the JSON configuration to self. In doing so it creates any child neurons.
 * @method loadFrom
 * @param {JSON} json The JSON object containing the configuration.
 * @returns {Network} Returns a reference to self
 */
N.Network.prototype.loadFrom = function(json) {
  var deferred = Q.defer();
  var _this = this;
  var neuron;

  var jsonToFill = _.cloneDeep(json);
  this.loadTemplate(jsonToFill).then(
    function() {
      _.merge(_this, _.omit(jsonToFill, ['networks', 'neurons', 'connections', 'template', 'randSeed']));

      if(json.hasOwnProperty('randSeed')) {
        _this.random.setSeed(Math.parseInt(json.randSeed));
      }

      _this.loadNetworks(json.networks || []).then(
        function() {
          _this.loadNeurons(json.neurons || []).then(
            function() {
              deferred.resolve();

              _this.loadConnections(json.connections || []).then(
                function() {

                  // Hook up the connections
                  for(var n in _this.connections) {
                    _this.connections[n].connect();
                  }
                  if(!_this.parentNetwork) {
                    _this.initialize();
                  }
                  deferred.resolve();

                }, function(status) {
                  deferred.reject(status);
                }
              ).catch(N.reportQError);
            }, function(status) {
              deferred.reject(status);
            }
          ).catch(N.reportQError);
        }, function(status) {
          deferred.reject(status);
        }
      ).catch(N.reportQError);
    }, function(status) {
      deferred.reject(status);
    }
  ).catch(N.reportQError);
  return deferred.promise;
}

N.Network.prototype.loadTemplate = function(json) {
  var deferred = Q.defer();
  var _this = this;

  if(json.hasOwnProperty('template')) {
    if(json.template.hasOwnProperty('local')) {
      var localTemplate = this.getTemplate(json.template.local);
      if(localTemplate === null) {
        deferred.reject({ success: false, errMsg: this.routeErrorMsg('ERROR: Unable to find local template "'+json.template.local+'"') });
        return deferred.promise;
      }
      if(localTemplate.template) {
        this.loadTemplate(localTemplate).then(
          function(template) {
            _.merge(json, localTemplate);
            deferred.resolve();
          }, function(status) {
            deferred.reject(status);
          }
        ).catch(N.reportQError);
      }
    } else {
      this.getRemoteTemplate(json.template).then(
        function(remoteTemplate) {
          _.merge(json, localTemplate);
          deferred.resolve();
        }, function(status) {
          deferred.reject(status);
        }
      ).catch(N.reportQError);
    }
  } else {
    deferred.resolve();
  }
  return deferred.promise;
}

N.Network.prototype.loadNetworks = function(json) {
  var promises = [];
  for(var i in json) {
    var networkJson = json[i];
    var network = N.newN(networkJson.className || 'N.Network', this).setName(networkJson.name);
    this.addNetwork(network);
    promises.push(network.loadFrom(networkJson));
  }

  return Q.all(promises);
}

N.Network.prototype.loadNeurons = function(json) {
  var promises = [];
  for(var i in json) {
    var neuronJson = json[i];
    var neuron = N.newN(neuronJson.className || 'N.Neuron', this).setName(neuronJson.name);
    this.addNeuron(neuron);
    promises.push(neuron.loadFrom(neuronJson));
  }

  return Q.all(promises);
}

N.Network.prototype.loadConnections = function(json) {
  var promises = [];
  for(var i in json) {
    var connectionJson = json[i];
    var connection = N.newN(connectionJson.className || 'N.Connection', this);
    this.addConnection(connection);
    promises.push(connection.loadFrom(connectionJson));
  }

  return Q.all(promises);
}

N.Network.prototype.initialize = function(templateName) {
  for(var i in this.networks) {
    this.networks[i].initialize();
  }
  for(var j in this.neurons) {
    this.neurons[j].initialize();
  }
  for(var k in this.connections) {
    var connection = this.connections[k];
    if(connection.initialize) {
      connection.initialize();
    }
  }
}

N.Network.prototype.getTemplate = function(templateName) {
  if(this.templates[templateName]) {
    return this.templates[templateName];
  }
  if(this.parentNetwork) {
    return this.parentNetwork.getTemplate(templateName);
  }
  return null;
}

N.Network.prototype.getRemoteTemplate = function(remoteTemplateData) {
  var database = N.NWS.services.getDatabase(remoteTemplateData.url);
  return database.readDocumentById(remoteTemplateData.id);
}

N.Network.prototype.addTemplates = function(templates) {
  for(var i in templates) {
    var template = templates[i];
    this.templates[i] = _.clone(template);
  }
  return this;
}

N.Network.prototype.routeErrorMsg = function(errMsg) {
  this.validationMessages.push(errMsg);
  N.log(errMsg);
  return errMsg;
}