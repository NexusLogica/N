'use strict';


// Declare app level module which depends on filters, and services
angular.module('nSimApp', ['nSimApp.filters', 'nSimApp.services', 'nSimApp.directives', 'nSimApp.controllers', 'ngRoute', 'ui.bootstrap.modal', 'LocalStorageModule']).
  config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider.when('/workbench', { templateUrl: 'partials/workbench.html' });
    $routeProvider.when('/sim', { templateUrl: 'pages/sim/sim.html' });
    $routeProvider.when('/administration', { templateUrl: 'pages/administration/administration.html' });
    $routeProvider.when('/n', {templateUrl: 'partials/n.html' });
    $routeProvider.otherwise({redirectTo: '/n'});

    // use the HTML5 History API
    $locationProvider.html5Mode(true);

    Q.longStackSupport = true;
   }]);

var nSimAppControllers = angular.module('nSimApp.controllers', []);
var nSimAppDirectives  = angular.module('nSimApp.directives',  []);
var nSimAppServices    = angular.module('nSimApp.services',    []);
var nSimAppFilters     = angular.module('nSimApp.filters',     []);
