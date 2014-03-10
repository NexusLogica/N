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

var N = N || {};
N.UI = N.UI || {};

  //*****************
  //* N.UI.PiNeuron *
  //*****************

N.UI.PiNeuron = function() {
  this.X = 0;
  this.Y = 0;
  this._set = null;
  this.Name = '';
  this.NeuronClassName = '';
}

N.UI.PiNeuron.prototype.Render = function(neuron, svgParent) {
  this._group = svgParent.group();
  var classNameFull = 'pi-neuron';
  if(this.hasOwnProperty('className')) { classNameFull += ' '+this.className; }
  this._group.attr({ class: classNameFull });

  var _this = this;
  var compartmentMap = (neuron.Display ? neuron.Display.CompartmentMap : null);
  for(var i in this.compartments) {
    var compartment = this.compartments[i];
    compartment.path = this._group.path(compartment.pathString).attr({ fill: compartment.color });

    var compartmentClassName = 'compartment';
    if(compartment.hasOwnProperty('className')) { compartmentClassName += ' '+compartment.className; }
    if(this.NeuronClassName.length) { compartmentClassName += ' '+this.NeuronClassName; }
    compartment.path.attr( { class: compartmentClassName } );

    if(compartmentMap) {
      var neuronCompartmentName = compartmentMap[compartment.name];
      if(neuronCompartmentName) {
        var compartmentObj = neuron.GetCompartmentByName(neuronCompartmentName);
        if(compartmentObj) {
          this.AddEventHandlers(compartment.path.node, compartmentObj);
        }
      }
    }
  }
  this._group.translate(this.X, this.Y);
}

N.UI.PiNeuron.prototype.AddEventHandlers = function(node, neuronCompartment) {
  $(node).on('mouseenter', function(event) {
    $(this).closest('.pi-canvas').scope().onCompartmentMouseEnter(event, neuronCompartment);
  });
  $(node).on('mouseleave', function(event) {
    $(this).closest('.pi-canvas').scope().onCompartmentMouseLeave(event, neuronCompartment);
  });
  $(node).on('click', function(event) {
    $(this).closest('.pi-canvas').scope().onCompartmentClick(event, neuronCompartment);
  });
}

N.UI.PiNeuron.prototype.GetGroup = function() {
  return this._group;
}

  //************************
  //* N.UI.PiNeuronFactory *
  //************************

N.UI.PiNeuronFactory = (function() {
  var defaultPadding = 0.02;
  var factories = {};

  function CreatePiNeuron(templateName, radius) {
    var decaRadius = parseInt(radius, 10);
    if(decaRadius === 0) { decaRadius = 10; }

    var factory = (factories[templateName] ? factories[templateName][decaRadius] : null);
    if(!factory) {
      var template = GetTemplate(templateName);
      if(!template) {
        N.L('N.PiGraphicsFactory::createGraphic Unable to find template '+templateName);
        throw 'N.PiGraphicsFactory::createGraphic Unable to find template '+templateName;
      }

      factory = CreateFactory(template, decaRadius);

      factories[templateName] = factories[templateName] || {};
      factories[templateName][decaRadius] = factory;
    }
    return factory.CreateNewGraphic();
  }

  function GetTemplate(templateName) {
    var parts = templateName.split('.');
    if(parts.length > 0 && parts[0] === 'N') {
      var obj = N;
      for(var i=1; i<parts.length; i++) {
        obj = obj[parts[i]];
      }
      return obj;
    }
    return null;
  }

  function CreateFactory(template, radius) {
    var factory = GraphicFactory(template, radius);
    return factory;
  }

  function PiCircularCompartmentToPath(segment, outerRadius) {
    var rOut = segment.outerRadius*outerRadius;
    var p = 'M-'+rOut+' 0a'+rOut+' '+rOut+' 0 1 0 '+(2*rOut)+' 0a'+rOut+' '+rOut+' 0 1 0 '+(-2*rOut)+' 0';
    if(segment.innerRadius) {
      var rIn = segment.innerRadius*outerRadius;
      // As per above, but rotate in the other direction.
      p += 'M-'+rIn+' 0a'+rIn+' '+rIn+' 0 1 1 '+(2*rIn)+' 0a'+rIn+' '+rIn+' 0 1 1 '+(-2*rIn)+' 0';
    }
    return p;
  }

  function PiCompartmentToPath(compartment, outerRadius) {
    var p = '';
    if(compartment.segments.length < 1) {
      return p;
    }

    if(compartment.segments[0].outerRadius) {
      return PiCircularCompartmentToPath(compartment.segments[0], outerRadius);
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
      var angleRadians = N.Rad(angle)+angleDelta;
  
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
          N.L('CASE 3/4 = '+ angle);
        }
  
        padding = (compartment.segments[iNext].hasOwnProperty('padding') ? compartment.segments[iNext].padding : defaultPadding);
        angleDelta = -facingNext*Math.asin(padding/rSeg);
        angleRadians = N.Rad(angleNext)+angleDelta;
  
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
  
          angleRadians = N.Rad(angleNext)+angleDelta;
          x = rNext*Math.cos(angleRadians);
          y = rNext*Math.sin(angleRadians);
          p += 'L'+x+' '+y;
        }
      }
    }
    return p;
  }

  var GraphicFactory = function(skeletonTemplate, graphicRadius) {
    var template = skeletonTemplate;
    var filledTemplate = null;
    var radius = graphicRadius;

    function CreateNewGraphic() {
      if(!filledTemplate) {
        BuildFromTemplate();
      }
      var pin = new N.UI.PiNeuron();

      _.assign(pin, filledTemplate);
      return pin;
    }

    function BuildFromTemplate() {
      filledTemplate = {};
      if(template.hasOwnProperty('className')) {
        filledTemplate.className = template.className;
      }
      filledTemplate.compartments = {};
      for(var i in template.compartments) {
        var templateCompartment = template.compartments[i];
        var pathString = PiCompartmentToPath(templateCompartment, radius);
        var compartment = _.cloneDeep(templateCompartment);
        compartment.pathString = pathString;
        filledTemplate.compartments[compartment.name] = compartment;
      }
    }

    return {
      CreateNewGraphic: CreateNewGraphic
    }
  }

  return {
    CreatePiNeuron:CreatePiNeuron
  }
})();