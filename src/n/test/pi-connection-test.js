/**********************************************************************

File     : pi-connection-test.js
Project  : N Simulator Library
Purpose  : Source file for connection graphics testing.
Revisions: Original definition by Lawrence Gunn.
           2014/03/21

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

var N = N || {};
N.Test = N.Test || {};

  //******************************
  //* PiConnectionTestController *
  //******************************

angular.module('nSimulationApp').controller('PiConnectionTestController', ['$scope', '$timeout',
  function PiConnectionTestController($scope, $timeout) {
    $scope.test = new N.Test.PiConnectionTest();
    $scope.test.createScene();
    $scope.scenes = [ $scope.test.scene ];

    $scope.$on('PiConnectionTest:OnInitialRender', function() {
      $scope.next();
    });

    $scope.next = function() {
      $scope.test.next();
    }

  }
]);

angular.module('nSimulationApp').directive('piConnectionTest', [function() {
  function link($scope, $element, $attrs) {
    $($element).find('.pi-canvas').on('onInitialRender', function(event, renderer, scene) {
      $scope.$emit('PiConnectionTest:OnInitialRender');
    });
  }

  return {
    restrict: 'A',
    transclude: false,
    scope: { title:'@' },
    link: link
  };
}]);

  //***************************
  //* N.Test.PiConnectionTest *
  //***************************

N.Test.PiConnectionTest = function() {
  this.nextRouteIndex = 0;
  var _this = this;
  this.stateMachine = StateMachine.create({
    initial: 'None',
    events: [
      { name: 'next',  from: '*', to: 'NextRouteTest' },
      { name: 'wait',  from: 'NextRouteTest', to: 'Waiting' }
    ],
    callbacks: {
      onenterNextRouteTest: function() {
        _this.showNextRoute();
      },
      onafternext: function() {
        _this.stateMachine.wait();
      }
    }
  });

  this.nextConnectionSetIndex = 0;
  this.connectionSetArrays = [
    ['SS[4][1]>OP->SS[1][5]>IP' ],
    ['SS[1][1]>OP->SS[2][4]>IP', 'SS[1][1]>OP->SS[1][5]>IP', 'SS[1][1]>OP->SS[5][5]>IP' ],
    ['SS[5][2]>OP->SS[3][2]>OP', 'SS[5][2]>OP->SS[3][3]>OP', 'SS[5][2]>OP->SS[2][2]>OP', 'SS[5][2]>OP->SS[1][3]>OP' ],
    ['SS[4][1]>OP->SS[4][3]>OP' ],
    ['SS[4][1]>OP->SS[2][1]>IP' ],
    ['SS[4][1]>OP->SS[2][1]>AIP' ],
    ['SS[4][1]>OP->SS[1][5]>AIP' ],
    ['SS[4][1]>OP->SS[2][1]>IP', 'SS[4][1]>OP->SS[1][5]>IP', 'SS[4][1]>OP->SS[4][3]>IP' ]
  ];
}

N.Test.PiConnectionTest.prototype.createScene = function() {
  this.scene = this.matrix();
  N.Objects.add(this.scene);
}

N.Test.PiConnectionTest.prototype.next = function() {
  this.stateMachine.next();
}

N.Test.PiConnectionTest.prototype.Matrix = function() {
  var renderMappings = {
    'ColumnSpacing': 0.3,
    'RowSpacing': 0.3,
    'SS[2]' : { template: 'N.UI.StandardNeuronTemplates.Stellate',              radius: 0.3 },
    'SS[4]' : { template: 'N.UI.StandardNeuronTemplates.Stellate',              radius: 0.5 },
    'SS' : { template: 'N.UI.StandardNeuronTemplates.Stellate',              radius: 0.4 },
    'IN' : { template: 'N.UI.StandardNeuronTemplates.InhibitoryInterneuron', radius: 0.3 },
    'IP' : { template: 'N.UI.StandardNeuronTemplates.InputSource',           radius: 0.2 },
    'OP' : { template: 'N.UI.StandardNeuronTemplates.OutputSink',            radius: 0.2 },
    'RN' : { template: 'N.UI.StandardNeuronTemplates.ExcitatoryInterneuron', radius: 0.2 },
    'Default' :  { template: 'N.UI.StandardNeuronTemplates.ExcitatoryInterneuron', radius: 0.2 }
  };

  var numRows = 5,
      numCols = 5,
      spacing = 2.2,
      vertSpacing = 2.2,
      horizPadding = 0.8,
      vertPadding = 0.8;

  var rowHeight = (numRows-1)*vertSpacing;
  var rowY = -0.5*rowHeight;

  var networkWidth = spacing*numCols+2*horizPadding;
  var networkHeight = vertSpacing*numRows+2*vertPadding;

  var numColumns = [ 5, 4, 5, 3, 5 ];
  var spacings   = [ 2.2, 3.0, 2.2, 3.5, 2.2 ];
  //var numColumns = [ 4, 4, 4, 4 ];
  //var spacings   = [ 2.2, 2.2, 2.2, 2.2 ];
  var config = { name: 'M', neurons: [], display: { rows: [] } };
  for(var i=0; i<numColumns.length; i++) {
    var rowDisplay = { rowId: 'row'+i, numCol: numCols,  spacing: spacings[i], y: rowY, cols: [] };
    for(var j=0; j<numColumns[i]; j++) {
      var name = 'SS['+(i+1)+']['+(j+1)+']';
      config.neurons.push({ template: 'N.Test.PiConnectionTest.SpinyStellate', name: name });
      rowDisplay.cols.push({ name: name });
    }
    config.display.rows.push(rowDisplay);
    rowY += vertSpacing;
  }

  console.log(JSON.stringify(config, undefined, 2));

  var network = new N.Network();
  network.addTemplates({ 'N.Test.PiConnectionTest.SpinyStellate' : N.Test.PiConnectionTest.SpinyStellate });
  network.loadFrom(config);

  var scene = new N.UI.NetworkScene();
  scene.layout(network, renderMappings);
  return scene;
}

N.Test.PiConnectionTest.prototype.showNextRoute = function() {

  this.routeManager = new N.UI.PiRouteManager(this.scene.network);
  this.routeManager.addConnections(this.toConnectionStubs(this.connectionSetArrays[this.nextConnectionSetIndex]));
  this.routeManager.render();

  this.nextConnectionSetIndex++;
  if(this.nextConnectionSetIndex === this.connectionSetArrays.length) {
    this.nextConnectionSetIndex = 0;
  }
}

N.Test.PiConnectionTest.next = -1;
N.Test.PiConnectionTest.categories = [ 'Excitatory', 'Inhibitory', 'Spine', 'GapJunction', 'Electrode' ];

N.Test.PiConnectionTest.prototype.toConnectionStubs = function(pathArray) {
  var stubs = _.map(pathArray, function(path) {
    N.Test.PiConnectionTest.next = (N.Test.PiConnectionTest.next === 4 ? 0 : N.Test.PiConnectionTest.next + 1);
    return { getPath: function() { return path; }, category: N.Test.PiConnectionTest.categories[N.Test.PiConnectionTest.next] };
  });
  return stubs;
}

N.Test.PiConnectionTest.SpinyStellate = {
  classname: 'N.Neuron',
  name: 'SS',
  compartments: [{
    classname: 'N.Comp.Output',
    name: 'OP'
  },{
    classname: 'N.Comp.LinearSummingInput',
    name: 'IP'
  },{
    classname: 'N.Comp.AcetylcholineInput',
    name: 'AIP'
  }],
  display: {
    template: 'N.UI.StandardNeuronTemplates.Stellate',
    radius: 0.8,
    compartmentMap: { 'Dendrites': 'IP', 'Acetylcholine Receptors': 'AIP', 'Body': 'OP'  }
  }
}
