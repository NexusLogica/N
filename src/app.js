'use strict';


// Declare app level module which depends on filters, and services
angular.module('nSimulationApp', ['ngRoute', 'ui.bootstrap.modal']).
  config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider.when('/fieldview', { templateUrl: 'src/pages/field-viewer/field-viewer.html' });
    $routeProvider.when('/workbench', { templateUrl: 'src/partials/workbench.html' });
    $routeProvider.when('/sim', { templateUrl: 'src/pages/sim/sim.html' });
    $routeProvider.when('/administration', { templateUrl: 'src/pages/administration/administration.html' });
    $routeProvider.otherwise({redirectTo: '/sim'});

    // use the HTML5 History API
    $locationProvider.html5Mode(true);

    Q.longStackSupport = true;
   }]);
