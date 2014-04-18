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
  this.Neurons = [];
  this.NeuronsByName = {};
  this.ConnectionsDisplays = {};
  this.Group = null;
}

/**
 * Set the network connection.
 * @method SetNetwork
 * @param {N.Network} network
 * @returns {N.UI.PiNetwork} Returns a reference to self.
 * @constructor
 */
N.UI.PiNetwork.prototype.SetNetwork = function(network) {
  this.Network = network;
  return this;
}

N.UI.PiNetwork.prototype.AddConnectionDisplay = function(name, group) {
  if(this.ConnectionsDisplays.hasOwnProperty(name)) {
    this.ConnectionsDisplays[name].remove();
  }
  this.ConnectionsDisplays[name] = group;
}

N.UI.PiNetwork.prototype.Render = function(svgParent, scale) {
  this.Group = svgParent.group();
  this.Group.translate(this.X, this.Y);

  this.Scale = scale;
  this.Rows = _.clone(this.Network.Display.Rows);

  var classNameFull = 'pi-network';
  if(this.hasOwnProperty('ClassName')) { classNameFull += ' '+this.ClassName; }
  if(this.Network.ShortName.length) { classNameFull += ' '+this.Network.ShortName; }
  this.Group.attr({ class: classNameFull });

  var w = this.Width*this.Scale, h = this.Height*this.Scale;
  this.Rect = { Left: -0.5*w, Top: -0.5*h, Right: 0.5*w, Bottom: 0.5*h };

  this._outerRect = this.Group.rect(w, h)
    .radius(2)
    .move(this.Rect.Left, this.Rect.Top)
    .attr({ class: 'single'});

  for(var i=0; i<this.Network.Display.Rows.length; i++) {
    var row = this.Network.Display.Rows[i];
    var spacing = row.Spacing;
    var numColumns = row.Cols.length;
    var rowY = row.y*this.Scale;

    for(var j=0; j<numColumns; j++) {
      var col = row.Cols[j];
      if(col.Name) {
        var neuron = this.Network.GetNeuronByName(col.Name);
        if(neuron && neuron.Display) {
          var template = neuron.Display.Template;
          var radius = scale*neuron.Display.Radius;
          var graphic = N.UI.PiNeuronFactory.CreatePiNeuron(neuron.Display.Template, radius);
          graphic.NeuronClassName = neuron.ShortName;
          this.Neurons.push(graphic);
          this.NeuronsByName[neuron.ShortName] = graphic;

          graphic.X = this.Scale*(j*spacing-0.5*spacing*(numColumns-1));
          graphic.Y = row.Y*this.Scale;
          graphic.Radius = radius;
          graphic.Row = i;
          graphic.Col = j;

          graphic.Render(neuron, this.Group);
        }
      }
    }
  }

  this._label = this.Group.plain(this.Network.ShortName).move(-0.5*w+6, -0.5*h+3);

  this.RouteInfo = new N.UI.RouteInfo(this);
  this.RouteInfo.BuildPassageInformation();
  //this.ShowRoutes();
}

/**
 * Returns the svg.js group object that contains the network and all of its contents.
 * @method GetGroup
 * @returns {SVG.Group}
 * @constructor
 */
N.UI.PiNetwork.prototype.GetGroup = function() {
  return this.Group;
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

N.UI.PiNetwork.prototype.ShowRoutes = function() {
  var r = this.RouteInfo;
  for(var i=0; i< r.LaneRows.length; i++) {
    var laneRow = r.LaneRows[i];
    var yNeg = laneRow.ThruNeg.YPos;
    var yPos = laneRow.ThruPos.YNeg;
    var radius = 5.0;
    for(var j=0; j<laneRow.length; j++) {
      var lane = laneRow[j];
      this.Group.rect(lane.Right-lane.Left, yPos-yNeg).move(lane.Left, yNeg);
      this.Group.circle(2*radius).move(lane.Left+0.5*(lane.Right-lane.Left)-radius, yNeg+0.5*(yPos-yNeg)-radius).fill('red');
    }
  }
}
