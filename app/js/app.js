'use strict';


// Declare app level module which depends on filters, and services
angular.module('nSimApp', ['nSimApp.filters', 'nSimApp.services', 'nSimApp.directives', 'nSimApp.controllers', 'ngRoute']).
  config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/simulation', {templateUrl: 'partials/simulation.html', controller: 'SimulationCtrl'});
    $routeProvider.when('/signal-trace', {templateUrl: 'partials/signal-trace.html', controller: 'SignalTraceCtrl'});
    $routeProvider.otherwise({redirectTo: '/simulation'});
  }]);

angular.module('nSimApp.controllers', []);

