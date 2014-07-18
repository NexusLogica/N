/**********************************************************************

File     : pi-standard-templates.js
Project  : N Simulator Library
Purpose  : Source file for templates for standard/common Pi neuron graphics.
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

N.UI.StandardNeuronTemplates = {
  Pyramidal : {
    ClassName: 'pyramidal',
    Compartments: [{
      name: 'Body',
      ClassName: 'excitatory-body',
      segments: [
        { radius: 0.425, startAngle: 115, direction: 1, facing: 1, padding: 0.06 },
        { radius: 1.00, startAngle: 65, direction: 1, facing: -1, padding: 0.06 }]
    },{
      name: 'Proximal basal dendrites',
      ClassName: 'proximal-basal-dendrites',
      mirror: true,
      segments: [
        { radius: 0.75, startAngle:  -20, direction: 1, facing: -1, padding: 0.06 },
        { radius: 1.00, startAngle:  25, direction: 1, facing: -1 },
        { radius: 0.50, startAngle: 65, direction: -1, facing: 1, padding: 0.02 }]
    },{
      name: 'Distal basal dendrites',
      ClassName: 'distal-basal-dendrites',
      mirror: true,
      segments: [
        { radius: 0.80, startAngle:  25, direction: -1, facing: 1, padding: 0.01 },
        { radius: 1.0, startAngle:  -20, direction: 1, facing: -1, padding: 0.06 }]
    },{
      name: 'Apical dendrite distal tufts',
      ClassName: 'apical-dendrite-distal-tufts',
      initialAngle: -160.0,
      segments: [
        { radius: 0.83, startAngle:  -160.0, direction: 1, facing: -1 },
        { radius: 1.0, startAngle:  -80.0, direction: -1, facing: 1 }]
    },{
      name: 'Apical dendrite proximal tufts',
      ClassName: 'apical-dendrite-proximal-tufts',
      initialAngle: -160.0,
      segments: [
        { radius: 0.80,  startAngle:  -160.0, direction: 1, facing: -1 },
        { radius: 1.00,  startAngle:   -80.0, direction: 1, facing: -1 },
        { radius: 0.675, startAngle:   -45.0, direction: -1, facing: 1 } ]
    },{
      name: 'Apical dendrite trunk',
      ClassName: 'apical-dendrite-trunk',
      initialAngle: -160,
      segments: [
        { radius: 0.6375, startAngle: -160.0, direction: 1, facing: -1 },
        { radius: 1.000,  startAngle:  -45.0, direction: 1, facing: -1 },
        { radius: 0.500,  startAngle:  -20.0, direction: -1, facing: 1 }]
    }]
  },
  Stellate : {
    ClassName: 'stellate',
    Compartments: [{
      name: 'Body',
      ClassName: 'excitatory-body',
      DockAngles: [ { From: 52.0, To: 80.0 }, { From: 110.0, To: 118.0 } ],
      Center: { r:0.35, angle: 30 },
      Callout: { r: 1.4, angle: 30 },
      segments: [
        { radius: 0.55, startAngle: 120, direction: 1, facing: 1, padding: 0.03 },
        { radius: 1.00, startAngle: 50, direction: 1, facing: -1, padding: 0.03 }]
    },{
      name: 'Dendrites',
      ClassName: 'dendrites',
      DockAngles: [ { From: 160.0, To: 400.0 } ],
      Center: { r: 0.8, angle: -50 },
      Callout: { r: 1.4, angle: -50 },
      segments: [
        { radius: 0.65, startAngle: 150, direction: 1, facing: -1, padding: 0.05 },
        { radius: 1.00, startAngle: 410, direction: -1, facing: 1, padding: 0.05 }]
    },{
      name: 'Acetylcholine Receptors',
      ClassName: 'acetylcholine-receptors',
      DockAngles: [ { From: 125.0, To: 145.0 } ],
      Center: { r: 0.8, angle: 135 },
      Callout: { r: 1.4, angle: 145 },
      segments: [
        { radius: 0.65, startAngle:  120, direction: 1, facing: -1, padding: 0.05 },
        { radius: 1.00, startAngle:  150, direction: -1, facing: 1, padding: 0.03 }]
    }]
  },
  ExcitatoryInterneuron : {
    ClassName: 'excitatory-interneuron',
    Compartments: [{
      name: 'Body',
      ClassName: 'excitatory-body',
      segments: [
        { radius: 0.55, startAngle: 120, direction: 1, facing: 1, padding: 0.03 },
        { radius: 1.00, startAngle: 60, direction: 1, facing: -1, padding: 0.03 }]
    },{
      name: 'Dendrites',
      ClassName: 'dendrites',
      segments: [
        { radius: 0.63, startAngle: 120, direction: 1, facing: -1, padding: 0.05 },
        { radius: 1.00, startAngle: 420, direction: -1, facing: 1, padding: 0.05 }]
    }]
  },
  InhibitoryInterneuron : {
    ClassName: 'inhibitory-interneuron',
    Compartments: [{
      name: 'Body',
      ClassName: 'inhibitory-body',
      DockAngles: [ { From: 35.0, To: 145.0 } ],
      segments: [
        { radius: 0.53, startAngle: 150, direction: 1, facing: 1, padding: 0.05 },
        { radius: 1.00, startAngle: 30, direction: 1, facing: -1, padding: 0.05 }]
    },{
      name: 'Dendrites',
      ClassName: 'dendrites',
      DockAngles: [ { From: 155.0, To: 380.0 } ],
      segments: [
        { radius: 0.63, startAngle: 150, direction: 1, facing: -1, padding: 0.05 },
        { radius: 1.00, startAngle: 390, direction: -1, facing: 1, padding: 0.05 }]
    }]
  },
  InputSource : {
    ClassName: 'input-source',
    Compartments: [{
      name: 'Body',
      ClassName: 'excitatory-body',
      segments: [
        { outerRadius: 1.00 }]
    }]
  },
  OutputSink : {
    ClassName: 'output-sink',
    Compartments: [{
      name: 'Input',
      ClassName: 'dendrites',
      DockAngles: [ { From: 225.0, To: 315.0 } ],
      segments: [
        { outerRadius: 1.00, innerRadius: 0.4 }]
    }]
  }
}
