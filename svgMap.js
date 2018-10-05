var svgNS = "http://www.w3.org/2000/svg";

SVGMap = function(shapes, coord) {
  this.domObj = null;

  // components
  this.viewBox = null;
  this.polygons = null;
  this.lines = null;
  this.point = null;

  this.update = function() {
    var thiz = this;
    for (let i = 0; i < thiz.polygons.length; i++) {
      thiz.polygons[i].update();
    }
    for (let i = 0; i < thiz.lines.length; i++) {
      thiz.lines[i].update();
    }
    if (thiz.point !== null) {
      thiz.point.update();
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

  this.reProject = function(projectionFunction) {
    var thiz = this;
    for (let i = 0; i < thiz.polygons.length; i++) {
      thiz.polygons[i].reProject(projectionFunction);
    }
    for (let i = 0; i < thiz.lines.length; i++) {
      thiz.lines[i].reProject(projectionFunction);
    }
    if (thiz.point !== null) {
      thiz.point.reProject(projectionFunction);
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
  let pointsList = [];
  for (let lon = -180; lon < 180; lon += 1) {
    pointsList.push([lon, -90]);
  }
  for (let lat = -90; lat < 90; lat += 1) {
    pointsList.push([180, lat]);
  }
  for (let lon = 180; lon > -180; lon -= 1) {
    pointsList.push([lon, 90]);
  }
  for (let lat = 90; lat >= -90; lat -= 1) {
    pointsList.push([-180, lat]);
  }
  let waterBG = new Polygon(pointsList, 1);
  thiz.polygons.push(waterBG);
  thiz.domObj.appendChild(waterBG.domObj);

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
    this.box = [-180, -90, 360, 360 * window.innerHeight / window.innerWidth];
    this.resize();
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