'use strict';


// Declare app level module which depends on filters, and services
angular.module('nSimulationApp', ['ngRoute', 'ui.bootstrap.modal', 'LocalStorageModule', 'ngSanitize']).
  config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider.when('/fieldview', { templateUrl: 'src/pages/field-viewer/field-viewer.html' });
//    $routeProvider.when('/pi-workbench', { templateUrl: 'src/partials/pi-workbench.html' });
    $routeProvider.when('/builder', { templateUrl: 'src/pages/network-builder-page/network-builder-page.html' });
    $routeProvider.when('/viewer', { templateUrl: 'src/pages/pi-viewer-page/pi-viewer-page.html' });
    $routeProvider.when('/runner', { templateUrl: 'src/pages/sim/sim.html' });
    $routeProvider.when('/administration', { templateUrl: 'src/pages/administration/administration.html' });
    $routeProvider.otherwise({redirectTo: '/builder'});

    // use the HTML5 History API
    $locationProvider.html5Mode(true);

    Q.longStackSupport = true;
   }]);
