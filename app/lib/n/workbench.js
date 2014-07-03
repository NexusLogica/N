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
  return this;
}

/**
 * Creates a network.
 * @method CreateNetwork
 * @returns {Object}
 */
N.Workbench.prototype.CreateNetwork = function() {
  var config = { Networks: [], Connections: [] };
  var targetNetwork = { Name: 'Target', Neurons: this.Targets };
  config.Networks.push(targetNetwork);
  return config;
}
