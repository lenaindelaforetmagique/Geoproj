// global variables
var svgNS = "http://www.w3.org/2000/svg";

removeDOMChildren = function(dom) {
  //removes all children of dom
  while (dom.firstChild) {
    dom.removeChild(dom.firstChild);
  };
};


SVGView = function(sourceShapes) {
  this.lines = [];
  this.polygons = [];

  this.svg = null;
  this.viewBox = null;
  this.description = null;

  this.iProjection = 0;
  this.projTitle = "";

  this.lastUpdate = Date.now();

  this.init(sourceShapes);
  this.setupInput();
  this.changeProj(0);
  this.setupUpdate();

}


SVGView.prototype.init = function(sourceShapes) {
  var thiz = this;

  thiz.svg = document.createElementNS(svgNS, "svg");
  document.body.appendChild(thiz.svg);

  thiz.description = document.createElementNS(svgNS, "svg");
  document.body.appendChild(thiz.description);

  thiz.viewBox = new ViewBox(thiz.svg);

  // Create lines
  // meridians
  for (let lat = -90; lat <= 90; lat += 10) {
    let line = new Line(lat == 0 ? 1 : 0);
    for (let lon = -180; lon <= 180; lon += 1) {
      line.points.push(new Point(lon, lat));
    }
    thiz.lines.push(line);
  }

  // parallels
  for (let lon = -180; lon <= 180; lon += 10) {
    let line = new Line(lon == 0 ? 1 : 0);
    for (let lat = -90; lat <= 90; lat += 1) {
      line.points.push(new Point(lon, lat));
    }
    thiz.lines.push(line);
  }

  // Polygons
  thiz.polygons = [];

  // Water
  let water = new Polygon(1);
  for (let lon = -180; lon <= 180; lon += 1) {
    water.points.push(new Point(lon, -90));
  }
  for (let lat = -90; lat <= 90; lat += 1) {
    water.points.push(new Point(180, lat));
  }
  for (let lon = 180; lon >= -180; lon -= 1) {
    water.points.push(new Point(lon, 90));
  }
  for (let lat = 90; lat >= -90; lat -= 1) {
    water.points.push(new Point(-180, lat));
  }
  thiz.polygons.push(water);

  // Loading shapes
  for (let i = 0; i < sourceShapes.length; i++) {
    // Shape level
    for (let j = 0; j < sourceShapes[i].length; j++) {
      // Polygon level
      let polygon = new Polygon(j);
      for (let k = 0; k < sourceShapes[i][j].length; k++) {
        // Point level
        polygon.points.push(new Point(sourceShapes[i][j][k][0], sourceShapes[i][j][k][1]));
      }
      thiz.polygons.push(polygon);
    }
  }
}

SVGView.prototype.changeProj = function(incr) {
  var thiz = this;

  thiz.iProjection += incr;
  while (thiz.iProjection < 0) {
    thiz.iProjection += ListOfProjections.length;
  }
  thiz.projTitle = thiz.projectionFunction().name;

  // change description
  removeDOMChildren(thiz.description);

  // draw title
  let svgObj = document.createElementNS(svgNS, 'text');
  let col = 'rgba(0,0,0,0.7)';

  svgObj.setAttributeNS(null, "x", 0);
  svgObj.setAttributeNS(null, "y", 30);
  svgObj.setAttributeNS(null, "font-size", "30px");
  svgObj.setAttributeNS(null, "style", "fill:" + col);
  svgObj.setAttributeNS(null, "stroke", 'black');
  svgObj.setAttributeNS(null, "stroke-width", "0.01");
  svgObj.textContent = thiz.projTitle;

  thiz.tbox = document.createElementNS(svgNS, 'tspan');
  thiz.tbox.textContent = "description:";
  thiz.tbox.setAttributeNS(null, "x", 0);
  thiz.tbox.setAttributeNS(null, "dy", 30);
  thiz.tbox.setAttributeNS(null, "font-size", "20px");

  svgObj.appendChild(thiz.tbox);
  thiz.description.appendChild(svgObj);


  // change target points



  // lines
  for (let i = 0; i < thiz.lines.length; i++) {
    thiz.lines[i].changeProj(thiz.projectionFunction());
  }

  // shapes
  for (let i = 0; i < thiz.polygons.length; i++) {
    thiz.polygons[i].changeProj(thiz.projectionFunction());
  }
}

SVGView.prototype.update = function() {
  var thiz = this;
  // update lines
  for (let i = 0; i < thiz.lines.length; i++) {
    thiz.lines[i].update();
  }

  // update shapes
  for (let i = 0; i < thiz.polygons.length; i++) {
    thiz.polygons[i].update();
  }
}


SVGView.prototype.draw = function() {
  var thiz = this;
  removeDOMChildren(thiz.svg);

  // draw shapes
  for (let i = 0; i < thiz.polygons.length; i++) {
    thiz.svg.appendChild(thiz.polygons[i].svg());
  }

  // draw lines
  for (let i = 0; i < thiz.lines.length; i++) {
    thiz.svg.appendChild(thiz.lines[i].svg());
  }
}


SVGView.prototype.setupInput = function() {
  // all events behavior here

  var thiz = this;

  // document.onclick = function(e) {
  //   if (e.shiftKey) {
  //     thiz.viewBox.zoomOut(e.clientX, e.clientY);
  //   } else {
  //     thiz.viewBox.zoomIn(e.clientX, e.clientY);
  //   }
  // }

  document.onkeydown = function(e) {
    switch (e.which) {
      // case 32: // space
      //   thiz.changeProj();
      //   break;
      case 37: // left arrow
        thiz.changeProj(-1);
        break;
        // case 38: // up arrow
        //   break;
      case 39: // right arrow
        thiz.changeProj(1);
        break;
        // case 40: // down arrow
        //   break;
    }
  }

  window.onresize = function(e) {
    thiz.viewBox.resize();
  }

  thiz.touchInput();
}


SVGView.prototype.touchInput = function() {
  var dom = this.svg;
  var thiz = this;

  this.downPos = null;
  this.inputThreshold = 40;

  this.input = new Input(dom);

  this.input.start = function(x, y) {
    thiz.tbox.textContent += "+";
    thiz.downPos = {
      x: x,
      y: y
    };
  };

  this.input.move = function(x, y) {
    if (thiz.downPos == null)
      return;

    var dx = x - thiz.downPos.x;
    var dy = y - thiz.downPos.y;

    if (Math.abs(dy) > Math.abs(dx)) {
      // vertical : zoomIn / zoomOut
      if (dy > thiz.inputThreshold) {
        thiz.viewBox.zoomIn(thiz.downPos.x, thiz.downPos.y);
        // thiz.input.end(); // stop input
      } else if (dy < -thiz.inputThreshold) {
        thiz.viewBox.zoomOut(thiz.downPos.x, thiz.downPos.y);
        // thiz.input.end(); // stop input
      }
    } else {
      // horizontal : change projection
      if (dx > thiz.inputThreshold) {
        thiz.changeProj(1);
        // thiz.input.start(x, y); // reset for continuous input
        thiz.input.end(); // stop input
      } else if (dx < -thiz.inputThreshold) {
        thiz.changeProj(-1);
        // thiz.input.start(x, y); // reset for continuous input
        thiz.input.end(); // stop input
      }
    }
  };

  this.input.end = function() {
    thiz.tbox.textContent += "-";
    thiz.downPos = null;
  };
};


SVGView.prototype.setupUpdate = function() {
  var thiz = this;

  var updateCB = function(timestamp) {
    thiz.refresh(timestamp);
    window.requestAnimationFrame(updateCB);
  };
  updateCB(0);
};

SVGView.prototype.refresh = function(ts) {
  let now = Date.now();
  if (now - this.lastUpdate > 20) {
    this.lastUpdate = now;
    this.update();
    this.draw();
  }
};

ViewBox = function(parentSvg) {
  this.parentSvg = parentSvg;
  this.box = [];

  this.fact = 1.05;
  this.zoom = 1;

  this.update = function() {}

  this.draw = function() {
    this.parentSvg.setAttributeNS(null, "viewBox", this.box.join(" "));
  }

  this.initSVG = function(style) {
    this.box = [-180, -90, 360, 360 * window.innerHeight / window.innerWidth];
    this.resize();
    this.draw();
  }

  this.zoomIn = function(x, y) {
    let domRect = this.parentSvg.getBoundingClientRect();
    // console.log(domRect);

    let coorX = (x - domRect.left) / domRect.width * this.box[2] + this.box[0];
    let coorY = (y - domRect.top) / domRect.height * this.box[3] + this.box[1];
    // console.log('coordinates', coorX, coorY);

    this.box[0] = coorX - (coorX - this.box[0]) / this.fact;
    this.box[1] = coorY - (coorY - this.box[1]) / this.fact;
    this.box[2] /= this.fact;
    this.box[3] /= this.fact;
    // this.update();
    this.draw();
  }

  this.zoomOut = function(x, y) {
    let domRect = this.parentSvg.getBoundingClientRect();
    // console.log(domRect);

    let coorX = (x - domRect.left) / domRect.width * this.box[2] + this.box[0];
    let coorY = (y - domRect.top) / domRect.height * this.box[3] + this.box[1];
    // console.log('coordinates', coorX, coorY);

    this.box[0] = coorX - (coorX - this.box[0]) * this.fact;
    this.box[1] = coorY - (coorY - this.box[1]) * this.fact;
    this.box[2] *= this.fact;
    this.box[3] *= this.fact;
    // this.update();
    this.draw();
  }


  this.resize = function() {
    // if (window.innerWidth > 700) {
    // this.box[2] = window.innerWidth;
    this.box[3] = this.box[2] * window.innerHeight / window.innerWidth;
    this.draw();

    // } else {
    //   this.box[2] = window.innerWidth * 2;
    //   this.box[3] = window.innerHeight * 2;
    // }
  }
  this.initSVG();
}

SVGView.prototype.projectionFunction = function() {
  var thiz = this;
  // return EquiRectangularProjection(coordinates);
  // console.log("connard");
  // console.log(thiz.iProjection);
  // console.log(ListOfProjections);
  return ListOfProjections[thiz.iProjection % ListOfProjections.length];
}