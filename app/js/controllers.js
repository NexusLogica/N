'use strict';

/* Controllers */

angular.module('myApp.controllers', []);

function HeaderController($scope) {
  $scope.blah = "Hi there";
}

function TimingEditorController($scope) {
  $scope.renderWave = function(id) {
    $scope.waveText = "p.";
    $scope.makeWave($scope.waveText);

    var parent = document.getElementById(id);
    $scope.waveViewContainer = parent.getElementsByClassName("wave-container")[0];

    $scope.waveDromView = new WaveDrom();
    $scope.waveDromView.RenderWaveForm($scope.waveViewContainer, $scope.waveJson);
  }

  $scope.change = function() {
    this.makeWave(this.waveText);
    this.waveDromView.RenderWaveForm($scope.waveViewContainer, $scope.waveJson);
  }

  $scope.makeWave = function(wave) {
    if(!this.waveJson) {
      $scope.waveJson = { "signal" : [
          { "name": "clock", "wave": "p......" },
          { "name": "signal", "wave": "p." }
      ]};
    }
    $scope.waveJson.signal[1].wave = wave;
  }
}