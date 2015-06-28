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
  this.xScaled = 0;
  this.yScaled = 0;
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

/**
 * Gets the offset of this Pi Network object in its parent.
 * @method getOffset
 * @returns {x,y} Returns the x and y values of the offset of this network inside its parent display.
 */
N.UI.PiNetwork.prototype.getOffset = function() {
  if(this.parentPiNetwork) {
    var offset = this.parentPiNetwork.getOffset();
    offset.x += this.x;
    offset.y += this.y;
    return offset;
  } else {
    return { x: 0, y: 0 };
  }
};

/**
 * Gets the offset of this Pi Network object relative to is parent, but only up to a certain network.
 * @method getOffsetTo
 * @parameter piNetwork - Get only up to this network.
 * @returns {x,y} Returns the x and y values of the offset of this network inside its parent display.
 */
N.UI.PiNetwork.prototype.getOffsetTo = function(piNetwork) {
  if(piNetwork !== this && this.parentPiNetwork) {
    var offset = this.parentPiNetwork.getOffsetTo(piNetwork);
    offset.x += this.x;
    offset.y += this.y;
    return offset;
  } else {
    return { x: 0, y: 0 };
  }
};

/**
 * Gets the outerRect SVG object of self or, if none, its parent network.
 * @returns {object} Returns the outer rectangle object.
 */
N.UI.PiNetwork.prototype.getOuterRect = function() {
  return this.outerRect || this.parentPiNetwork.getOuterRect();
};

N.UI.PiNetwork.prototype.layout = function() {

  this.widthScaled = this.width*this.scale;
  this.heightScaled = this.height*this.scale;
  if(this.parentConfig) {
    this.xScaled = this.parentConfig.x * this.scale;
    this.yScaled = this.parentConfig.y * this.scale;
  }

  return this;
};

N.UI.PiNetwork.prototype.render = function(svgParent, scale, signals) {
  this.signals = signals;

  this.group = svgParent.group();
  this.group.translate(this.xScaled, this.yScaled);

  var classNameFull = 'pi-network';
  if(this.hasOwnProperty('className')) { classNameFull += ' '+this.className; }
  this.group.attr({ class: classNameFull });

  this.scale = scale;
  this.createBackgroundPattern();
  this.rect = { left: 0, top: 0, right: this.widthScaled, bottom: this.heightScaled };

  if(!this.parentPiNetwork) {
    this.outerRect = this.group.rect(this.widthScaled, this.heightScaled)
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

  for(var ii=0; ii<this.piNetworks.length; ii++) {
    var piNetwork = this.piNetworks[ii];
    piNetwork.scale = this.scale;
    piNetwork.layout();

    var backgroundColor = piNetwork.backgroundColor;
    piNetwork.$$backgroundPattern = this.group.pattern(patternSize, patternSize, function(add) {
      add.rect(patternSize, patternSize).fill(backgroundColor);
    });
    this.group.rect(this.widthScaled, piNetwork.heightScaled)
      .move(0.0, piNetwork.yScaled)
      .fill(piNetwork.$$backgroundPattern)
      .addClass('pointer-transparent');

    piNetwork.render(this.group, this.scale, this.signals);
  }

  for(var i=0; i<this.piNeurons.length; i++) {
    this.piNeurons[i].scale = this.scale;
    this.piNeurons[i].render(this.group);
  }

  for(var path in this.connections) {
    var piConnectionJson = this.connections[path];
    var connection = this.network.getConnectionByPath(path);
    if(connection) {
      var piConnection = new N.UI.PiConnection(this, connection);
      piConnection.fromJson(piConnectionJson);
      this.piConnections[path] = piConnection;
      piConnection.render(this.group);
      piConnection.setSceneSignals(this.sceneSignals);
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

N.UI.PiNetwork.prototype.onBackgroundMouseDown = function(event) {
  this.dispatchEvent('background-mouse-down', event);
};

N.UI.PiNetwork.prototype.onBackgroundMouseUp = function(event) {
  this.dispatchEvent('background-mouse-up', event);
};

N.UI.PiNetwork.prototype.onBackgroundClick = function(event) {
  this.dispatchEvent('background-click', event);
};

N.UI.PiNetwork.prototype.dispatchEvent = function(name, event) {
  this.positionFromEvent(event);
  event.piNetwork = this;
  event.network = this.network;
  this.sceneSignals[name].dispatch(event);
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
  event.pos = { x: x/s, y: y/s };
  event.snap = snap;
};

N.UI.PiNetwork.prototype.addEventHandlers = function() {
  if(!this.parentPiNetwork) {
    var _this = this;
    var onMoveHandler = N.UI.PiNetwork.prototype.onBackgroundMove.bind(this);
    var onMouseDownHandler = N.UI.PiNetwork.prototype.onBackgroundMouseDown.bind(this);
    var onMouseUpHandler = N.UI.PiNetwork.prototype.onBackgroundMouseUp.bind(this);
    var onClickHandler = N.UI.PiNetwork.prototype.onBackgroundClick.bind(this);

    $(this.outerRect.node).on('mousemove', onMoveHandler);
    $(this.outerRect.node).on('mousedown', onMouseDownHandler);
    $(this.outerRect.node).on('mouseup',   onMouseUpHandler);
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

N.UI.PiNetwork.prototype.load = function(loader) {
  var deferred = Q.defer();
  var _this = this;

  loader(this.network.displaySource).then(function(json) {
    _this.display = json;
    _.extend(_this, json);
    if(_this.parentConfig) {
      _this.x = _this.parentConfig.x;
      _this.y = _this.parentConfig.y;
      _this.backgroundColor = _this.parentConfig.backgroundColor;
    }
    var promises = [];
    var i, parentConfig, promise;

    _this.networks = _this.networks || [];
    for(i=0; i<_this.networks.length; i++) {
      parentConfig = _this.networks[i];
      var networkName = parentConfig.name;

      var network = _this.network.getNetworkByName(networkName);
      if (network) {
        var piNetwork = new N.UI.PiNetwork(_this.sceneSignals, _this);
        piNetwork.setNetwork(network);
        piNetwork.scale = _this.scale;
        piNetwork.parentConfig = _.cloneDeep(parentConfig);

        piNetwork.drawBorder = false;
        piNetwork.labelFontSize = _this.labelFontSize;

        _this.piNetworks.push(piNetwork);
        _this.piNetworksByName[networkName] = piNetwork;

        promise = piNetwork.load(loader);
        promises.push(promise);
      } else {
        N.log('ERROR: N.UI.PiNetwork.render: No network of name ' + networkName + ' was found in ' + _this.network.name);
      }
    }

    _this.neurons = _this.neurons || [];
    for(i=0; i<_this.neurons.length; i++) {
      parentConfig = _this.neurons[i];
      var neuronName = parentConfig.name;

      var neuron = _this.network.getNeuronByName(neuronName);
      if (neuron) {
        var piNeuron = new N.UI.PiNeuron(neuron, _this.sceneSignals, _this);
        piNeuron.scale = _this.scale;
        piNeuron.parentConfig = _.cloneDeep(parentConfig);

        _this.piNeurons.push(piNeuron);
        _this.piNeuronsByName[neuronName] = piNeuron;

        promise = piNeuron.load(loader);
        promises.push(promise);
      } else {
        N.log('ERROR: N.UI.PiNetwork.render: No neuron of name ' + neuronName + ' was found in ' + _this.neuron.name);
      }
    }

    Q.all(promises).then(function() {
      deferred.resolve();
    }, function(err) {
      deferred.reject(err);
    });
  }, function(err) {
    deferred.reject(err);
  });

  return deferred.promise;
};
