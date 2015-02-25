'use strict';


// Declare app level module which depends on filters, and services
angular.module('nSimulationApp', ['ngRoute', 'ui.bootstrap.modal', 'LocalStorageModule']).
  config(['$routeProvider', '$locationProvider', 'LocalStorageModule', function($routeProvider, $locationProvider, LocalStorageModule) {
    $routeProvider.when('/fieldview', { templateUrl: 'src/pages/field-viewer/field-viewer.html' });
    $routeProvider.when('/workbench', { templateUrl: 'src/partials/workbench.html' });
    $routeProvider.when('/sim', { templateUrl: 'src/pages/sim/sim.html' });
    $routeProvider.when('/administration', { templateUrl: 'src/pages/administration/administration.html' });
    $routeProvider.otherwise({redirectTo: '/n'});

    // use the HTML5 History API
    $locationProvider.html5Mode(true);

    Q.longStackSupport = true;
   }]);
