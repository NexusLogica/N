/**********************************************************************

File     : pi-network.js
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

  //******************
  //* N.UI.PiNetwork *
  //******************

N.UI.PiNetwork = function() {
  this.X = 0;
  this.Y = 0;
  this._set = null;
  this.Scale = 100.0;
  this._piNeurons = {};
}

N.UI.PiNetwork.prototype.Render = function(network, svgParent, scale) {
  this._network = network;
  this._group = svgParent.group();
  this._group.translate(this.X, this.Y);

  this.Scale = scale;

  var classNameFull = 'pi-network';
  if(this.hasOwnProperty('className')) { classNameFull += ' '+this.className; }
  this._group.attr({ class: classNameFull });

  var w = this.Width*this.Scale, h = this.Height*this.Scale;
  this._outerRect = this._group.rect(w, h)
      .radius(2)
      .move(-0.5*w, -0.5*h)
      .attr({ class: 'single'});

  for(var i in this._network.Display.Neurons) {
    var position = this._network.Display.Neurons[i];
    console.log('******* name = '+i+' at '+JSON.stringify(position));
    var neuron = this._network.NeuronsByName[i];
    console.log('******* neuron = '+i+' at '+JSON.stringify(neuron));

    var template = neuron.Display.Template;
    var piGraphic = N.UI.PiNeuronFactory.CreatePiNeuron(neuron.Display.Template, scale*neuron.Display.Radius);
    this._piNeurons[i] = { neuron: neuron, piGraphic: piGraphic };
    piGraphic.X = position.X*this.Scale;
    piGraphic.Y = position.Y*this.Scale;
    piGraphic.Render(this._group);
  }

  this._label = this._group.plain(this._network.ShortName).move(-0.5*w+6, -0.5*h+3);
}

N.UI.PiNetwork.prototype.GetGroup = function() {
  return this._group;
}

N.UI.PiNetwork.prototype.SetScale = function(scale) {
  this.Scale = scale;
  return this;
}

N.UI.PiNetwork.prototype.LoadFrom = function(json) {
  for(var i in json) {
    if(i === 'Neurons') {
      for(var j=0; j<json.Neurons.length; j++) {
        var neuronJson = json.Neurons[j];
        var neuron = N.NewN(neuronJson.ClassName).LoadFrom(neuronJson);
        this.Neurons.push(neuron);
      }
    }
    else {
      this[i] = json[i];
    }
  }

  return this;
}

