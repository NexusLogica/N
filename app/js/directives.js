'use strict';

/* Directives */

var nSimAppDirectives = angular.module('nSimApp.directives', []);

nSimAppDirectives.directive('appVersion', ['version', function(version) {
    return function(scope, element, attrs) {
      element.text(version);
    };
  }]);

nSimAppDirectives.directive('nCanvas', function() {
  function link($scope, $element, $attrs) {
    $scope.blah = "XXX"
    var paperParent = $($element).find("div");

    $scope.paper = Raphael(paperParent[0], paperParent.width(), paperParent.height());
    $scope.paper.text(20, 120, "Test").attr({ "font-size": 50, "text-anchor": "start", "font-family": "Arial" });
    var c = $scope.paper.rect(10, 10, 50, 50);
    if($attrs["nRenderer"]) {
      var renderer = $attrs["nRenderer"];
      console.log("Renderer = "+renderer);
    }

    $scope.showTrace = function(trace) {
      console.log("showing "+trace);
    }
  }

  return {
    restrict: 'AE',
    transclude: true,
    scope: { title:'@' },
    template: '<div class="n-signal-trace-canvas" signal-id="{{signal-id}}" ng-controller="SignalTraceController">' +
              '</div>',
    link: link
  };
});


