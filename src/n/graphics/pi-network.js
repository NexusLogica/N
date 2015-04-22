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

N.UI.PiNetwork = function(sceneSignals, parentNetwork) {
  this.sceneSignals = sceneSignals;
  this.parentNetwork = parentNetwork;
  this.x = 0;
  this.y = 0;
  this._set = null;
  this.scale = 100.0;
  this.piNeurons = [];
  this.piNeuronsByName = {};
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
 * @param {String} name
 * @returns {N.UI.PiNetwork}
 */
N.UI.PiNetwork.prototype.getNetworkByName = function(name) {
  return this.networksByName[name];
};

/**
 * Get a PiNetwork object owned by this PiNetwork object given the network name.
 * @method getNeuronByName
 * @param {String} name
 * @returns {N.UI.PiNeuron}
 */
N.UI.PiNetwork.prototype.getNeuronByName = function(name) {
  return this.piNeuronsByName[name];
};

N.UI.PiNetwork.prototype.addConnectionDisplay = function(name, group) {
  if(this.connectionsDisplays.hasOwnProperty(name)) {
    this.connectionsDisplays[name].remove();
  }
  this.connectionsDisplays[name] = group;
};

N.UI.PiNetwork.prototype.layout = function(renderMappings) {

  var width = this.network.display.width;
  var height = this.network.display.height;

  this.unscaledWidth = width;
  this.unscaledHeight = (height !== 0 ? height : 0.3);
  return this;
};

N.UI.PiNetwork.prototype.render = function(svgParent, scale, renderMappings, signals) {
  this.signals = signals;

  this.group = svgParent.group();
  this.group.translate(this.x, this.y);

  var display = this.network.display;

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
      .attr({
        class: 'single',
        'fill': display.backgroundColor ? display.backgroundColor : '#ff0000',
        'fill-opacity': 1.0 });
  }

  var grid = this.network.display.grid;

  this.spottingCircle = this.group.circle(5).attr({'stroke': '#ff0000', 'stroke-width': '2'});
  this.spottingCircle.hide();

  if(grid && grid.display) {
    this.gridPoints = [];
    this.gridSpacing = grid.spacing || 0.05;
    var spacing = this.scale*this.gridSpacing;
    this.defs = this.group.defs();
    var spot = this.defs.circle(1.0).attr('class', 'pi-grid-point');
    var numX = this.width/spacing;
    var numY = this.height/spacing;
    for(var j = 1; j<numX; j++) {
      for(var k = 1; k<numY; k++) {
        var pt = this.group.use(spot).move(j*spacing, k*spacing);
        this.gridPoints.push(pt);
      }
    }
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

  var neuronsDisplay = this.network.display.neurons || [];
  for(var i=0; i<neuronsDisplay.length; i++) {
    var nd = neuronsDisplay[i];
    var neuron = this.network.getNeuronByName(nd.name);
    if(neuron) {
      var template = this.getTemplate(renderMappings, neuron.name);
      var radius = this.scale*(nd.radius || template.radius);
      var piNeuron = N.UI.PiNeuronFactory.createPiNeuron(template.template, radius);
      piNeuron.sceneSignals = this.sceneSignals;
      piNeuron.scale = this.scale;
      piNeuron.network = this;
      piNeuron.neuronClassName = neuron.name;
      this.piNeurons.push(piNeuron);
      this.piNeuronsByName[neuron.name] = piNeuron;

      piNeuron.radius = radius;

      piNeuron.x = nd.x*this.scale;
      piNeuron.y = nd.y*this.scale;
      piNeuron.render(neuron, this.group);
    }
  }

  this._label = this.group.plain(this.network.name).move(6, 3);

  this.addEventHandlers();

  //this.routeInfo = new N.UI.RouteInfo(this);
  //this.routeInfo.buildPassageInformation();
};

N.UI.PiNetwork.prototype.renderBackground = function(className, padding) {
  this.outerRect = this.group.rect(this.rect.right-this.rect.left-padding[3]-padding[1], this.rect.bottom-this.rect.top-padding[2]-padding[0])
    .move(this.rect.left+padding[3], this.rect.top+padding[0])
    .back()
    .attr({ class: className});
};

N.UI.PiNetwork.prototype.addEventHandlers = function() {
  var _this = this;
  $(this.outerRect.node).on('click', function(event) {
    var clientRect = _this.outerRect.node.getBoundingClientRect();
    var x = event.clientX-clientRect.left;
    var y = event.clientY-clientRect.top;
    var snap = _this.getNearestGridPoint(x, y);

    var s = _this.scale;
    snap.x /= s;
    snap.y /= s;
    var eventData = { piNetwork: _this, network: _this.network, pos: { x: x/s, y: y/s }, snap: snap };
    _this.sceneSignals['background-click'].dispatch(eventData);
  });


  $(this.outerRect.node).on('mousemove', function(event) {
    _this.spottingCircle.show();
    var clientRect = _this.outerRect.node.getBoundingClientRect();
    var x = event.clientX-clientRect.left;
    var y = event.clientY-clientRect.top;
    if(x >= 0 && x < _this.width && y >= 0 && y < _this.height) {
      var pos = _this.getNearestGridPoint(x, y);
      _this.spottingCircle.move(pos.x, pos.y);
    }
  });

  $(this.outerRect.node).on('mouseleave', function(event) {
    _this.spottingCircle.hide();
  });
};

N.UI.PiNetwork.prototype.getNearestGridPoint = function(x, y) {
  var nx = Math.floor(x/this.scale/this.gridSpacing+0.5)*this.scale*this.gridSpacing;
  var ny = Math.floor(y/this.scale/this.gridSpacing+0.5)*this.scale*this.gridSpacing;
  return { x: nx, y: ny};
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
    var childNetwork = (new N.UI.PiNetwork(this.sceneSignals, this)).setNetwork(network.networks[i]);
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


