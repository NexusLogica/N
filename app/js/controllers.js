'use strict';

/* Controllers */

angular.module('myApp.controllers', []);

function HeaderController($scope, $compile) {
  $scope.blah = "Hi there";
  
  $scope.waveformsNew = function() {
    var html = $compile('<div id="editor-1" class="container" ng-include onload="renderWave(\'editor-1\')" src="\'partials/waveform-editor.html\'"  ng-controller="WaveformEditorController"></div>')($scope);
    $("#main-app-container").html(html);
  }

  $scope.waveformsSearch = function() {
    var html = $compile('<div id="search-1" class="container" ng-include onload="loadWaveforms()" src="\'partials/waveform-search.html\'"  ng-controller="WaveformSearchController"></div>')($scope);
    $("#main-app-container").html(html);
  }
}

//***************************************************
// WaveformEditorController
//
function WaveformEditorController(guidGenerator, postNewWaveform,	 $scope) {
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
    postNewWaveform.doPost(id, name, waveJson).then(function(d) {
      consol.log("Result returned");
    });
    return false;
  }
}

//***************************************************
// WaveformSearchController
//
function WaveformSearchController(getWaveforms,	 $scope) {
  $scope.loadWaveforms = function() {
    getWaveforms.doGet().then(function(d) {
      // Take the string date from the server, specify it as UTC, and create a Date
      // object that Angular can work with.
      d.forEach(function(entry) {
        var nd = new Date((entry.modification_date + " UTC").replace(/-/g, "/"));
        entry.date_object = nd;
      });
      $scope.waveformList = d;
    });
  }
}