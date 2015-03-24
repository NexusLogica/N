/**********************************************************************

File     : sources.js
Project  : N Simulator Library
Purpose  : Source file for source file collection object.
Revisions: Original definition by Lawrence Gunn.
           2015/03/24

Copyright (c) 2015 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

/**
 * A connection object. This object is essentially a shell around N.Compartment objects.
 * @class Sources
 * @constructor
 */
N.Sources = function() {
  this.sourcesByPath = {}
};

/**
 * Adds the source object.
 * @method addSource
 * @param {N.SourceFile} sourceFileObj
 */
N.Sources.prototype.addSource = function(sourceFileObj) {
  this.sourcesByPath[sourceFileObj.path] = sourceFileObj;
};
