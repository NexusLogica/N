'use strict';

/* Controllers */

angular.module('myApp.controllers', []).
  controller('MyCtrl1', [function() {

  }])
  .controller('MyCtrl2', [function() {

  }]);

function HeaderController($scope) {
  $scope.blah = "Hi there";
}

function TimingEditorController($scope) {
    var x = new WaveDrom();
    var src =
      { "signal" : [
        { "name": "clk",  "wave": "p......" },
        { "name": "bus",  "wave": "x.==.=x",   "data": ["head", "body", "tail"] },
        { "name": "wire", "wave": "0.1..0." },
      ]};

    x.RenderWaveForm(0, src);
}