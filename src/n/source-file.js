/**********************************************************************

File     : source-file.js
Project  : N Simulator Library
Purpose  : Source file for source file object.
Revisions: Original definition by Lawrence Gunn.
           2015/03/24

Copyright (c) 2015 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

/**
 * A connection object. This object is essentially a shell around N.Compartment objects.
 * @class SourceFile
 * @constructor
 */
N.SourceFile = function() {
  this.type = 'source-file';
  this.text = '';
  this.dirty = false;
  this.path = '';
  this.guid = 'guid'+N.generateUUID();
};

/**
 * Sets the text. The dirty flag is set to false. See updateText for changes that set the dirty state to true.
 * @method setText
 */
N.SourceFile.prototype.setText = function(text) {
  this.text = text;
  this.dirty = false;
};

/**
 * Sets the text. The dirty flag is set to false. See updateText for changes that set the dirty state to true.
 * @method setText
 */
N.SourceFile.prototype.updateText = function(text) {
  this.text = text;
  this.dirty = true;
};

/**
 * Sets the path.
 * @method setPath
 * @param path
 */
N.SourceFile.prototype.setPath = function(path) {
  this.path = path;
  this.displayName = this.path.split('/').pop();
};

/**
 * Returns the text.
 * @method getText
 * @returns {string}
 */
N.SourceFile.prototype.getText = function() {
  return this.text;
};

/**
 * Sets the dirty state of the text.
 * @method setDirty
 */
N.SourceFile.prototype.setDirty = function(isDirty) {
  this.dirty = isDirty;
};

/**
 * Get a property
 * @method extractProperty
 * @param key
 * @returns {string}
 */
N.SourceFile.prototype.extractProperty = function(key) {
  var regex = new RegExp('\\#\\s'+key);
  var next = 0;
  var property;
  var text = this.text;

  var indexOf;
  while((indexOf = text.search(regex)) !== -1) {
    var front = text.indexOf(':', text.indexOf(key, indexOf));
    var end = text.indexOf('\n', indexOf+1);
    if(property === undefined) {
      property = $.trim(text.substring(front + 1, end));
    } else {
      property += ' '+$.trim(text.substring(front + 1, end));
    }
    text = text.substr(end);
  }
  return property;
};


