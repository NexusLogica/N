/**********************************************************************

File     : pi-neuron-template-builder.js
Project  : N Simulator Library
Purpose  : Source file for manufacturing Pi representations of neurons.
Revisions: Original definition by Lawrence Gunn.
           2014/02/23

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

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

  //***************************
  //* N.UI.TemplateReplicator *
  //***************************

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
