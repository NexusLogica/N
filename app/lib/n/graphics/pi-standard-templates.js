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
    className: 'pyramidal',
    compartments: [{
      name: 'Body',
      className: 'excitatory-body',
      segments: [
        { radius: 0.425, startAngle: 115, direction: 1, facing: 1, padding: 0.06 },
        { radius: 1.00, startAngle: 65, direction: 1, facing: -1, padding: 0.06 }]
    },{
      name: 'Proximal basal dendrites',
      className: 'proximal-basal-dendrites',
      mirror: true,
      segments: [
        { radius: 0.75, startAngle:  -20, direction: 1, facing: -1, padding: 0.06 },
        { radius: 1.00, startAngle:  25, direction: 1, facing: -1 },
        { radius: 0.50, startAngle: 65, direction: -1, facing: 1, padding: 0.02 }]
    },{
      name: 'Distal basal dendrites',
      className: 'distal-basal-dendrites',
      mirror: true,
      segments: [
        { radius: 0.80, startAngle:  25, direction: -1, facing: 1, padding: 0.01 },
        { radius: 1.0, startAngle:  -20, direction: 1, facing: -1, padding: 0.06 }]
    },{
      name: 'Apical dendrite distal tufts',
      className: 'apical-dendrite-distal-tufts',
      initialAngle: -160.0,
      segments: [
        { radius: 0.83, startAngle:  -160.0, direction: 1, facing: -1 },
        { radius: 1.0, startAngle:  -80.0, direction: -1, facing: 1 }]
    },{
      name: 'Apical dendrite proximal tufts',
      className: 'apical-dendrite-proximal-tufts',
      initialAngle: -160.0,
      segments: [
        { radius: 0.80,  startAngle:  -160.0, direction: 1, facing: -1 },
        { radius: 1.00,  startAngle:   -80.0, direction: 1, facing: -1 },
        { radius: 0.675, startAngle:   -45.0, direction: -1, facing: 1 } ]
    },{
      name: 'Apical dendrite trunk',
      className: 'apical-dendrite-trunk',
      initialAngle: -160,
      segments: [
        { radius: 0.6375, startAngle: -160.0, direction: 1, facing: -1 },
        { radius: 1.000,  startAngle:  -45.0, direction: 1, facing: -1 },
        { radius: 0.500,  startAngle:  -20.0, direction: -1, facing: 1 }]
    }]
  },
  Stellate : {
    className: 'stellate',
    compartments: [{
      name: 'Body',
      className: 'excitatory-body',
      segments: [
        { radius: 0.55, startAngle: 120, direction: 1, facing: 1, padding: 0.03 },
        { radius: 1.00, startAngle: 50, direction: 1, facing: -1, padding: 0.03 }]
    },{
      name: 'Dendrites',
      className: 'dendrites',
      segments: [
        { radius: 0.65, startAngle: 150, direction: 1, facing: -1, padding: 0.05 },
        { radius: 1.00, startAngle: 410, direction: -1, facing: 1, padding: 0.05 }]
    },{
      name: 'Acetylcholine Receptors',
      className: 'acetylcholine-receptors',
      segments: [
        { radius: 0.65, startAngle:  120, direction: 1, facing: -1, padding: 0.05 },
        { radius: 1.00, startAngle:  150, direction: -1, facing: 1, padding: 0.03 }]
    }]
  },
  ExcitatoryInterneuron : {
    className: 'excitatory-interneuron',
    compartments: [{
      name: 'Body',
      className: 'excitatory-body',
      segments: [
        { radius: 0.55, startAngle: 120, direction: 1, facing: 1, padding: 0.03 },
        { radius: 1.00, startAngle: 60, direction: 1, facing: -1, padding: 0.03 }]
    },{
      name: 'Dendrites',
      className: 'dendrites',
      segments: [
        { radius: 0.63, startAngle: 120, direction: 1, facing: -1, padding: 0.05 },
        { radius: 1.00, startAngle: 420, direction: -1, facing: 1, padding: 0.05 }]
    }]
  },
  InhibitoryInterneuron : {
    className: 'inhibitory-interneuron',
    compartments: [{
      name: 'Body',
      className: 'inhibitory-body',
      segments: [
        { radius: 0.53, startAngle: 150, direction: 1, facing: 1, padding: 0.05 },
        { radius: 1.00, startAngle: 30, direction: 1, facing: -1, padding: 0.05 }]
    },{
      name: 'Dendrites',
      className: 'dendrites',
      segments: [
        { radius: 0.63, startAngle: 150, direction: 1, facing: -1, padding: 0.05 },
        { radius: 1.00, startAngle: 390, direction: -1, facing: 1, padding: 0.05 }]
    }]
  },
  InputSource : {
    className: 'input-source',
    compartments: [{
      name: 'Body',
      className: 'excitatory-body',
      segments: [
        { outerRadius: 1.00 }]
    }]
  },
  OutputSink : {
    className: 'output-sink',
    compartments: [{
      name: 'Input',
      className: 'dendrites',
      segments: [
        { outerRadius: 1.00, innerRadius: 0.4 }]
    }]
  }
}
