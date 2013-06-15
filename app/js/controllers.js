'use strict';

/* Controllers */

angular.module('myApp.controllers', []);

//***************************************************
// HeaderController
//
function HeaderController($scope, $compile) {
  $scope.blah = "Hi there";
  
  $scope.waveformsNew = function() {
    var html = $compile('<div class="container" ng-include onload="renderWave()" src="\'partials/waveform-editor.html\'"  ng-controller="WaveformEditorController"></div>')($scope);
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
function WaveformEditorController(guidGenerator, postNewWaveform,	$scope, $element) {
  $scope.renderWave = function() {
    $scope.waveText = "p.";
    $scope.makeWave($scope.waveText);

    $scope.waveViewContainer = $($element).find(".wave-container")[0];

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
    var id = guidGenerator.CreateUUID();
    var name = $($element).find(".wave-name-input").val();
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
function WaveformSearchController(getWaveforms,	 $scope , $element, $compile) {
  $scope.highlightedScope = null;

  $scope.loadWaveforms = function() {
    $(".item-with-tooltip").tooltip();
    $scope.refresh();
  }

  $scope.childClicked = function(childScope, id) {
    if($scope.highlightedScope) {
      $scope.highlightedScope.dehighlight();
    }
    $scope.highlightedScope = childScope;

    $scope.viewWaveform(id);
  }

  $scope.refresh = function() {
    getWaveforms.doGet().then(function(d) {
      if(d && d.status == "success") {
        var data = d.result;
        data.forEach(function(entry) {
          // Take the string date from the server, specify it as UTC, and create a Date
          // object that Angular can work with.
          var nd = new Date((entry.modification_date + " UTC").replace(/-/g, "/"));
          entry.date_object = nd;
        });
        $scope.waveformList = data;
      }
      else {
        $scope.errorMessage = ( (d && d.errorMsg && d.errorMsg.length > 0) ? d.errorMsg : "We were unable to connect to the server.");
        $($element).find(".n-alert").center();
        $($element).find(".n-alert").fadeIn(500);

      }
    });
  }

  $scope.viewWaveform = function(id) {
    if($($element).find(".waveform-viewer").length != 0) {
      $($element).find(".waveform-viewer").remove();
    }
    var container = $($element).find(".waveform-viewer-container");
    var html = $compile('<div class="container waveform-viewer" ng-include onload="downloadWaveform(\''+id+'\')" src="\'partials/waveform-viewer.html\'"  ng-controller="WaveformViewerController"></div>')($scope);
    container.html(html);
  }

  $scope.onWaveformDeleted = function() {
    $($element).find(".waveform-viewer").remove();
    $scope.refresh();
  }
}

//***************************************************
// WaveformSearchItemController
//
function WaveformSearchItemController($scope , $element) {
  $scope.itemClick = function(obj) {
    $scope.$parent.childClicked($scope, $($element).find(".wave-list-id").attr("waveform-id"));
    $scope.highlighted = !$scope.highlighted;
  }
  $scope.dehighlight = function() {
    $scope.highlighted = !$scope.highlighted;
  }
}

//***************************************************
// WaveformViewerController
//
function WaveformViewerController(getWaveform, deleteWaveform, $scope , $element) {
  $scope.downloadWaveform = function(id) {
    $scope.id = id;
    getWaveform.doGet(id).then(function(d) {
      if(d && d.status == "success") {
        var data = d.result;
        $scope.waveformName = data.name;
        $scope.waveformDate = data.modification_date;
        $scope.waveformID = data.id;
      }
      else {
        $scope.errorMessge = (d ? d.errorMsg : "I was unable to connect to the server");
        $($element).find(".n-alert").center();
        $($element).find(".n-alert").fadeIn(500);

      }
    });
  }

  $scope.deleteWaveform = function() {
    deleteWaveform.doDelete($scope.id).then(
      function(d) {
        if(d && d.status == "success") {
          $scope.$parent.onWaveformDeleted();
        }
        else {
          $scope.errorMessge = (d ? d.errorMsg : "I was unable to connect to the server");
          $($element).find(".n-alert").center();
          $($element).find(".n-alert").fadeIn(500);
        }
      },
      function(d) {
        alert("ERROR");
      }
    );
  }
}
