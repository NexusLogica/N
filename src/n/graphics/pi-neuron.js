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

  //********************************
  //* N.UI.PiNeuronTemplateBuilder *
  //********************************

N.UI.PiNeuronTemplateBuilder = (function() {
  var defaultPadding = 0.02;
  var factories = {};

  function buildCompartmentGraphics(piNeuron, template, radius, sourcePath) {
    var radiusString = 'r'+radius;

    var factory = (factories[sourcePath] ? factories[sourcePath][radiusString] : null);
    if(!factory) {
      factory = N.UI.TemplateReplicator(template, radius);

      factories[sourcePath] = factories[sourcePath] || {};
      factories[sourcePath][radiusString] = factory;
    }

    factory.createNewGraphic(piNeuron);
  }

  var clear = function() {
    factories = {};
  };

  return {
    buildCompartmentGraphics: buildCompartmentGraphics,
    clear: clear
  }
})();

  //********************************
  //* N.UI.PiNeuronTemplateBuilder *
  //********************************

N.UI.TemplateReplicator = function(skeletonTemplate, graphicRadius) {
  var template = skeletonTemplate;
  var filledTemplate = null;
  var radius = graphicRadius;
  var defaultPadding = 0.02;


  function createNewGraphic(piNeuron) {
    if(!filledTemplate) {
      buildFromTemplate();
    }
    piNeuron.labelFontSize = template.hasOwnProperty('labelFontSize') ? template.labelFontSize : 0.07;
    piNeuron.compartmentLabelFontSize = template.hasOwnProperty('compartmentLabelFontSize') ? template.compartmentLabelFontSize: 0.05;

    for(var i in filledTemplate) {
      if (filledTemplate.hasOwnProperty(i)) {
        if (i === 'compartments') {
          var compartments = filledTemplate[i];
          for (var j in compartments) {
            piNeuron.piCompartments[j] = compartments[j].clone();
          }
        } else {
          piNeuron[i] = _.cloneDeep(filledTemplate[i]);
        }
      }
    }
    return piNeuron;
  }

  function buildFromTemplate() {
    filledTemplate = {};
    if(template.hasOwnProperty('ClassName')) {
      filledTemplate.className = template.className;
    }
    filledTemplate.compartments = {};
    for(var i in template.compartments) {
      var templateCompartment = template.compartments[i];
      var pathString = piCompartmentToPath(templateCompartment, radius);

      var compartment = new N.UI.PiCompartment();
      _.assign(compartment, _.cloneDeep(templateCompartment));

      compartment.pathString = pathString;
      filledTemplate.compartments[compartment.name] = compartment;
    }
  }

  function piCompartmentToPath(compartment, outerRadius) {
    var p = '';
    if(compartment.segments.length < 1) {
      return p;
    }

    if(compartment.segments[0].outerRadius) {
      return piCircularCompartmentToPath(compartment.segments[0], outerRadius);
    }

    for(var side = 1; side <= (compartment.mirror ? 2 : 1); side++) {
      var mirror = (side === 2 ? -1.0 : 1.0);
      var mirrorOffset = (side === 2 ? 180 : 0);

      var direction = mirror*compartment.segments[0].direction;
      var facing = mirror*compartment.segments[0].facing;
      var rSeg = compartment.segments[0].radius;
      var r = rSeg*outerRadius;
      var angle = mirror*compartment.segments[0].startAngle+mirrorOffset;

      var padding = (compartment.segments[0].hasOwnProperty('padding') ? compartment.segments[0].padding : defaultPadding);
      var angleDelta = -facing*Math.asin(padding/rSeg);
      var angleRadians = N.rad(angle)+angleDelta;

      var x = r*Math.cos(angleRadians);
      var y = r*Math.sin(angleRadians);
      p += 'M'+x+' '+y;

      for(var i=0; i<compartment.segments.length; i++) {
        var iNext = (i === compartment.segments.length-1 ? 0 : i+1);

        facing = mirror*compartment.segments[i].facing;
        var facingNext = mirror*compartment.segments[iNext].facing;
        direction = mirror*compartment.segments[i].direction;
        rSeg = compartment.segments[i].radius;
        r = rSeg*outerRadius;
        var angleNow = mirror*compartment.segments[i].startAngle+mirrorOffset;
        var angleNext = mirror*compartment.segments[iNext].startAngle+mirrorOffset;

        if(direction*mirror > 0) {
          if(angleNext < angleNow) {
            angle = angleNext+360-angleNow;
          }
          else {
            angle = angleNext-angleNow;
          }
        }
        else {
          angle = angleNow-angleNext;
          //N.log('CASE 3/4 = '+ angle);
        }

        padding = (compartment.segments[iNext].hasOwnProperty('padding') ? compartment.segments[iNext].padding : defaultPadding);
        angleDelta = -facingNext*Math.asin(padding/rSeg);
        angleRadians = N.rad(angleNext)+angleDelta;

        x = r*Math.cos(angleRadians);
        y = r*Math.sin(angleRadians);

        // a rx ry x-axis-rotation large-arc-flag sweep-flag x y
        // where
        //   rx, ry - radii, the same for this instance
        //   x-axis-rotation - the rotation of rx, ry, so zero always for circles
        //   large-arc-flag - greater than 180 degrees?
        //   sweep-flag - should the arc be clockwise or counterclockwise. For here, counter for outer, clockwise for inner arc.
        //
        p += ' A'+r+' '+r+' 0 '+(mirror*Math.abs(angle) > 180 ? '1 ' : '0 ')+(direction > 0 ? 1 : 0)+' '+x+' '+y;

        if(i === compartment.segments.length-1) {
          p += 'z';
        }
        else {
          var nextSeg = compartment.segments[iNext];
          var rNext = nextSeg.radius*outerRadius;

          angleDelta = -facingNext*Math.asin(padding/nextSeg.radius);

          angleRadians = N.rad(angleNext)+angleDelta;
          x = rNext*Math.cos(angleRadians);
          y = rNext*Math.sin(angleRadians);
          p += 'L'+x+' '+y;
        }
      }
    }
    return p;
  }

  function piCircularCompartmentToPath(segment, outerRadius) {
    var rOut = segment.outerRadius*outerRadius;
    var p = 'M-'+rOut+' 0a'+rOut+' '+rOut+' 0 1 0 '+(2*rOut)+' 0a'+rOut+' '+rOut+' 0 1 0 '+(-2*rOut)+' 0';
    if(segment.innerRadius) {
      var rIn = segment.innerRadius*outerRadius;
      // As per above, but rotate in the other direction.
      p += 'M-'+rIn+' 0a'+rIn+' '+rIn+' 0 1 1 '+(2*rIn)+' 0a'+rIn+' '+rIn+' 0 1 1 '+(-2*rIn)+' 0';
    }
    return p;
  }

  return {
    createNewGraphic: createNewGraphic
  }
};
