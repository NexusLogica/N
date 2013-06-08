'use strict';

/* Controllers */

angular.module('myApp.controllers', []);

function HeaderController($scope) {
  $scope.blah = "Hi there";
}

function TimingEditorController(guidGenerator, postNewWaveform,	 $scope) {
  $scope.renderWave = function(id) {
    $scope.id = id;
    $scope.waveText = "p.";
    $scope.makeWave($scope.waveText);

    $scope.waveViewContainer = $('#'+id+' .wave-container')[0];

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
  
  $scope.save = function() {
    var sel = "#"+$scope.id+" .";
    var id = guidGenerator.CreateUUID();
    var name = $(sel+"wave-name-input").val();
    var waveJson = angular.toJson($scope.waveJson, false); // No pretty printing...
    postNewWaveform.doPost(id, name, waveJson, function() {});
  }
}