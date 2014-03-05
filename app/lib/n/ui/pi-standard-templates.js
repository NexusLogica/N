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
    modules: [{
      name: 'Body',
      className: 'excitatory-body',
      segments: [
        { radius: 0.44, startAngle: 110, direction: 1, facing: 1, padding: 0.06 },
        { radius: 1.00, startAngle: 70, direction: 1, facing: -1, padding: 0.06 }]
    },{
      name: 'Proximal basal dendrites',
      className: 'proximal-basal-dendrites',
      mirror: true,
      segments: [
        { radius: 0.75, startAngle:  -20, direction: 1, facing: -1, padding: 0.06 },
        { radius: 1.00, startAngle:  25, direction: 1, facing: -1 },
        { radius: 0.50, startAngle: 70, direction: -1, facing: 1, padding: 0.02 }]
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
    modules: [{
      name: 'Body',
      className: 'excitatory-body',
      segments: [
        { radius: 0.55, startAngle: 120, direction: 1, facing: 1, padding: 0.03 },
        { radius: 1.00, startAngle: 50, direction: 1, facing: -1, padding: 0.03 }]
    },{
      name: 'Dendrites',
      className: 'dendrites',
      segments: [
        { radius: 0.61, startAngle: 150, direction: 1, facing: -1, padding: 0.05 },
        { radius: 1.00, startAngle: 410, direction: -1, facing: 1, padding: 0.05 }]
    },{
      name: 'Acetylcholine Receptors',
      className: 'acetylcholine-receptors',
      segments: [
        { radius: 0.60, startAngle:  120, direction: 1, facing: -1, padding: 0.02 },
        { radius: 1.00, startAngle:  150, direction: -1, facing: 1, padding: 0.03 }]
    }]
  },
  ExcitatoryInterneuron : {
    className: 'excitatory-interneuron',
    modules: [{
      name: 'Body',
      className: 'excitatory-body',
      segments: [
        { radius: 0.55, startAngle: 120, direction: 1, facing: 1, padding: 0.03 },
        { radius: 1.00, startAngle: 50, direction: 1, facing: -1, padding: 0.03 }]
    },{
      name: 'Dendrites',
      className: 'dendrites',
      segments: [
        { radius: 0.61, startAngle: 120, direction: 1, facing: -1, padding: 0.05 },
        { radius: 1.00, startAngle: 410, direction: -1, facing: 1, padding: 0.05 }]
    }]
  },
  InhibitoryInterneuron : {
    className: 'inhibitory-interneuron',
    modules: [{
      name: 'Body',
      className: 'inhibitory-body',
      segments: [
        { radius: 0.55, startAngle: 120, direction: 1, facing: 1, padding: 0.03 },
        { radius: 1.00, startAngle: 50, direction: 1, facing: -1, padding: 0.03 }]
    },{
      name: 'Dendrites',
      className: 'dendrites',
      segments: [
        { radius: 0.61, startAngle: 150, direction: 1, facing: -1, padding: 0.05 },
        { radius: 1.00, startAngle: 410, direction: -1, facing: 1, padding: 0.05 }]
    },{
      name: 'Acetylcholine Receptors',
      className: 'acetylcholine-receptors',
      segments: [
        { radius: 0.61, startAngle:  120, direction: 1, facing: -1, padding: 0.04 },
        { radius: 1.00, startAngle:  150, direction: -1, facing: 1, padding: 0.03 }]
    }]
  },
  InputSource : {
    className: 'input-source',
    modules: [{
      name: 'Body',
      className: 'excitatory-body',
      segments: [
        { outerRadius: 1.00 }]
    }]
  },
  OutputSink : {
    className: 'output-sink',
    modules: [{
      name: 'Body',
      className: 'dendrites',
      segments: [
        { outerRadius: 1.00, innerRadius: 0.4 }]
    }]
  }
}
