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
  this.NetworkJSON = {};
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

N.UI.PiNetwork.prototype.Construct = function(renderMappings) {

  this.NetworkJSON = this.CreateStackedLayout(renderMappings);
  console.log('***** json='+JSON.stringify(this.NetworkJSON, undefined, 2));

  this.Rows = _.cloneDeep(this.NetworkJSON.Rows);

  var width = _.max(this.Rows, function(r) { return r.MaxWidth; });

  var height = renderMappings.RowSpacing;
  for(var k in this.Rows) {
    height += this.Rows[k].Height+renderMappings.RowSpacing;
  }
  return { Width: width, Height: height };
}

N.UI.PiNetwork.prototype.Render = function(svgParent, scale, renderMappings) {

  this.Group = svgParent.group();
  this.Group.translate(this.X, this.Y);

  var classNameFull = 'pi-network';
  if(this.hasOwnProperty('ClassName')) { classNameFull += ' '+this.ClassName; }
  if(this.Network.Name.length) { classNameFull += ' '+this.Network.Name; }
  this.Group.attr({ class: classNameFull });

  this.Scale = scale;

  var w = this.Width*this.Scale, h = this.Height*this.Scale;
  this.Rect = { Left: -0.5*w, Top: -0.5*h, Right: 0.5*w, Bottom: 0.5*h };

  this._outerRect = this.Group.rect(w, h)
    .radius(2)
    .move(this.Rect.Left, this.Rect.Top)
    .attr({ class: 'single'});

  var rowY = -h/2/this.Scale;
  var lastHeight = 0;
  for(var i=0; i<this.Rows.length; i++) {
    var row = this.Rows[i];
    var spacing = row.Spacing;
    var numColumns = row.Cols.length;
    rowY += 0.5*row.Height+renderMappings.RowSpacing+lastHeight;
    lastHeight = 0.5*row.Height;

    for(var j=0; j<numColumns; j++) {
      var col = row.Cols[j];
      if(col.Name) {
        var neuron = this.Network.GetNeuronByName(col.Name);
        if(neuron) {
          var template = renderMappings[col.GroupName];
          var radius = this.Scale*template.Radius;
          var graphic = N.UI.PiNeuronFactory.CreatePiNeuron(template.Template, col.Radius*this.Scale);
          graphic.NeuronClassName = neuron.Name;
          this.Neurons.push(graphic);
          this.NeuronsByName[neuron.Name] = graphic;

          graphic.X = this.Scale*(j*spacing-0.5*spacing*(numColumns-1));
          graphic.Y = rowY*this.Scale;
          graphic.Radius = radius;
          graphic.Row = i;
          graphic.Col = j;

          graphic.Render(neuron, this.Group);
        }
      }
    }
  }

  this._label = this.Group.plain(this.Network.Name).move(-0.5*w+6, -0.5*h+3);

  this.RouteInfo = new N.UI.RouteInfo(this);
  this.RouteInfo.BuildPassageInformation();
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

N.UI.PiNetwork.prototype.CreateStackedLayout = function(renderMappings) {
  return this.AppendNetworkToStackedLayout(this.Network, renderMappings);
}

N.UI.PiNetwork.prototype.AppendNetworkToStackedLayout = function(network, renderMappings) {
  var neurons = network.Neurons;
  var groups = {};
  for(var i in neurons) {
    var groupName = this.GetGroupName(neurons[i].Name);
    if(!groups[groupName.GroupName]) { groups[groupName.GroupName] = [ groupName ]; } else { groups[groupName.GroupName].push(groupName); }
  }

  var cols = [];
  var singles = [];
  for(i in groups) {
    if(groups[i].length === 1) { singles.push(groups[i][0]); } else { cols.push(groups[i]); }
  }
  if(singles.length > 0) { cols.push(singles); }

  var maxWidth = 0;
  var rows = [];
  for(i in cols) {
    var dimensions = this.CalculateRowDimensions(cols[i], renderMappings);
    maxWidth = (dimensions.Width > maxWidth ? dimensions.Width : maxWidth);
    rows.push({ Cols: cols[i], Spacing: dimensions.Spacing, Height: dimensions.Height });
  }

  var networkJson = { Rows: rows, MaxWidth: maxWidth };
  return networkJson;
}

N.UI.PiNetwork.prototype.CalculateRowDimensions = function(row, renderMappings) {
  var offset = 0;
  var spacing = renderMappings.ColumnSpacing;
  var rFirst, rLast;
  var height = 0;
  for(var i = 0; i<row.length; i++) {
    var neuron = row[i];
    var data = renderMappings[neuron.GroupName];
    if(!data) {
      data = renderMappings.Default;
    }
    var r = data.Radius;
    neuron.Radius = r;
    var d = 2*r;
    if(i === 0) { rFirst = r; }
    else if(i === row.length-1) { rLast = r; }

    neuron.Offset = offset;
    offset += 2*r+spacing;
    height = (2*r > height ? 2*r : height);
  }
  row.Width = offset-spacing;
  var actualSpacing = row.Width-rFirst-rLast;
  var finalSpacing = (row.length > 2 ? actualSpacing/(row.length-1) : 1);
  return { Width: row.Width, Spacing: finalSpacing, Height: height };
}

N.UI.PiNetwork.prototype.GetGroupName = function(name) {
  var i1 = name.indexOf('[');
  if(i1 !== -1) {
    var i2 = name.indexOf(']', i1);
    if(i2 !== -1) {
      return { Name: name, GroupName: name.substr(0, i1), Index: name.substr(i1+1, i2-i1-1) };
    }
  }
  return { Name: name,  GroupName: name };
}
