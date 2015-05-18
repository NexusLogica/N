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

N.UI.PiNetwork = function(sceneSignals, parentPiNetwork) {
  this.sceneSignals = sceneSignals;
  this.parentPiNetwork = parentPiNetwork;
  this.x = 0;
  this.y = 0;
  this._set = null;
  this.scale = 100.0;
  this.piNeurons = [];
  this.piNeuronsByName = {};
  this.piConnections = {};
  this.group = null;
  this.networkJSON = {};
  this.piNetworks = [];
  this.piNetworksByName = {};
  this.drawBorder = true;
  this.gridSpacing = 0.05;
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
  this.name = this.network.name;
  return this;
};

/**
 * Get a PiNetwork object owned by this PiNetwork object given the network name.
 * @method getNetworkByName
 * @param {String} name
 * @returns {N.UI.PiNetwork}
 */
N.UI.PiNetwork.prototype.getNetworkByName = function(name) {
  return this.piNetworksByName[name];
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

/**
 * Get the parent network. This call is implemented by all network, neuron, and compartment objects.
 * @method getParent
 * @returns {Object} The parent network object or null if there is none.
 */
N.UI.PiNetwork.prototype.getParent = function() {
  return this.parentPiNetwork;
};

/**
 * Get the the root/top level network.
 * @method getRoot
 * @returns {N.Network} The root network object or self if this is the root.
 */
N.UI.PiNetwork.prototype.getRoot = function() {
  return this.parentPiNetwork ? this.parentPiNetwork.getRoot() : this;
};

N.UI.PiNetwork.prototype.layout = function() {

  var width = this.network.display.width;
  var height = this.network.display.height;

  this.unscaledWidth = width;
  this.unscaledHeight = (height !== 0 ? height : 0.3);
  return this;
};

N.UI.PiNetwork.prototype.render = function(svgParent, scale, signals) {
  this.signals = signals;

  this.group = svgParent.group();
  this.group.translate(this.x, this.y);

  var classNameFull = 'pi-network';
  if(this.hasOwnProperty('className')) { classNameFull += ' '+this.className; }
  this.group.attr({ class: classNameFull });

  this.scale = scale;
  this.createBackgroundPattern();

  // If no
  //if(!this.parentPiNetwork) {
    this.width = this.scale*(_.isUndefined(this.width) ? this.unscaledWidth : this.width);
  //}
  this.height = this.scale*(_.isUndefined(this.height) ? this.unscaledHeight : this.height);

  this.rect = { left: 0, top: 0, right: this.width, bottom: this.height };

  if(!this.parentPiNetwork) {
    this.outerRect = this.group.rect(this.width, this.height)
      .radius(2)
      .move(this.rect.left, this.rect.top)
      .fill(this.backgroundPattern);
      //.attr({
      //  class: 'single',
      //  'fill': this.backgroundColor ? this.backgroundColor : '#ff0000',
      //  'fill-opacity': 1.0
      //});

    if (this.drawBorder) {
      this.outerRect.attr({
        'stroke-width': '1px',
        'stroke': (this.borderColor ? this.borderColor : '#BBBBBB')
      })
    }
  }

  var padding = new N.UI.Padding(0, 2);
  var y = 0.0;
  var patternSize = this.gridSpacing*this.scale;

  this.networks = this.networks || [];
  for(var ii=0; ii<this.networks.length; ii++) {
    var netConfig = this.networks[ii];
    var networkName = netConfig.name;

    var network = this.network.getNetworkByName(networkName);
    if (!network) {
      N.log('ERROR: N.UI.PiNetwork.render: No network of name '+networkName+' was found in '+this.network.name);
    } else {

      var piNetwork = (new N.UI.PiNetwork(this.sceneSignals, this)).loadFrom(network.display).setNetwork(network);
      piNetwork.scale = this.scale;
      piNetwork.layout();

      this.piNetworks.push(piNetwork);
      this.piNetworksByName[networkName] = piNetwork;

      piNetwork.x = netConfig.x*this.scale;
      piNetwork.y = netConfig.y*this.scale;
      piNetwork.backgroundColor = netConfig.backgroundColor;
      piNetwork.drawBorder = false;
      piNetwork.labelFontSize = this.labelFontSize;

      var backgroundColor = piNetwork.backgroundColor;
      piNetwork.$$backgroundPattern = this.group.pattern(patternSize, patternSize, function(add) {
        add.rect(patternSize, patternSize).fill(backgroundColor);
      });
      this.group.rect(this.width, piNetwork.height*this.scale)
        .move(0.0, piNetwork.y)
        .fill(piNetwork.$$backgroundPattern)
        .addClass('pointer-transparent');

      piNetwork.render(this.group, this.scale, this.signals);
    }
  }

  var neuronsDisplay = this.network.display.neurons || [];
  for(var i=0; i<neuronsDisplay.length; i++) {
    var nd = neuronsDisplay[i];
    var neuron = this.network.getNeuronByName(nd.name);
    if(neuron) {
      var template = this.getTemplate(this.renderMappings, neuron.name);
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

  for(var path in this.connections) {
    var piConnectionJson = this.connections[path];
    var connection = this.network.getConnectionByPath(path);
    if(connection) {
      var piConnection = new N.UI.PiConnection(this, connection);
      piConnection.fromJson(piConnectionJson);
      this.piConnections[path] = piConnection;
      piConnection.render(this.group);
    }
  }

  this._label = this.group.plain(this.network.name).move(6, 3).attr('font-size', this.labelFontSize*this.scale);

  this.addEventHandlers();
};

N.UI.PiNetwork.prototype.createBackgroundPattern = function() {
  var patternSize = this.gridSpacing*this.scale;
  var _this = this;
  this.backgroundPattern = this.group.pattern(patternSize, patternSize, function(add) {
    add.rect(patternSize, patternSize).fill(_this.backgroundColor);
  });
};

/***
 * Show the grid.
 */
N.UI.PiNetwork.prototype.showGrid = function() {
  var patternSize = this.gridSpacing*this.scale;
  var _this = this;
  this.backgroundPattern.update(function(add) {
    add.rect(patternSize, patternSize).fill(_this.backgroundColor);
    add.circle(0.02*_this.scale).center(0.0, 0.0).fill('#CCCCCC');
  });

  _.forEach(this.piNetworks, function(piNetwork) {
    piNetwork.$$backgroundPattern.update(function(add) {
      add.rect(patternSize, patternSize).fill(piNetwork.backgroundColor);
      add.circle(0.02*_this.scale).center(0.0, 0.0).fill('#CCCCCC');
    });
  });
};
/***
 * Show the grid.
 */
N.UI.PiNetwork.prototype.hideGrid = function() {
  var patternSize = this.gridSpacing*this.scale;
  var _this = this;
  this.backgroundPattern.update(function(add) {
    add.rect(patternSize, patternSize).fill(_this.backgroundColor);
  });

  _.forEach(this.piNetworks, function(piNetwork) {
    piNetwork.$$backgroundPattern.update(function(add) {
      add.rect(patternSize, patternSize).fill(piNetwork.backgroundColor);
    });
  });
};

N.UI.PiNetwork.prototype.addConnection = function(piConnection) {
  if(piConnection.connection) {
    this.piConnections[piConnection.connection.getPath()] = piConnection;
  } else {
    this.annonymousConnection = piConnection;
  }
  piConnection.render(this.group);
};

N.UI.PiNetwork.prototype.removeConnection = function(piConnection) {
  if(this.annonymousConnection === piConnection) {
    this.annonymousConnection = null;
  } else {
    _.remove(this.piConnections, piConnection);
  }
  piConnection.remove();
};

N.UI.PiNetwork.prototype.renderBackground = function(className, padding) {
  this.outerRect = this.group.rect(this.rect.right-this.rect.left-padding[3]-padding[1], this.rect.bottom-this.rect.top-padding[2]-padding[0])
    .move(this.rect.left+padding[3], this.rect.top+padding[0])
    .back()
    .attr({ class: className});
};

N.UI.PiNetwork.prototype.onBackgroundMove = function(event) {
  this.dispatchEvent('background-move', event);
};

N.UI.PiNetwork.prototype.onBackgroundClick = function(event) {
  this.dispatchEvent('background-click', event);
};

N.UI.PiNetwork.prototype.dispatchEvent = function(name, event) {
  var eventData = this.positionFromEvent(event);
  eventData.piNetwork = this;
  eventData.network = this.network;
  this.sceneSignals[name].dispatch(eventData);
};

/***
 * From the event information, determine the position and snap position on the network.
 * @param event
 * @returns {{pos: {x: number, y: number}, snap: *}}
 */
N.UI.PiNetwork.prototype.positionFromEvent = function(event) {
  var clientRect = this.outerRect.node.getBoundingClientRect();
  var x = event.clientX-clientRect.left;
  var y = event.clientY-clientRect.top;
  var snap = this.getNearestGridPoint(x, y);

  var s = this.scale;
  snap.x /= s;
  snap.y /= s;
  return { pos: { x: x/s, y: y/s }, snap: snap };
};

N.UI.PiNetwork.prototype.addEventHandlers = function() {
  if(!this.parentPiNetwork) {
    var _this = this;
    var onMoveHandler = N.UI.PiNetwork.prototype.onBackgroundMove.bind(this);
    var onClickHandler = N.UI.PiNetwork.prototype.onBackgroundClick.bind(this);

    $(this.outerRect.node).on('mousemove', onMoveHandler);
    $(this.outerRect.node).on('click', onClickHandler);
  }
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


