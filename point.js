Point = function(lam, phi) {
  // lambda and phi in degrees
  this.lambda = lam;
  this.phi = phi;

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

  this.reProject = function(projFunction) {
    let newCoor = projFunction(this.lambda, this.phi);
    this.xTar = newCoor[0];
    this.yTar = newCoor[1];
  }
}

Line = function(level) {
  this.points = [];
  this.level = level;

  this.update = function() {
    for (let i = 0; i < this.points.length; i += 1) {
      this.points[i].update();
    }
  }

  this.changeProj = function(projectionFunction) {
    for (let i = 0; i < this.points.length; i += 1) {
      this.points[i].reProject(projectionFunction);
    }
  }

  this.svg = function() {
    let list = "";

    for (let i = 0; i < this.points.length; i += 1) {
      list += `${this.points[i].xCur}, ${this.points[i].yCur} `;
    }

    let svgObj = document.createElementNS(svgNS, 'polyline');
    svgObj.setAttributeNS(null, "points", list);

    let color = this.level == 0 ? '#999999' : "#FF0000";
    let strokeW = this.level == 0 ? '0.1' : "0.2";

    svgObj.setAttributeNS(null, "points", list);
    svgObj.setAttributeNS(null, "fill", "none");
    svgObj.setAttributeNS(null, "stroke", color);
    svgObj.setAttributeNS(null, "stroke-width", strokeW);
    return svgObj;
  }
}


Polygon = function(level) {
  this.points = [];
  this.level = level;

  this.update = function() {
    for (let i = 0; i < this.points.length; i += 1) {
      this.points[i].update();
    }
  }

  this.changeProj = function(projectionFunction) {
    for (let i = 0; i < this.points.length; i += 1) {
      this.points[i].reProject(projectionFunction);
    }
  }

  this.svg = function() {
    let list = "";

    for (let i = 0; i < this.points.length; i += 1) {
      list += `${this.points[i].xCur}, ${this.points[i].yCur} `;
    }

    let svgObj = document.createElementNS(svgNS, 'polygon');
    svgObj.setAttributeNS(null, "points", list);

    let col = this.level == 0 ? 'rgba(0,0,0,0.6)' : 'rgba(173,216,230,1)';

    svgObj.setAttributeNS(null, "style", "fill:" + col);
    svgObj.setAttributeNS(null, "stroke", 'black');
    svgObj.setAttributeNS(null, "stroke-width", "0.01");
    return svgObj;
  }
}