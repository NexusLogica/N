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
N.Http = N.Http || {};

  //**********
  //* N.Http *
  //**********

/**
 * Perform an HTTP GET.
 * @method get
 * @returns { Promise }
 */
N.Http.get = function(url, data) {
  return N.Http.call('GET', url, data);
}

/**
 * Perform an HTTP PUT.
 * @method put
 * @returns { Promise }
 */
N.Http.put = function(url, data) {
  return N.Http.call('PUT', url, data);
};

/**
 * Perform an HTTP DELETE.
 * @method delete
 * @returns { Promise }
 */
N.Http.delete = function(url, data) {
  return N.Http.call('DELETE', url, data);
};

/**
 * Returns the minimum and maximum values in the signal.
 * @method GetRange
 * @returns {{Min: Real, Max: Real}}
 */
N.Http.call = function(type, url, data) {
  var ajaxData = {
    method: type,
    dataType: 'json',
    crossDomain: true
  };

  if(data) {
    ajaxData.data        = JSON.stringify(data);
    ajaxData.contentType = 'application/json; charset=utf-8';
  }

  var deferred = Q.defer();
  $.ajax(url, ajaxData).then(
    function(data, textStatus, jqXHR) {
      deferred.resolve(data, textStatus);
    },
    function(jqXHR, textStatus, httpStatusCodeDescription) {
      deferred.reject( { textStatus: textStatus, httpStatus: jqXHR.status, responseJSON: jqXHR.responseJSON, httpStatusCodeDescription: httpStatusCodeDescription } );
    }
  );

  return deferred.promise;
};
