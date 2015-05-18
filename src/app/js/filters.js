'use strict';

/* Filters */

var nSimAppFilters = angular.module('nSimApp.filters', []);

nSimAppFilters.filter('interpolate', ['version', function(version) {
    return function(text) {
      return String(text).replace(/\%VERSION\%/mg, version);
    }
  }]);
