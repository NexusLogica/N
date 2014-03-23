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
  this.Graphics = [];
  this.GraphicsByName = {};
}

N.UI.PiNetwork.prototype.Render = function(network, svgParent, scale) {
  this._network = network;
  this._group = svgParent.group();
  this._group.translate(this.X, this.Y);

  this.Scale = scale;
  this.Rows = _.clone(this._network.Display.Rows);

  var classNameFull = 'pi-network';
  if(this.hasOwnProperty('className')) { classNameFull += ' '+this.className; }
  if(this._network.ShortName.length) { classNameFull += ' '+this._network.ShortName; }
  this._group.attr({ class: classNameFull });

  var w = this.Width*this.Scale, h = this.Height*this.Scale;
  this.Rect = { Left: -0.5*w, Top: -0.5*h, Right: 0.5*w, Bottom: 0.5*h };

  this._outerRect = this._group.rect(w, h)
    .radius(2)
    .move(this.Rect.Left, this.Rect.Top)
    .attr({ class: 'single'});

  for(var i=0; i<this._network.Display.Rows.length; i++) {
    var row = this._network.Display.Rows[i];
    var spacing = row.Spacing;
    var numColumns = row.Cols.length;
    var rowY = row.y*this.Scale;

    for(var j=0; j<numColumns; j++) {
      var col = row.Cols[j];
      if(col.Name) {
        var neuron = this._network.GetNeuronByName(col.Name);
        if(neuron && neuron.Display) {
          var template = neuron.Display.Template;
          var radius = scale*neuron.Display.Radius;
          var graphic = N.UI.PiNeuronFactory.CreatePiNeuron(neuron.Display.Template, radius);
          graphic.NeuronClassName = neuron.ShortName;
          this.Graphics.push(graphic);
          this.GraphicsByName[neuron.ShortName] = graphic;

          graphic.X = this.Scale*(j*spacing-0.5*spacing*(numColumns-1));
          graphic.Y = row.Y*this.Scale;
          graphic.Radius = radius;
          graphic.Row = i;
          graphic.Col = j;

          graphic.Render(neuron, this._group);
        }
      }
    }
  }

  this._label = this._group.plain(this._network.ShortName).move(-0.5*w+6, -0.5*h+3);

  this.Router = new N.UI.Router(this);
  this.Router.BuildRoutingGrid();
}

/**
 * Returns the svg.js group object that contains the network and all of its contents.
 * @method GetGroup
 * @returns {SVG.Group}
 * @constructor
 */
N.UI.PiNetwork.prototype.GetGroup = function() {
  return this._group;
}

N.UI.PiNetwork.prototype.SetScale = function(scale) {
  this.Scale = scale;
  return this;
}

N.UI.PiNetwork.prototype.LoadFrom = function(json) {
  for(var i in json) {
    this[i] = json[i];
  }

  return this;
}

