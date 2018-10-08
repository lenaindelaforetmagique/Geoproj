//Geometrical objects here:
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

  this.update = function() {
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
    let color = thiz.level == 0 ? '#999999' : "#FF0000";
    let strokeW = thiz.level == 0 ? '0.1' : "0.2";

    thiz.domObj.setAttributeNS(null, "fill", "none");
    thiz.domObj.setAttributeNS(null, "stroke", color);
    thiz.domObj.setAttributeNS(null, "stroke-width", strokeW);

    // Load points
    thiz.points = [];
    for (let k = 0; k < pointList_.length; k++) {
      thiz.points.push(new Point(pointList_[k][0], pointList_[k][1]));
    }
  }

  this.update = function() {
    var thiz = this;
    for (let i = 0; i < thiz.points.length; i += 1) {
      thiz.points[i].update();
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
    let col = thiz.level == 0 ? 'rgba(0,0,0,0.6)' : 'rgba(173,216,230,1)';
    thiz.domObj.setAttributeNS(null, "style", "fill:" + col);
    thiz.domObj.setAttributeNS(null, "stroke", 'black');

    let sw = thiz.level == 0 ? '0.01' : '0';
    thiz.domObj.setAttributeNS(null, "stroke-width", sw);

    // Load points
    thiz.points = [];
    for (let k = 0; k < pointList_.length; k++) {
      thiz.points.push(new Point(pointList_[k][0], pointList_[k][1]));
    }
  }

  this.update = function() {
    var thiz = this;
    for (let i = 0; i < thiz.points.length; i += 1) {
      thiz.points[i].update();
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
    thiz.domObj.setAttributeNS(null, "r", "0.05");
    thiz.domObj.setAttributeNS(null, "fill", col);
    thiz.domObj.setAttributeNS(null, "stroke", 'black');
    thiz.domObj.setAttributeNS(null, "stroke-width", "0.01");

    thiz.point = new Point(coord_[0], coord_[1]);
  }

  this.update = function() {
    var thiz = this;
    thiz.point.update();
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