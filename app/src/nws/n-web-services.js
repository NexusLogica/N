/**********************************************************************

File     : n-web-services.js
Project  : N Simulator Library
Purpose  : Source file for the database access and control object.
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
N.NWS = N.NWS || {};

  //******************
  //* N.NWS.Database *
  //******************

/**
 * The main database class.
 * @class N.NWS.Database
 * @constructor
 * @param {String} name
 * @param {String} shortName
 */

N.NWS.Database = function() {
  this.ClassName  = 'N.NWS.Database';
}

/**
 * Returns the minimum and maximum values in the signal.
 * @method GetRange
 * @returns {{Min: Real, Max: Real}}
 */
N.NWS.Database.prototype.getDatabases = function(dbUrl) {

}

/**
 * Returns the minimum and maximum values in the signal.
 * @method canConnectToDB
 * @returns {{canAccess: Boolean, errMsg: String}}
 */
N.NWS.Database.prototype.canConnectToDB = function(dbUrl) {
  var deferred = Q.defer();

  var http =  new N.Http();
  http.get(dbUrl).then(
    function(data) {
      if(data.hasOwnProperty('couchdb')) {
        deferred.resolve( { canAccess: true, errMsg: '' } );
      } else {
        deferred.reject( { canAccess: false, errMsg: 'Url is reachable but is not a CouchDB' } );
      }
    },
    function(error) {
      deferred.reject( { canAccess: false, errMsg: error } );
    }
  );
  return deferred.promise;
}
