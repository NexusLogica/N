/**********************************************************************

File     : pi-network.js
Project  : N Simulator Library
Purpose  : Source file for manufacturing, rendering, and controlling Pi representations of neurons.
Revisions: Original definition by Lawrence Gunn.
           2014/02/23

Copyright (c) 2014 by Lawrence Gunn
All Rights Reserved.

*/
'use strict';

var N = N || {};
N.UI = N.UI || {};

  //***************
  //* N.UI.PiGrid *
  //***************

N.UI.PiGrid = function() {
  this.x = 0;
  this.y = 0;
  this.drawBorder = true;
}

N.UI.PiGrid.prototype.layout = function(renderMappings) {

  this.unscale.width = this.cols-1;
  this.unscale.height = this.rows-1;
  return this;
}

N.UI.PiGrid.prototype.render = function(svgParent, scale) {

  this.group = svgParent.group();
  this.group.translate(this.x, this.y);

  var classNameFull = 'pi-grid';
  if(this.hasOwnProperty('ClassName')) { classNameFull += ' '+this.ClassName; }
  this.group.attr({ class: classNameFull });

  this.scale = scale;

  // If no
  if(!this.parentNetwork) {
    this.scale.width = this.scale*(_.isUndefined(this.width) ? this.unscale.width : this.width);
  }
  this.scale.height = this.scale*(_.isUndefined(this.height) ? this.unscale.height : this.height);

  this.rect = { left: 0, top: 0, right: this.scale.width, bottom: this.scale.height };

  if(this.drawBorder) {
    this.outerRect = this.group.rect(this.scale.width, this.scale.height)
      .radius(2)
      .move(this.rect.left, this.rect.top)
      .attr({ class: 'single'});
  }

  this.gridPoints = {};

  var r = 1;
  var d = r*2;
  var spacing = this.scale;
  var y = 0;
  var x;
  for(var i=0; i<this.rows; i++) {
    x = 0;
    for(var j=0; j<this.cols; j++) {
      this.group.circle(d).move(x-r, y-r).attr( { 'class': 'grid-dot' });
      x += spacing;
    }
    y += spacing;
  }

  for(i in this.circles) {
    var c = this.circles[i];
    var radius = c.r;
    var circle = this.group.circle(2*radius*this.scale).move((c.x-radius)*this.scale, (c.y-radius)*this.scale).attr({ class: 'grid-circle' });
    var size = Math.ceil(2.3*(radius));
    if((size % 2) !== 0) { size++; }
    var halfSize = size/2;
    this.blocks.push({ X: c.x-halfSize, Y: c.y-halfSize, W: size, H: size });
    c.boxSize = size;
  }

  for(i in this.blocks) {
    var b = this.blocks[i];
    x = b.x*this.scale;
    y = b.y*this.scale;
    var w = b.w*this.scale;
    var h = b.h*this.scale;
    var path = 'M'+x+' '+y+'l'+w+' 0l0 '+h+'l-'+w+' 0z';
    this.group.path(path).attr({ 'class': 'block-edge' });

    var yNeg = ','+b.y;
    var yPos = ','+(b.y+b.h);
    for(var k=0; k<=b.w; k++) {
      x = b.x+k;
      this.gridPoints[x+yNeg] = { blocked: true };
      this.gridPoints[x+yPos] = { blocked: true };
    }

    var xNeg = b.x+',';
    var xPos = (b.x+b.w)+',';
    for(k=1; k<b.h; k++) {
      y = b.y+k;
      this.gridPoints[xNeg+y] = { blocked: true };
      this.gridPoints[xPos+y] = { blocked: true };
    }
  }
  console.log('*** '+JSON.stringify(this.gridPoints, undefined, 2));
}

N.UI.PiGrid.prototype.renderBackground = function(className, padding) {
  this.outerRect = this.group.rect(this.rect.right-this.rect.left-padding[3]-padding[1], this.rect.bottom-this.rect.top-padding[2]-padding[0])
    .move(this.rect.left+padding[3], this.rect.top+padding[0])
    .back()
    .attr({ class: className});
}

N.UI.PiGrid.prototype.pointIsBlocked = function(i, j) {
  var gp = this.gridPoints[i+','+j];
  if(gp && gp.blocked) {
    return true;
  }
  return false;
}

N.UI.PiGrid.prototype.createPath = function(start, end) {
  var points = [ [ start.x*this.scale, start.y*this.scale ]];
  var x = start.x;
  var y = start.y;
//  var eX = end.x;
//  var eY = end.y;
//  if(this.pointIsBlocked(eX, eY)) {
//    return null;
//  }

  var endInfo = this.getEnd(start, end);
  var endX = endInfo.x;
  var endY = endInfo.y;

  var offsets = [ [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1] ];
  var opposites = [ 4, 5, 6, 7, 0, 1, 2, 3 ];
  var vectors = [];
  for(var i in offsets) {
    vectors.push((new N.UI.Vector(offsets[i][0], offsets[i][1])).normalize());
  }


  var num = 0;
  var previousIndex = -1;
  do {
    num++;
    if(num > 40) { break; }
    var maxCos = -Number.MAX_VALUE;
    var index = -1;
    var vec = (new N.UI.Vector(endX-x, endY-y)).normalize();
    for(var j=0; j<8; j++) {
      if((x+offsets[j][0]) === endX && y+offsets[j][1] === endY) {
        points.push([ endX*this.scale, endY*this.scale ]);
        return points;
      }
      if(this.allowedNext(previousIndex, j)) {
        if(!this.pointIsBlocked(x+offsets[j][0], y+offsets[j][1])) {
          var cos = vectors[j].dotProduct(vec);
          if(cos > maxCos) {
            maxCos = cos;
            index = j;
          }
        }
      }
    }
    x += offsets[index][0];
    y += offsets[index][1];
    previousIndex = index;
    points.push([ x*this.scale, y*this.scale ]);
  } while(x !== end.x || y !== end.y);

  return points;
}

N.UI.PiGrid.prototype.getEnd = function(start, end) {
  var c = this.circles[end.target];
  if(!c.points) { this.buildCircleData(c); }

  var iStart, iEnd, point;
  for(var i in c.points) {
    point = c.points[i];
    if(point[2] >=  end.startAngle) {
      iStart = parseInt(i, 10);
      break;
    }
  }
  for(i=iStart+1; i<c.points.length; i++) {
    point = c.points[i];
    if(point[2] > end.endAngle) {
      iEnd = parseInt(i, 10);
      break;
    }
  }

  return { X: c.points[iStart][0], Y: c.points[iStart][1] };
}

N.UI.PiGrid.prototype.buildCircleData = function(c) {
  var w = c.boxSize;
  var num = 4*(w-1);
  var points = [];
  var first = Math.ceil(w/2)+1;
  var fifth = w-first+1;
  var half = Math.floor(w/2);
  for(var i=0; i<first; i++) { points.push([c.x+half, c.y+i]);        }
  for(i=0; i<(w-1); i++)     { points.push([c.x+half-i-1, c.y+half]); }
  for(i=0; i<w+1; i++)       { points.push([c.x-half, c.y+half-i]);   }
  for(i=0; i<w-1; i++)       { points.push([c.x-half+i+1, c.y-half]); }
  for(i=0; i<fifth; i++)     { points.push([c.x+half, c.y-half+i]);   }
  _.forEach(points, function(point) {
    point.push(N.deg(Math.atan2(point[1]-c.y, point[0]- c.x)));
    if(point[2] < 0) { point[2] = 360+point[2]; }
  });
  c.points = points;
  console.log('******'+JSON.stringify(points, undefined, 2));
}

N.UI.PiGrid.prototype.allowedNext = function(lastIndex, thisIndex) {
  if(lastIndex < 0) { return true; }
  if(lastIndex-3 === thisIndex || lastIndex+5 === thisIndex) { return false; }
  if(lastIndex-4 === thisIndex || lastIndex+4 === thisIndex) { return false; }
  if(lastIndex-5 === thisIndex || lastIndex+3 === thisIndex) { return false; }
  return true;
}

N.UI.PiGrid.prototype.createStringPath = function(start, end) {
  var points = this.createPath(start, end);
  if(points) {
    var path = 'M'+points[0][0]+' '+points[0][1];
    for(var i=1; i<points.length; i++) {
      path += 'L'+points[i][0]+' '+points[i][1]
    }
    return path;
  }
  return '';
}

N.UI.PiGrid.prototype.loadFrom = function(json) {
  for(var i in json) {
    this[i] = json[i];
  }

  return this;
}
