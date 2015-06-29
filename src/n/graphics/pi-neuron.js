/**********************************************************************

File     : pi-neuron.js
Project  : N Simulator Library
Purpose  : Source file for manufacturing, rendering, and controlling Pi representations of neurons.
Revisions: Original definition by Lawrence Gunn.
           2014/02/23

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

  //*****************
  //* N.UI.PiNeuron *
  //*****************

N.UI.PiNeuron = function(neuron, sceneSignals, parentPiNetwork) {
  this.sceneSignals = sceneSignals;
  this.parentPiNetwork = parentPiNetwork;
  this.x = 0;
  this.y = 0;
  this._set = null;
  this.neuronClassName = '';
  this.neuron = neuron;
  this.piCompartments = {};
  this.piCompartmentsById = {};
};

N.UI.PiNeuron.EventTypes = {
  'mouseenter': 'compartment-enter',
  'mouseleave': 'compartment-leave',
  'click'     : 'compartment-click'
};

N.UI.PiNeuron.prototype.getCompartmentByName = function(name) {
  return this.piCompartments[name];
};

/***
 * Build the SVG for the neuron, which is more like saying, configure the compartment displays. There
 * really is not a neuron to display.
 * @method render
 * @param svgParent
 */
N.UI.PiNeuron.prototype.render = function(svgParent) {
  this.group = svgParent.group();
  var scale = this.parentPiNetwork.scale;
  var radiusScaled = this.radius*scale;

  N.UI.PiNeuronTemplateBuilder.buildCompartmentGraphics(this, this.templateJson, radiusScaled, this.neuron.displaySource);

  var classNameFull = 'pi-neuron';
  if(this.hasOwnProperty('className')) { classNameFull += ' '+this.className; }
  this.group.attr({ class: classNameFull });

  // This is where the code logic gets a bit strange. A neuron does not really have anything
  // in the display for itself. What is displayed is just the components. Because the PiNeuronTemplateBuilder
  // has already built the compartment graphics, the compartments now need to be hooked up
  // to their SVG counterparts. This code is responsible for that.
  var compartment;
  for(var i in this.piCompartments) {
    compartment = this.piCompartments[i];
    compartment.neuron = this;
    compartment.path = this.group.path(compartment.pathString).attr({ fill: compartment.color });

    var compartmentClassName = 'compartment';
    if(compartment.hasOwnProperty('className')) { compartmentClassName += ' '+compartment.className; }
    compartment.path.attr( { 'class': compartmentClassName } );

    var compartmentObj = this.neuron.getCompartmentByName(compartment.name);

    if(compartmentObj) {
      compartment.setCompartmentObj(compartmentObj);
      if(compartmentObj) {
        this.piCompartmentsById[compartmentObj.name] = compartment;
        compartment.compartmentObj = compartmentObj;
        this.addEventHandlers(compartment);
      }
    }
  }

  // Draw labels last so they show up on top.
  for(var j in this.piCompartments) {
    compartment = this.piCompartments[j];

    if (compartment.hasOwnProperty('labelCenter')) {
      var r = compartment.labelCenter.r*radiusScaled;
      var theta = N.rad(compartment.labelCenter.angle);
      var arc = N.rad(180);
      var path = 'M '+r*Math.cos(theta)+' '+r*Math.sin(theta)+' A '+r+' '+r+' 0 1 0 '+r*Math.cos(theta+arc)+' '+r*Math.sin(theta+arc);
      N.drawSvgText(
        compartment.name,
        this.group,
        this.compartmentLabelFontSize * scale,
        0,
        0,
        N.Left,
        N.Bottom).addClass('pi-compartment-name')
        .path(path);
    }
  }

  N.drawSvgText(this.neuron.name, this.group, this.labelFontSize*scale, 0, 0, N.Center, N.Middle).addClass('pi-neuron-name');

  this.drawCallouts();

  this.group.translate(this.x*scale, this.y*scale);
};

N.UI.PiNeuron.prototype.drawCallouts = function() {
  var r = this.radius;
  for(var i in this.piCompartments) {
    var compartment = this.piCompartments[i];
    var pos = compartment.callout;
    var target = compartment.center;
    if(pos && target) {
      var coPos = new N.UI.Vector(r*pos.r*Math.cos(N.rad(pos.angle)), r*pos.r*Math.sin(N.rad(pos.angle)));
      var tarPos = new N.UI.Vector(r*target.r*Math.cos(N.rad(target.angle)), r*target.r*Math.sin(N.rad(target.angle)));

      var text = this.group.plain(compartment.name);
      var bbox = text.bbox();
      text.move(coPos.x+bbox.x, coPos.y+bbox.y).attr({class: 'callout-label' }).attr({ 'dominant-baseline': 'central'}).attr({ 'text-anchor': 'middle' });
      var short = coPos.shorten(tarPos, 5);

      var line = this.group.line(tarPos.x, tarPos.y, short.x, short.y).stroke({width: 1}).attr({class: 'callout-line' });
    }
  }
};

N.UI.PiNeuron.prototype.addEventHandlers = function(piCompartment) {
  var node = piCompartment.path.node;
  jQuery.data(node, 'piCompartment', piCompartment);

  var _this = this;
  $(node).on('mousemove', function(event) {
    var piCompartment = $(event.target).data('piCompartment');
    _this.sceneSignals['component-move'].dispatch({ piCompartment: piCompartment, compartment: piCompartment.compartmentObj });
  });
  $(node).on('click', function(event) {
    var piCompartment = $(event.target).data('piCompartment');
    _this.sceneSignals['component-click'].dispatch({ piCompartment: piCompartment, compartment: piCompartment.compartmentObj });
  });
};

N.UI.PiNeuron.prototype.highlight = function(compartment) {
  N.UI.svgAddClass(this.group, 'highlight');
};

N.UI.PiNeuron.prototype.removeHighlight = function(compartment) {
  N.UI.svgRemoveClass(this.group, 'highlight');
};

N.UI.PiNeuron.prototype.getType = function() {
  return N.Type.PiNeuron;
};

N.UI.PiNeuron.prototype.load = function(loader) {
  var deferred = Q.defer();
  var _this = this;

  if(this.neuron.displaySource) {
    loader(this.neuron.displaySource).then(function (templateJson) {

      _this.templateJson = templateJson;
      if (_this.parentConfig) {
        _this.radius = _this.parentConfig.radius || _this.radius;
        _this.x = _this.parentConfig.x;
        _this.y = _this.parentConfig.y;
      }

      deferred.resolve();
    }, function (err) {
      deferred.reject(err);
    });
  } else {
    var msg = 'WARNING: N.UI.PiNeuron.load: Neuron '+this.name+' does not have a displaySource property';
    console.log(msg);
    deferred.reject({ description: msg });
  }

  return deferred.promise;
};

  //**********************
  //* N.UI.PiCompartment *
  //**********************

N.UI.PiCompartment = function() {
  this.compartmentObj = null;
};

N.UI.PiCompartment.prototype.getType = function() {
  return N.Type.PiCompartment;
};

N.UI.PiCompartment.prototype.setCompartmentObj = function(compartmentObj) {
  this.compartmentObj = compartmentObj;
  return this;
};

N.UI.PiCompartment.prototype.showConnections = function() {
  if(!this.compartmentObj) { return; }

  // Get the input connections paths
  var input  = this.compartmentObj.inputConnections;
  var output = this.compartmentObj.outputConnections;

  var thisNetwork = this.neuron.network;
  var createPiConnection = function(connection) {
    var net = thisNetwork;
    do {
      if (connection.network === net.network) {
        return new N.UI.PiConnection(net, connection);
      }
    } while((net = net.parentNetwork));
    return null;
  };

  var findTop = function(network) {
    var net = network;
    while(!_.isUndefined(net.parentNetwork)) { net = net.parentNetwork; }
    return net;
  };

  var piInput = _.map(input, createPiConnection);
  var piOutput = _.map(output, createPiConnection);
  piInput = _.filter(piInput);
  piOutput = _.filter(piOutput);

  this.routeManager = new N.UI.PiRouteManager(findTop(thisNetwork));
  this.routeManager.addConnections(piInput);
  this.routeManager.addConnections(piOutput);
  this.routeManager.render();
  return this;
};

N.UI.PiCompartment.prototype.hideConnections = function() {
  return this;
};

N.UI.PiCompartment.prototype.clone = function() {
  var c = new N.UI.PiCompartment();
  _.assign(c, this);
  return c;
};
