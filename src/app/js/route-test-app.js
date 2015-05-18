'use strict';


// Declare app level module which depends on filters, and services
angular.module('n-sim', ['n-sim.filters', 'n-sim.services', 'n-sim.directives', 'n-sim.controllers']).
  config(['$routeProvider', function($routeProvider) {
    alert("HI");
    $routeProvider.when('/signal-canvas-test', {templateUrl: 'partials/waveform-editor.html', controller: 'WaveformEditorController'});
    $routeProvider.when('/signal-graph-test', {templateUrl: 'partials/signal-canvas-test.html', controller: 'MyCtrl2'});
    $routeProvider.otherwise({redirectTo: '/view1'});
  }]);
