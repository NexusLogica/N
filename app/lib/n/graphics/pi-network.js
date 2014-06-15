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

N.UI.PiNetwork = function(parentNetwork) {
  this.ParentNetwork = parentNetwork;
  this.X = 0;
  this.Y = 0;
  this._set = null;
  this.Scale = 100.0;
  this.Neurons = [];
  this.NeuronsByName = {};
  this.ConnectionsDisplays = {};
  this.Group = null;
  this.NetworkJSON = {};
  this.Networks = [];
  this.NetworksByName = {};
  this.DrawBorder = true;
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

/**
 * Get a PiNetwork object owned by this PiNetwork object given the network name.
 * @method GetNetworkByName
 * @param {String} shortName
 * @returns {N.UI.PiNetwork}
 */
N.UI.PiNetwork.prototype.GetNetworkByName = function(name) {
  return this.NetworksByName[name];
}

/**
 * Get a PiNetwork object owned by this PiNetwork object given the network name.
 * @method GetNeuronByName
 * @param {String} shortName
 * @returns {N.UI.PiNeuron}
 */
N.UI.PiNetwork.prototype.GetNeuronByName = function(name) {
  return this.NeuronsByName[name];
}

N.UI.PiNetwork.prototype.AddConnectionDisplay = function(name, group) {
  if(this.ConnectionsDisplays.hasOwnProperty(name)) {
    this.ConnectionsDisplays[name].remove();
  }
  this.ConnectionsDisplays[name] = group;
}

N.UI.PiNetwork.prototype.Layout = function(renderMappings) {

  this.NetworkJSON = this.CreateStackedLayout(renderMappings);
  console.log('***** json='+JSON.stringify(this.NetworkJSON, undefined, 2));

  this.Rows = _.cloneDeep(this.NetworkJSON.Rows);

  var width = this.NetworkJSON.IdealWidth;

  var height = (this.Rows.length > 0 ? renderMappings.RowSpacing : 0);
  for(var k in this.Rows) {
    height += this.Rows[k].Height+renderMappings.RowSpacing;
  }

  for(k in this.Networks) {
    height += this.Networks[k].UnscaledHeight;
    var w = this.Networks[k].UnscaledWidth;
    if(w > width) {
      width = w;
    }
  }

  this.UnscaledWidth = width;
  this.UnscaledHeight = height;
  return this;
}

N.UI.PiNetwork.prototype.Render = function(svgParent, scale, renderMappings) {

  this.Group = svgParent.group();
  this.Group.translate(this.X, this.Y);

  var classNameFull = 'pi-network';
  if(this.hasOwnProperty('ClassName')) { classNameFull += ' '+this.ClassName; }
  this.Group.attr({ class: classNameFull });

  this.Scale = scale;

  // If no
  if(!this.ParentNetwork) {
    this.ScaledWidth = this.Scale*(_.isUndefined(this.Width) ? this.UnscaledWidth : this.Width);
  }
  this.ScaledHeight = this.Scale*(_.isUndefined(this.Height) ? this.UnscaledHeight : this.Height);

  this.Rect = { Left: 0, Top: 0, Right: this.ScaledWidth, Bottom: this.ScaledHeight };

  if(this.DrawBorder) {
    this.OuterRect = this.Group.rect(this.ScaledWidth, this.ScaledHeight)
      .radius(2)
      .move(this.Rect.Left, this.Rect.Top)
      .attr({ class: 'single'});
  }

  var padding = new N.UI.Padding(0, 2);
  var y = 0.0;
  for(var ii in this.Networks) {
    var childNetwork = this.Networks[ii];
    childNetwork.DrawBorder = false;

    childNetwork.ScaledWidth = this.ScaledWidth;
    childNetwork.Y = y;

    childNetwork.Render(this.Group, this.Scale, renderMappings);
    childNetwork.RenderBackground((ii % 2 ? 'background-light-tan-odd' : 'background-light-tan-even'), padding);

    y += childNetwork.ScaledHeight+padding.Vertical();

    if(ii < this.Networks.length-1) {
      this.Group.line(30, y, this.ScaledWidth-30, y).attr({ 'class': 'network-separator' });
    }
  }

  var rowY = 0;
  var lastHeight = 0;
  for(var i=0; i<this.Rows.length; i++) {
    var row = this.Rows[i];
    var rowX = 0.5*(this.ScaledWidth-row.Width*this.Scale);
    var spacing = row.Spacing;
    var numColumns = row.Cols.length;
    rowY += 0.5*row.Height+renderMappings.RowSpacing+lastHeight;
    lastHeight = 0.5*row.Height;

    for(var j=0; j<numColumns; j++) {
      var col = row.Cols[j];
      if(col.Name) {
        var neuron = this.Network.GetNeuronByName(col.Name);
        if(neuron) {
          var template = this.GetTemplate(renderMappings, col.GroupName);
          var radius = this.Scale*template.Radius;
          var graphic = N.UI.PiNeuronFactory.CreatePiNeuron(template.Template, radius);
          graphic.Network = this;
          graphic.NeuronClassName = neuron.Name;
          this.Neurons.push(graphic);
          this.NeuronsByName[neuron.Name] = graphic;

          graphic.Radius = radius;
          rowX += radius;
          graphic.X = rowX;
          graphic.Y = rowY*this.Scale;
          graphic.Row = i;
          graphic.Col = j;

          graphic.Render(neuron, this.Group);

          rowX += graphic.Radius+spacing*this.Scale;
        }
      }
    }
  }

  this._label = this.Group.plain(this.Network.Name).move(6, 3);

  this.RouteInfo = new N.UI.RouteInfo(this);
  this.RouteInfo.BuildPassageInformation();
}

N.UI.PiNetwork.prototype.RenderBackground = function(className, padding) {
  this.OuterRect = this.Group.rect(this.Rect.Right-this.Rect.Left-padding[3]-padding[1], this.Rect.Bottom-this.Rect.Top-padding[2]-padding[0])
    .move(this.Rect.Left+padding[3], this.Rect.Top+padding[0])
    .back()
    .attr({ class: className});
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

N.UI.PiNetwork.prototype.GetTemplate = function(renderMappings, groupName) {
  var template = renderMappings[groupName];
  if(!template) {
    var gn = groupName;
    while(true) {
      var gnNew = this.GetGroupName(gn);
      if(gnNew === gn) {
        return null;
      }
      template = renderMappings[gnNew];
      if(template) {
        return template;
      }
      gn = gnNew;
    }
  }
  return template;
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
  var networkJson = { };

  for(var i in network.Networks) {
    var childNetwork = (new N.UI.PiNetwork(this)).SetNetwork(network.Networks[i]);
    childNetwork.Layout(renderMappings);
    this.Networks.push(childNetwork);
    this.NetworksByName[childNetwork.Network.Name] = childNetwork;
  }

  var neurons = network.Neurons;
  var groups = {};
  for(i in neurons) {
    var name = neurons[i].Name;
    var groupName = this.GetGroupNameData(name);
    if(!groups[groupName.GroupName]) { groups[groupName.GroupName] = [ groupName ]; } else { groups[groupName.GroupName].push(groupName); }
  }

  var cols = [];
  var singles = [];
  for(i in groups) {
    if(groups[i].length === 1) { singles.push(groups[i][0]); } else { cols.push(groups[i]); }
  }
  if(singles.length > 0) { cols.push(singles); }

  var maxWidth = 0;
  var totalHeight = 0;
  var rows = [];
  for(i in cols) {
    var dimensions = this.CalculateRowDimensions(cols[i], renderMappings);
    maxWidth = (dimensions.Width > maxWidth ? dimensions.Width : maxWidth);
    totalHeight += dimensions.Height;
    rows.push({ Cols: cols[i], Spacing: dimensions.Spacing, Height: dimensions.Height, Width: dimensions.Width });
  }
  totalHeight += (cols.length+1)*renderMappings.RowSpacing

  networkJson.Rows = rows;
  networkJson.IdealWidth = maxWidth+2*renderMappings.ColumnSpacing;
  networkJson.IdealHeight = totalHeight;

  return networkJson;
}

N.UI.PiNetwork.prototype.CalculateRowDimensions = function(row, renderMappings) {
  var offset = 0;
  var spacing = renderMappings.ColumnSpacing;
  var rFirst, rLast;
  var height = 0;
  for(var i = 0; i<row.length; i++) {
    var neuron = row[i];
    var data = this.GetTemplate(renderMappings, neuron.GroupName);
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
  return { Width: row.Width, Spacing: spacing, Height: height };
}

N.UI.PiNetwork.prototype.GetGroupName = function(name) {
  var i1 = name.lastIndexOf('[');
  if(i1 !== -1) {
    var i2 = name.indexOf(']', i1);
    if(i2 !== -1) {
      return name.substr(0, i1);
    }
  }
  return name;
}

N.UI.PiNetwork.prototype.GetGroupNameData = function(name) {
  var i1 = name.lastIndexOf('[');
  if(i1 !== -1) {
    var i2 = name.indexOf(']', i1);
    if(i2 !== -1) {
      return { Name: name, GroupName: name.substr(0, i1), Index: name.substr(i1+1, i2-i1-1) };
    }
  }
  return { Name: name,  GroupName: name };
}

