/**********************************************************************

File     : http.js
Project  : N Simulator Library
Purpose  : Source file http helper functions.
Revisions: Original definition by Lawrence Gunn.
           2014/08/12

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

/**
 * This is the N simulator.
 * @module N
 */
var N = N || {};

  //**********
  //* N.Http *
  //**********

/**
 * The main database class.
 * @class N.Http
 * @constructor
 * @param {String} name
 * @param {String} shortName
 */

N.Http = function() {
  this.ClassName  = 'N.Http';
}

/**
 * Returns the minimum and maximum values in the signal.
 * @method GetRange
 * @returns {{Min: Real, Max: Real}}
 */
N.Http.prototype.get = function(url, data) {
  var ajaxData = {
    type: 'GET',
    url: url,
    dataType: 'json'
  };

  if(data) {
    ajaxData.data = data;
  }

  var deferred = Q.defer();
  $.ajax(ajaxData).then(
    function(data, textStatus, jqXHR) {
      deferred.resolve(data);
    },
    function(jqXHR, textStatus, errorThrown) {
      deferred.reject(textStatus);
    }
  );

  return deferred.promise;
}
