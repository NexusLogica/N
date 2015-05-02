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
    labelFontSize: 0.07,
    compartmentLabelFontSize: 0.05,
    compartments: [{
      name: 'OP',
      className: 'excitatory-body',
      labelCenter: { r:0.94, angle: 107 },
      segments: [
        { radius: 0.425, startAngle: 115, direction: 1, facing: 1, padding: 0.06 },
        { radius: 1.00, startAngle: 65, direction: 1, facing: -1, padding: 0.06 }]
    },{
      name: 'PBI',
      className: 'proximal-basal-dendrites',
      mirror: true,
      labelCenter: { r:0.95, angle: 60 },
      segments: [
        { radius: 0.75, startAngle:  -20, direction: 1, facing: -1, padding: 0.06 },
        { radius: 1.00, startAngle:  25, direction: 1, facing: -1 },
        { radius: 0.50, startAngle: 65, direction: -1, facing: 1, padding: 0.02 }]
    },{
      name: 'DBI',
      className: 'distal-basal-dendrites',
      mirror: true,
      labelCenter: { r:0.95, angle: 21 },
      segments: [
        { radius: 0.80, startAngle:  25, direction: -1, facing: 1, padding: 0.01 },
        { radius: 1.0, startAngle:  -20, direction: 1, facing: -1, padding: 0.06 }]
    },{
      name: 'ADTI',
      description: 'Apical dendrite distal tufts',
      className: 'apical-dendrite-distal-tufts',
      initialAngle: -160.0,
      labelCenter: { r:0.95, angle: 275 },
      segments: [
        { radius: 0.83, startAngle:  -160.0, direction: 1, facing: -1 },
        { radius: 1.0, startAngle:  -80.0, direction: -1, facing: 1 }]
    },{
      name: 'APTI',
      description: 'Apical dendrite proximal tufts',
      className: 'apical-dendrite-proximal-tufts',
      initialAngle: -160.0,
      labelCenter: { r:0.95, angle: 311 },
      segments: [
        { radius: 0.80,  startAngle:  -160.0, direction: 1, facing: -1 },
        { radius: 1.00,  startAngle:   -80.0, direction: 1, facing: -1 },
        { radius: 0.675, startAngle:   -45.0, direction: -1, facing: 1 } ]
    },{
      name: 'ATI',
      description: 'Apical dendrite trunk',
      className: 'apical-dendrite-trunk',
      initialAngle: -160,
      labelCenter: { r:0.94, angle: 336 },
      segments: [
        { radius: 0.6375, startAngle: -160.0, direction: 1, facing: -1 },
        { radius: 1.000,  startAngle:  -45.0, direction: 1, facing: -1 },
        { radius: 0.500,  startAngle:  -20.0, direction: -1, facing: 1 }]
    }]
  },
  Stellate : {
    className: 'stellate',
    labelFontSize: 0.07,
    compartmentLabelFontSize: 0.05,
    compartments: [{
      name: 'OP',
      className: 'excitatory-body',
      dockAngles: [ { from: 52.0, to: 80.0 }, { from: 110.0, to: 118.0 } ],
      center: { r:0.35, angle: 30 },
      callout: { r: 1.4, angle: 30 },
      labelCenter: { r:0.94, angle: 114 },
      segments: [
        { radius: 0.55, startAngle: 120, direction: 1, facing: 1, padding: 0.03 },
        { radius: 1.00, startAngle: 50, direction: 1, facing: -1, padding: 0.03 }]
    },{
      name: 'IP',
      className: 'dendrites',
      dockAngles: [ { from: 160.0, to: 400.0 } ],
      center: { r: 0.8, angle: -50 },
      callout: { r: 1.4, angle: -50 },
      labelCenter: { r:0.94, angle: 42 },
      segments: [
        { radius: 0.65, startAngle: 150, direction: 1, facing: -1, padding: 0.05 },
        { radius: 1.00, startAngle: 410, direction: -1, facing: 1, padding: 0.05 }]
    },{
      name: 'AR',
      className: 'acetylcholine-receptors',
      dockAngles: [ { from: 125.0, to: 145.0 } ],
      center: { r: 0.8, angle: 135 },
      callout: { r: 1.4, angle: 145 },
      labelCenter: { r:0.94, angle: 144 },
      segments: [
        { radius: 0.65, startAngle:  120, direction: 1, facing: -1, padding: 0.05 },
        { radius: 1.00, startAngle:  150, direction: -1, facing: 1, padding: 0.03 }]
    }]
  },
  ExcitatoryInterneuron : {
    className: 'excitatory-interneuron',
    compartments: [{
      name: 'OP',
      className: 'excitatory-body',
      segments: [
        { radius: 0.55, startAngle: 120, direction: 1, facing: 1, padding: 0.03 },
        { radius: 1.00, startAngle: 60, direction: 1, facing: -1, padding: 0.03 }]
    },{
      name: 'IP',
      className: 'dendrites',
      segments: [
        { radius: 0.63, startAngle: 120, direction: 1, facing: -1, padding: 0.05 },
        { radius: 1.00, startAngle: 420, direction: -1, facing: 1, padding: 0.05 }]
    }]
  },
  InhibitoryInterneuron : {
    className: 'inhibitory-interneuron',
    compartments: [{
      name: 'OP',
      className: 'inhibitory-body',
      dockAngles: [ { from: 35.0, to: 145.0 } ],
      segments: [
        { radius: 0.53, startAngle: 150, direction: 1, facing: 1, padding: 0.05 },
        { radius: 1.00, startAngle: 30, direction: 1, facing: -1, padding: 0.05 }]
    },{
      name: 'IP',
      className: 'dendrites',
      dockAngles: [ { from: 155.0, to: 380.0 } ],
      segments: [
        { radius: 0.63, startAngle: 150, direction: 1, facing: -1, padding: 0.05 },
        { radius: 1.00, startAngle: 390, direction: -1, facing: 1, padding: 0.05 }]
    }]
  },
  InputSource : {
    className: 'input-source',
    compartments: [{
      name: 'OP',
      className: 'excitatory-body',
      segments: [
        { outerRadius: 1.00 }]
    }]
  },
  OutputSink : {
    className: 'output-sink',
    compartments: [{
      name: 'IP',
      className: 'dendrites',
      dockAngles: [ { from: 225.0, to: 315.0 } ],
      segments: [
        { outerRadius: 1.00, innerRadius: 0.4 }]
    }]
  }
}
