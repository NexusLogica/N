/**********************************************************************

File     : initial-db-data.js
Project  : N Simulator Library
Purpose  : Source file for initial database data.
Revisions: Original definition by Lawrence Gunn.
           2014/08/24

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

/**
 * This is the N simulator.
 * @module N
 */
var N = N || {};
N.NWS = N.NWS || {};

  //*********************
  //* N.NWS.InitialData *
  //*********************

N.NWS.InitialData = function() {
}

N.NWS.InitialData.prototype.writeToDb = function(database) {
  var data = N.NWS.InitialData.data;
  for(var i in data) {
    database.writeDocument(data[i]);
  }
}

N.NWS.InitialData.data = [{
  _id: 'fb958ba82f424b3888b04add2849468b',
  docType: 'neuron-template',
  name: 'Excitatory Regular Spiking',
  compartments: [{
    className: 'N.Comp.Output',
    name: 'OP',
    initialOutput: 0.0,
    outputLogic: {
      outputFunc: 'N.Comp.OutputFunc.LinearSum',
      sources: {
        main: { componentName: 'IP',  gain: 1.0 }
      }
    }
  },{
    className: 'N.Comp.LinearSummingInput',
    name: 'IP'
  }],
  display: {
    template: 'N.UI.StandardNeuronTemplates.ExcitatoryInterneuron',
    radius: 0.2,
    compartmentMap : { 'Dendrites': 'IP', 'Body': 'OP'  }
  }
}];
