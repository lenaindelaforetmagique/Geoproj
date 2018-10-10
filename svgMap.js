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

// Contains everything about the map-layer.

var svgNS = "http://www.w3.org/2000/svg";

SVGMap = function(shapes, coord) {
  this.domObj = null;

  // components
  this.viewBox = null;
  this.polygons = null;
  this.lines = null;
  this.point = null;

  this.update = function(animated) {
    var thiz = this;
    for (let i = 0; i < thiz.polygons.length; i++) {
      thiz.polygons[i].update(animated);
    }
    for (let i = 0; i < thiz.lines.length; i++) {
      thiz.lines[i].update(animated);
    }
    if (thiz.point !== null) {
      thiz.point.update(animated);
    }
  }

  this.draw = function() {
    var thiz = this;
    // thiz.viewBox.draw();
    for (let i = 0; i < thiz.polygons.length; i++) {
      thiz.polygons[i].draw();
    }
    for (let i = 0; i < thiz.lines.length; i++) {
      thiz.lines[i].draw();
    }
    if (thiz.point !== null) {
      thiz.point.draw();
    }
  }

  this.reProject = function(projection) {
    var thiz = this;
    for (let i = 0; i < thiz.polygons.length; i++) {
      thiz.polygons[i].reProject(projection);
    }
    for (let i = 0; i < thiz.lines.length; i++) {
      thiz.lines[i].reProject(projection);
    }
    if (thiz.point !== null) {
      thiz.point.reProject(projection);
    }
  }

  this.init(shapes, coord);
}

SVGMap.prototype.init = function(sourceShapes, coord) {
  var thiz = this;

  thiz.domObj = document.createElementNS(svgNS, "svg");
  thiz.viewBox = new ViewBox(thiz.domObj);

  // Create Polygons
  thiz.polygons = [];
  // Water background
  let dlon = 10;
  let dlat = 5;
  for (let lon = -180; lon < 180; lon += dlon) {
    for (let lat = -90; lat < 90; lat += dlat) {
      let pointsList = [];
      pointsList.push([lon, lat]);
      pointsList.push([lon + dlon, lat]);
      pointsList.push([lon + dlon, lat + dlat]);
      pointsList.push([lon, lat + dlat]);
      pointsList.push([lon, lat]);
      let waterBG = new Polygon(pointsList, 1);
      thiz.polygons.push(waterBG);
      thiz.domObj.appendChild(waterBG.domObj);
    }
  }
  //
  // let pointsList = [];
  // for (let lon = -180; lon < 180; lon += 1) {
  //   pointsList.push([lon, -90]);
  // }
  // for (let lat = -90; lat < 90; lat += 1) {
  //   pointsList.push([180, lat]);
  // }
  // for (let lon = 180; lon > -180; lon -= 1) {
  //   pointsList.push([lon, 90]);
  // }
  // for (let lat = 90; lat >= -90; lat -= 1) {
  //   pointsList.push([-180, lat]);
  // }
  // let waterBG = new Polygon(pointsList, 1);
  // thiz.polygons.push(waterBG);
  // thiz.domObj.appendChild(waterBG.domObj);

  // Loading shapes
  for (let i = 0; i < sourceShapes.length; i++) {
    // Shape level
    for (let j = 0; j < sourceShapes[i].length; j++) {
      // Polygon level
      let polygon = new Polygon(sourceShapes[i][j], j);
      thiz.polygons.push(polygon);
      thiz.domObj.appendChild(polygon.domObj);
    }
  }


  // Create lines
  thiz.lines = [];
  // parallels
  for (let lat = -90; lat <= 90; lat += 10) {
    pointsList = [];
    for (let lon = -180; lon <= 180; lon += 1) {
      pointsList.push([lon, lat]);
    }
    let line = new Line(pointsList, lat == 0 ? 1 : 0); // equator case
    thiz.lines.push(line);
    thiz.domObj.appendChild(line.domObj);
  }

  // meridians
  for (let lon = -180; lon <= 180; lon += 10) {
    pointsList = [];
    for (let lat = -90; lat <= 90; lat += 1) {
      pointsList.push([lon, lat]);
    }
    let line = new Line(pointsList, lon == 0 ? 1 : 0); // greenwich case
    thiz.lines.push(line);
    thiz.domObj.appendChild(line.domObj);
  }

  // Origin
  let point = new Circle([0, 0], "gray");
  thiz.domObj.appendChild(point.domObj);

  // point
  if (coord !== null) {
    thiz.point = new Circle(coord);
    thiz.domObj.appendChild(thiz.point.domObj)
  }
}

ViewBox = function(parentSvg) {
  this.parentSvg = parentSvg;
  this.box = [];

  this.init = function() {
    var thiz = this;
    if (window.innerHeight > window.innerWidth) {
      var w = 1.5 * 360 / Math.PI;
      var h = w * window.innerHeight / window.innerWidth;

    } else {
      var h = 1.5 * 360 / Math.PI;
      var w = h * window.innerWidth / window.innerHeight;

    }
    this.box = [-w / 2, -h / 2, w, h];
    this.draw();
  }

  this.draw = function() {
    var thiz = this;
    thiz.parentSvg.setAttributeNS(null, "viewBox", thiz.box.join(" "));
  }

  this.scale = function(x, y, fact = 1) {
    var thiz = this;
    let domRect = thiz.parentSvg.getBoundingClientRect();
    let coorX = (x - domRect.left) / domRect.width * thiz.box[2] + thiz.box[0];
    let coorY = (y - domRect.top) / domRect.height * thiz.box[3] + thiz.box[1];

    thiz.box[0] = coorX - (coorX - thiz.box[0]) / fact;
    thiz.box[1] = coorY - (coorY - thiz.box[1]) / fact;
    thiz.box[2] /= fact;
    thiz.box[3] /= fact;
    thiz.draw();
  }

  this.translate = function(dx, dy) {
    var thiz = this;
    let domRect = thiz.parentSvg.getBoundingClientRect();
    thiz.box[0] += dx / domRect.width * thiz.box[2];
    thiz.box[1] += dy / domRect.height * thiz.box[3];
    thiz.draw();
  }

  this.resize = function() {
    var thiz = this;
    thiz.box[3] = thiz.box[2] * window.innerHeight / window.innerWidth;
    thiz.draw();
  }

  this.init();
}