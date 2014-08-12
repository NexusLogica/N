'use strict';


// Declare app level module which depends on filters, and services
angular.module('nSimApp', ['nSimApp.filters', 'nSimApp.services', 'nSimApp.directives', 'nSimApp.controllers', 'ngRoute']).
  config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider.when('/workbench', { templateUrl: 'partials/workbench.html' });
    $routeProvider.when('/administration', {templateUrl: 'partials/adminstration.html' });
    $routeProvider.when('/n', {templateUrl: 'partials/n.html' });
    $routeProvider.otherwise({redirectTo: '/n'});

    // use the HTML5 History API
    $locationProvider.html5Mode(true);
   }]);

angular.module('nSimApp.controllers', []);
angular.module('nSimApp.directives',  []);

