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
  this.X = 0;
  this.Y = 0;
  this.DrawBorder = true;
}

N.UI.PiGrid.prototype.Layout = function(renderMappings) {

  this.UnscaledWidth = this.Cols-1;
  this.UnscaledHeight = this.Rows-1;
  return this;
}

N.UI.PiGrid.prototype.Render = function(svgParent, scale) {

  this.Group = svgParent.group();
  this.Group.translate(this.X, this.Y);

  var classNameFull = 'pi-grid';
  if(this.hasOwnProperty('ClassName')) { classNameFull += ' '+this.ClassName; }
  this.Group.attr({ class: classNameFull });

  this.Scale = scale;

  // If no
  if(!this.ParentNetwork) {
    this.ScaledWidth = this.Scale*(_.isUndefined(this.Width) ? this.UnscaledWidth : this.Width);
  }
  this.ScaledHeight = this.Scale*(_.isUndefined(this.Height) ? this.UnscaledHeight : this.Height);

  this.Rect = { Left: 0, Top: 0, Right: this.ScaledWidth, Bottom: this.ScaledHeight };

  if(this.DrawBorder) {
    this.OuterRect = this.Group.rect(this.ScaledWidth, this.ScaledHeight)
      .radius(2)
      .move(this.Rect.Left, this.Rect.Top)
      .attr({ class: 'single'});
  }

  this.GridPoints = {};

  var r = 1;
  var d = r*2;
  var spacing = this.Scale;
  var y = 0;
  var x;
  for(var i=0; i<this.Rows; i++) {
    x = 0;
    for(var j=0; j<this.Cols; j++) {
      this.Group.circle(d).move(x-r, y-r).attr( { 'class': 'grid-dot' });
      x += spacing;
    }
    y += spacing;
  }

  for(i in this.Circles) {
    var c = this.Circles[i];
    var radius = c.R;
    var circle = this.Group.circle(2*radius*this.Scale).move((c.X-radius)*this.Scale, (c.Y-radius)*this.Scale).attr({ class: 'grid-circle' });
    var size = Math.ceil(2.3*(radius));
    if((size % 2) !== 0) { size++; }
    var halfSize = size/2;
    this.Blocks.push({ X: c.X-halfSize, Y: c.Y-halfSize, W: size, H: size });
    c.BoxSize = size;
  }

  for(i in this.Blocks) {
    var b = this.Blocks[i];
    x = b.X*this.Scale;
    y = b.Y*this.Scale;
    var w = b.W*this.Scale;
    var h = b.H*this.Scale;
    var path = 'M'+x+' '+y+'l'+w+' 0l0 '+h+'l-'+w+' 0z';
    this.Group.path(path).attr({ 'class': 'block-edge' });

    var yNeg = ','+b.Y;
    var yPos = ','+(b.Y+b.H);
    for(var k=0; k<=b.W; k++) {
      x = b.X+k;
      this.GridPoints[x+yNeg] = { Blocked: true };
      this.GridPoints[x+yPos] = { Blocked: true };
    }

    var xNeg = b.X+',';
    var xPos = (b.X+b.W)+',';
    for(k=1; k<b.H; k++) {
      y = b.Y+k;
      this.GridPoints[xNeg+y] = { Blocked: true };
      this.GridPoints[xPos+y] = { Blocked: true };
    }
  }
  console.log('*** '+JSON.stringify(this.GridPoints, undefined, 2));
}

N.UI.PiGrid.prototype.RenderBackground = function(className, padding) {
  this.OuterRect = this.Group.rect(this.Rect.Right-this.Rect.Left-padding[3]-padding[1], this.Rect.Bottom-this.Rect.Top-padding[2]-padding[0])
    .move(this.Rect.Left+padding[3], this.Rect.Top+padding[0])
    .back()
    .attr({ class: className});
}

N.UI.PiGrid.prototype.PointIsBlocked = function(i, j) {
  var gp = this.GridPoints[i+','+j];
  if(gp && gp.Blocked) {
    return true;
  }
  return false;
}

N.UI.PiGrid.prototype.CreatePath = function(start, end) {
  var points = [ [ start.X*this.Scale, start.Y*this.Scale ]];
  var x = start.X;
  var y = start.Y;
//  var eX = end.X;
//  var eY = end.Y;
//  if(this.PointIsBlocked(eX, eY)) {
//    return null;
//  }

  var endInfo = this.GetEnd(start, end);
  var endX = endInfo.X;
  var endY = endInfo.Y;

  var offsets = [ [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1] ];
  var opposites = [ 4, 5, 6, 7, 0, 1, 2, 3 ];
  var vectors = [];
  for(var i in offsets) {
    vectors.push((new N.UI.Vector(offsets[i][0], offsets[i][1])).Normalize());
  }


  var num = 0;
  var previousIndex = -1;
  do {
    num++;
    if(num > 40) { break; }
    var maxCos = -Number.MAX_VALUE;
    var index = -1;
    var vec = (new N.UI.Vector(endX-x, endY-y)).Normalize();
    for(var j=0; j<8; j++) {
      if((x+offsets[j][0]) === endX && y+offsets[j][1] === endY) {
        points.push([ endX*this.Scale, endY*this.Scale ]);
        return points;
      }
      if(this.AllowedNext(previousIndex, j)) {
        if(!this.PointIsBlocked(x+offsets[j][0], y+offsets[j][1])) {
          var cos = vectors[j].DotProduct(vec);
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
    points.push([ x*this.Scale, y*this.Scale ]);
  } while(x !== end.X || y !== end.Y);

  return points;
}

N.UI.PiGrid.prototype.GetEnd = function(start, end) {
  var c = this.Circles[end.Target];
  if(!c.Points) { this.BuildCircleData(c); }

  var iStart, iEnd, point;
  for(var i in c.Points) {
    point = c.Points[i];
    if(point[2] >=  end.StartAngle) {
      iStart = parseInt(i, 10);
      break;
    }
  }
  for(i=iStart+1; i<c.Points.length; i++) {
    point = c.Points[i];
    if(point[2] > end.EndAngle) {
      iEnd = parseInt(i, 10);
      break;
    }
  }

  return { X: c.Points[iStart][0], Y: c.Points[iStart][1] };
}

N.UI.PiGrid.prototype.BuildCircleData = function(c) {
  var w = c.BoxSize;
  var num = 4*(w-1);
  var points = [];
  var first = Math.ceil(w/2)+1;
  var fifth = w-first+1;
  var half = Math.floor(w/2);
  for(var i=0; i<first; i++) { points.push([c.X+half, c.Y+i]);        }
  for(i=0; i<(w-1); i++)     { points.push([c.X+half-i-1, c.Y+half]); }
  for(i=0; i<w+1; i++)       { points.push([c.X-half, c.Y+half-i]);   }
  for(i=0; i<w-1; i++)       { points.push([c.X-half+i+1, c.Y-half]); }
  for(i=0; i<fifth; i++)     { points.push([c.X+half, c.Y-half+i]);   }
  _.forEach(points, function(point) {
    point.push(N.Deg(Math.atan2(point[1]-c.Y, point[0]- c.X)));
    if(point[2] < 0) { point[2] = 360+point[2]; }
  });
  c.Points = points;
  console.log('******'+JSON.stringify(points, undefined, 2));
}

N.UI.PiGrid.prototype.AllowedNext = function(lastIndex, thisIndex) {
  if(lastIndex < 0) { return true; }
  if(lastIndex-3 === thisIndex || lastIndex+5 === thisIndex) { return false; }
  if(lastIndex-4 === thisIndex || lastIndex+4 === thisIndex) { return false; }
  if(lastIndex-5 === thisIndex || lastIndex+3 === thisIndex) { return false; }
  return true;
}

N.UI.PiGrid.prototype.CreateStringPath = function(start, end) {
  var points = this.CreatePath(start, end);
  if(points) {
    var path = 'M'+points[0][0]+' '+points[0][1];
    for(var i=1; i<points.length; i++) {
      path += 'L'+points[i][0]+' '+points[i][1]
    }
    return path;
  }
  return '';
}

N.UI.PiGrid.prototype.LoadFrom = function(json) {
  for(var i in json) {
    this[i] = json[i];
  }

  return this;
}
