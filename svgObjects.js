// MIT License
//
// Copyright (c) 2018 Xavier Morin
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.


// Contains geometrical objects:
// point
// line
// polygon

Point = function(lam, phi) {
  // lambda and phi in degrees
  // conversion here
  this.lambda = lam; // * Math.PI / 180;
  this.phi = phi; // * Math.PI / 180;

  //current coordinates
  this.xCur = 0;
  this.yCur = 0;

  // target coordinates
  this.xTar = 0;
  this.yTar = 0;

  this.dx = 0;
  this.dy = 0;

  this.update = function(animated) {
    if (animated) {
      // spring effect
      let ka = 0.005;
      let ax = (this.xTar - this.xCur) * ka;
      let ay = (this.yTar - this.yCur) * ka;

      // integration
      this.dx += ax;
      this.dy += ay;

      // viscosity
      let kv = 0.9;
      this.dx *= kv;
      this.dy *= kv;

      // position
      this.xCur += this.dx;
      this.yCur += this.dy;
    } else {
      this.xCur = this.xTar;
      this.yCur = this.yTar;
      this.dx = 0;
      this.dy = 0;
    }
  }

  this.reProject = function(projection) {
    let newCoor = projection.proj(this.lambda, this.phi);
    this.xTar = newCoor[0];
    this.yTar = newCoor[1];
  }
}


Line = function(pointList, level) {
  this.domObj = null;
  this.points = null;
  this.level = level;

  this.init = function(pointList_) {
    var thiz = this;
    thiz.domObj = document.createElementNS(svgNS, 'polyline');
    thiz.domObj.setAttributeNS(null, "class", "lev" + level);

    // Load points
    thiz.points = [];
    for (let k = 0; k < pointList_.length; k++) {
      thiz.points.push(new Point(pointList_[k][0], pointList_[k][1]));
    }
  }

  this.update = function(animated) {
    var thiz = this;
    for (let i = 0; i < thiz.points.length; i += 1) {
      thiz.points[i].update(animated);
    }
  }

  this.draw = function() {
    var thiz = this;
    let list = "";
    for (let i = 0; i < thiz.points.length; i += 1) {
      list += `${thiz.points[i].xCur}, ${thiz.points[i].yCur} `;
    }
    thiz.domObj.setAttributeNS(null, "points", list);
  }

  this.reProject = function(projection) {
    var thiz = this;
    for (let i = 0; i < thiz.points.length; i += 1) {
      thiz.points[i].reProject(projection);
    }
  }

  this.init(pointList);
}


Polygon = function(pointList, level) {
  this.domObj = null;
  this.points = null;
  this.level = level;

  this.init = function(pointList_) {
    var thiz = this;
    thiz.domObj = document.createElementNS(svgNS, 'polygon');
    thiz.domObj.setAttributeNS(null, "class", "lev" + level);

    // Load points
    thiz.points = [];
    for (let k = 0; k < pointList_.length; k++) {
      thiz.points.push(new Point(pointList_[k][0], pointList_[k][1]));
    }
  }

  this.update = function(animated) {
    var thiz = this;
    for (let i = 0; i < thiz.points.length; i += 1) {
      thiz.points[i].update(animated);
    }
  }

  this.draw = function() {
    var thiz = this;
    let list = "";
    for (let i = 0; i < thiz.points.length; i += 1) {
      list += `${thiz.points[i].xCur}, ${thiz.points[i].yCur} `;
    }
    thiz.domObj.setAttributeNS(null, "points", list);
  }

  this.reProject = function(projection) {
    var thiz = this;
    for (let i = 0; i < thiz.points.length; i += 1) {
      thiz.points[i].reProject(projection);
    }
  }

  this.init(pointList, this.level);
}

Circle = function(coord, color = "yellow") {
  this.domObj = null;
  this.point = null;

  this.init = function(coord_, col) {
    var thiz = this;
    thiz.domObj = document.createElementNS(svgNS, 'circle');
    thiz.domObj.setAttributeNS(null, "r", "0.2");
    thiz.domObj.setAttributeNS(null, "fill", col);
    thiz.domObj.setAttributeNS(null, "stroke", 'black');
    thiz.domObj.setAttributeNS(null, "stroke-width", "0.01");

    thiz.point = new Point(coord_[0], coord_[1]);
  }

  this.update = function(animated) {
    var thiz = this;
    thiz.point.update(animated);
  }

  this.draw = function() {
    var thiz = this;
    thiz.domObj.setAttributeNS(null, "cx", thiz.point.xCur);
    thiz.domObj.setAttributeNS(null, "cy", thiz.point.yCur);
  }

  this.reProject = function(projection) {
    var thiz = this;
    thiz.point.reProject(projection);
  }

  this.init(coord, color);
}