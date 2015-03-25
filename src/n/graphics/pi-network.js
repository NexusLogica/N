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

  //******************
  //* N.UI.PiNetwork *
  //******************

N.UI.PiNetwork = function(parentNetwork) {
  this.parentNetwork = parentNetwork;
  this.x = 0;
  this.y = 0;
  this._set = null;
  this.scale = 100.0;
  this.neurons = [];
  this.neuronsByName = {};
  this.connectionsDisplays = {};
  this.group = null;
  this.networkJSON = {};
  this.networks = [];
  this.networksByName = {};
  this.drawBorder = true;
};

/**
 * Set the network connection.
 * @method setNetwork
 * @param {N.network} network
 * @returns {N.UI.PiNetwork} Returns a reference to self.
 * @constructor
 */
N.UI.PiNetwork.prototype.setNetwork = function(network) {
  this.network = network;
  return this;
};

/**
 * Get a PiNetwork object owned by this PiNetwork object given the network name.
 * @method getNetworkByName
 * @param {String} shortName
 * @returns {N.UI.PiNetwork}
 */
N.UI.PiNetwork.prototype.getNetworkByName = function(name) {
  return this.networksByName[name];
};

/**
 * Get a PiNetwork object owned by this PiNetwork object given the network name.
 * @method getNeuronByName
 * @param {String} shortName
 * @returns {N.UI.PiNeuron}
 */
N.UI.PiNetwork.prototype.getNeuronByName = function(name) {
  return this.neuronsByName[name];
};

N.UI.PiNetwork.prototype.addConnectionDisplay = function(name, group) {
  if(this.connectionsDisplays.hasOwnProperty(name)) {
    this.connectionsDisplays[name].remove();
  }
  this.connectionsDisplays[name] = group;
};

N.UI.PiNetwork.prototype.layout = function(renderMappings) {

  this.networkJSON = this.createStackedLayout(renderMappings);
  //////////// console.log('***** json='+JSON.stringify(this.networkJSON, undefined, 2));

  this.rows = _.cloneDeep(this.networkJSON.rows);

  var width = this.networkJSON.idealWidth;

  var height = (this.rows.length > 0 ? renderMappings.rowSpacing : 0);
  for(var k in this.rows) {
    height += this.rows[k].height+renderMappings.rowSpacing;
  }

  for(k in this.networks) {
    height += this.networks[k].unscaledHeight;
    var w = this.networks[k].unscaledWidth;
    if(w > width) {
      width = w;
    }
  }

  this.unscaledWidth = width;
  this.unscaledHeight = (height !== 0 ? height : 0.3);
  return this;
};

N.UI.PiNetwork.prototype.render = function(svgParent, scale, renderMappings) {

  this.group = svgParent.group();
  this.group.translate(this.x, this.y);

  var classNameFull = 'pi-network';
  if(this.hasOwnProperty('className')) { classNameFull += ' '+this.className; }
  this.group.attr({ class: classNameFull });

  this.scale = scale;

  // If no
  if(!this.parentNetwork) {
    this.width = this.scale*(_.isUndefined(this.width) ? this.unscaledWidth : this.width);
  }
  this.height = this.scale*(_.isUndefined(this.height) ? this.unscaledHeight : this.height);

  this.rect = { left: 0, top: 0, right: this.width, bottom: this.height };

  if(this.drawBorder) {
    this.outerRect = this.group.rect(this.width, this.height)
      .radius(2)
      .move(this.rect.left, this.rect.top)
      .attr({ class: 'single'});
  }

  var padding = new N.UI.Padding(0, 2);
  var y = 0.0;
  for(var ii in this.networks) {
    var childNetwork = this.networks[ii];
    childNetwork.drawBorder = false;

    childNetwork.width = this.width;
    childNetwork.y = y;

    childNetwork.render(this.group, this.scale, renderMappings);
    childNetwork.renderBackground((ii % 2 ? 'background-light-tan-odd' : 'background-light-tan-even'), padding);

    y += childNetwork.height+padding.vertical();

    if(ii < this.networks.length-1) {
      this.group.line(30, y, this.width-30, y).attr({ 'class': 'network-separator' });
    }
  }

  var rowY = 0;
  var lastHeight = 0;
  for(var i=0; i<this.rows.length; i++) {
    var row = this.rows[i];
    var rowX = 0.5*(this.width-row.width*this.scale);
    var spacing = row.spacing;
    var numColumns = row.cols.length;
    rowY += 0.5*row.height+renderMappings.rowSpacing+lastHeight;
    lastHeight = 0.5*row.height;

    for(var j=0; j<numColumns; j++) {
      var col = row.cols[j];
      if(col.name) {
        var neuron = this.network.getNeuronByName(col.name);
        if(neuron) {
          var template = this.getTemplate(renderMappings, col.groupName);
          var radius = this.scale*(neuron.display && neuron.display.radius ? neuron.display.radius : template.radius);
          var graphic = N.UI.PiNeuronFactory.createPiNeuron(template.template, radius);
          graphic.network = this;
          graphic.neuronClassName = neuron.name;
          this.neurons.push(graphic);
          this.neuronsByName[neuron.name] = graphic;

          graphic.radius = radius;
          rowX += radius;
          graphic.x = rowX;
          graphic.y = rowY*this.scale;
          graphic.row = i;
          graphic.col = j;

          graphic.render(neuron, this.group);

          rowX += graphic.radius+spacing*this.scale;
        }
      }
    }
  }

  this._label = this.group.plain(this.network.name).move(6, 3);

  this.routeInfo = new N.UI.RouteInfo(this);
  this.routeInfo.buildPassageInformation();
};

N.UI.PiNetwork.prototype.renderBackground = function(className, padding) {
  this.outerRect = this.group.rect(this.rect.right-this.rect.left-padding[3]-padding[1], this.rect.bottom-this.rect.top-padding[2]-padding[0])
    .move(this.rect.left+padding[3], this.rect.top+padding[0])
    .back()
    .attr({ class: className});
};

/**
 * Returns the svg.js group object that contains the network and all of its contents.
 * @method getGroup
 * @returns {SVG.group}
 * @constructor
 */
N.UI.PiNetwork.prototype.getGroup = function() {
  return this.group;
};

N.UI.PiNetwork.prototype.getTemplate = function(renderMappings, groupName) {
  var template = renderMappings[groupName];
  if(!template) {
    var gn = groupName;
    while(true) {
      var gnNew = this.getGroupName(gn);
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
};

N.UI.PiNetwork.prototype.loadFrom = function(json) {
  for(var i in json) {
    this[i] = json[i];
  }

  return this;
};

N.UI.PiNetwork.prototype.showRoutes = function() {
  var r = this.routeInfo;
  for(var i=0; i< r.laneRows.length; i++) {
    var laneRow = r.laneRows[i];
    var yNeg = laneRow.thruNeg.yPos;
    var yPos = laneRow.thruPos.yNeg;
    var radius = 5.0;
    for(var j=0; j<laneRow.length; j++) {
      var lane = laneRow[j];
      this.group.rect(lane.right-lane.left, yPos-yNeg).move(lane.left, yNeg);
      this.group.circle(2*radius).move(lane.left+0.5*(lane.right-lane.left)-radius, yNeg+0.5*(yPos-yNeg)-radius).fill('red');
    }
  }
};

N.UI.PiNetwork.prototype.createStackedLayout = function(renderMappings) {
  return this.appendNetworkToStackedLayout(this.network, renderMappings);
};

N.UI.PiNetwork.prototype.appendNetworkToStackedLayout = function(network, renderMappings) {
  var networkJson = { };

  for(var i in network.networks) {
    var childNetwork = (new N.UI.PiNetwork(this)).setNetwork(network.networks[i]);
    childNetwork.layout(renderMappings);
    this.networks.push(childNetwork);
    this.networksByName[childNetwork.network.name] = childNetwork;
  }

  var neurons = network.neurons;
  var groups = {};
  for(i in neurons) {
    var name = neurons[i].name;
    var groupName = this.getGroupNameData(name);
    if(!groups[groupName.groupName]) { groups[groupName.groupName] = [ groupName ]; } else { groups[groupName.groupName].push(groupName); }
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
    var dimensions = this.calculateRowDimensions(cols[i], renderMappings);
    maxWidth = (dimensions.width > maxWidth ? dimensions.width : maxWidth);
    totalHeight += dimensions.height;
    rows.push({ cols: cols[i], spacing: dimensions.spacing, height: dimensions.height, width: dimensions.width });
  }
  totalHeight += (cols.length+1)*renderMappings.rowSpacing;

  networkJson.rows = rows;
  networkJson.idealWidth = maxWidth+2*renderMappings.columnSpacing;
  networkJson.idealHeight = totalHeight;

  return networkJson;
};

N.UI.PiNetwork.prototype.calculateRowDimensions = function(row, renderMappings) {
  var offset = 0;
  var spacing = renderMappings.columnSpacing;
  var rFirst, rLast;
  var height = 0;
  for(var i = 0; i<row.length; i++) {
    var neuron = row[i];
    var data = this.getTemplate(renderMappings, neuron.groupName);
    if(!data) {
      data = renderMappings.default;
    }
    var neuronObj = this.network.neuronsByName[neuron.name];
    var r = (neuronObj.display && neuronObj.display.radius ? neuronObj.display.radius : data.radius);
    neuron.radius = r;
    var d = 2*r;
    if(i === 0) { rFirst = r; }
    else if(i === row.length-1) { rLast = r; }

    neuron.offset = offset;
    offset += 2*r+spacing;
    height = (2*r > height ? 2*r : height);
  }
  row.width = offset-spacing;
  var actualSpacing = row.width-rFirst-rLast;
  var finalSpacing = (row.length > 2 ? actualSpacing/(row.length-1) : 1);
  return { width: row.width, spacing: spacing, height: height };
};

N.UI.PiNetwork.prototype.getGroupName = function(name) {
  var i1 = name.lastIndexOf('[');
  if(i1 !== -1) {
    var i2 = name.indexOf(']', i1);
    if(i2 !== -1) {
      return name.substr(0, i1);
    }
  }
  return name;
};

N.UI.PiNetwork.prototype.getGroupNameData = function(name) {
  var i1 = name.lastIndexOf('[');
  if(i1 !== -1) {
    var i2 = name.indexOf(']', i1);
    if(i2 !== -1) {
      return { name: name, groupName: name.substr(0, i1), index: name.substr(i1+1, i2-i1-1) };
    }
  }
  return { name: name,  groupName: name };
};
