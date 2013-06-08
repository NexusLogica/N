'use strict';

/* Controllers */

angular.module('myApp.controllers', []);

function HeaderController($scope, $compile) {
  $scope.blah = "Hi there";
  
  $scope.waveformsNew = function() {
    var html = $compile('<div id="editor-1" class="container" ng-include onload="renderWave(\'editor-1\')" src="\'partials/timing-editor.html\'"  ng-controller="TimingEditorController">HI</div>')($scope);
    $("#main-app-container").html(html);
  }

  $scope.waveformsSearch = function() {
    var html = $compile('<div id="search-1" class="container" ng-include onload="renderWave(\'search-1\')" src="\'partials/waveform-search.html\'"  ng-controller="WaveformSearchController">HI</div>')($scope);
    $("#main-app-container").html(html);
  }
}

//***************************************************
// TimingEditorController
//
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

//***************************************************
// WaveformSearchController
//
function WaveformSearchController(getWaveforms,	 $scope) {
  $scope.loadWaveforms = function() {
  }

  $scope.waveformList = [
    { name: "first" },
    { name: "second" },
    { name: "third" },
    { name: "fourth" },
    { name: "fifth" }
   ];
}