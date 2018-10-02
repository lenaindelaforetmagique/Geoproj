// global variables
var svgNS = "http://www.w3.org/2000/svg";

removeDOMChildren = function(dom) {
  //removes all children of dom
  while (dom.firstChild) {
    dom.removeChild(dom.firstChild);
  };
};


SVGView = function(sourceShapes) {
  this.container = document.getElementById("container");
  this.lines = [];
  this.polygons = [];

  this.svg = null;
  this.viewBox = null;
  this.description = null;

  this.iProjection = 0;
  this.projection = ListOfProjections[0];
  this.projTitle = "";

  this.lastUpdate = Date.now();

  this.init(sourceShapes);
  this.setupInput();
  this.changeProj();
  this.setupUpdate();
}


SVGView.prototype.init = function(sourceShapes) {
  var thiz = this;

  thiz.svg = document.createElementNS(svgNS, "svg");
  thiz.container.appendChild(thiz.svg);
  thiz.viewBox = new ViewBox(thiz.svg);

  // description box
  thiz.description = document.createElementNS(svgNS, "svg");
  thiz.container.appendChild(thiz.description);

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

SVGView.prototype.changeProj = function(incr = 0, dlambda = 0, dphi = 0, dtheta = 0) {
  var thiz = this;

  // if (incr == 0 && dlambda == 0 && dphi == 0 && dtheta == 0) {
  //   // reset
  //   thiz.projection.lambda0 = 0;
  //   thiz.projection.phi0 = 0;
  //   thiz.projection.theta = 0;
  // }

  thiz.iProjection += incr;
  while (thiz.iProjection < 0) {
    thiz.iProjection += ListOfProjections.length;
  }
  thiz.iProjection %= ListOfProjections.length;
  thiz.projection = ListOfProjections[thiz.iProjection];

  thiz.projection.lambda0 += dlambda;
  thiz.projection.phi0 += dphi;
  thiz.projection.theta += dtheta;
  // thiz.projection.ct = Math.cos(thiz.projection.theta * Math.PI / 180);
  // thiz.projection.st = Math.sin(thiz.projection.theta * Math.PI / 180);

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
  svgObj.setAttributeNS(null, "height", window.innerHeight);
  svgObj.setAttributeNS(null, "viewwidth", window.innerWidth);
  svgObj.textContent = thiz.projection.title;

  let tbox = document.createElementNS(svgNS, 'tspan');
  tbox.textContent = thiz.projection.description();
  tbox.setAttributeNS(null, "x", 0);
  tbox.setAttributeNS(null, "dy", 20);
  tbox.setAttributeNS(null, "font-size", "15px");
  svgObj.appendChild(tbox);

  for (let i = 0; i < thiz.projection.properties.length; i++) {
    let tbox = document.createElementNS(svgNS, 'tspan');
    tbox.textContent = thiz.projection.properties[i];
    tbox.setAttributeNS(null, "x", 0);
    tbox.setAttributeNS(null, "dy", 15);
    tbox.setAttributeNS(null, "font-size", "15px");
    svgObj.appendChild(tbox);
  }

  let legend = document.createElementNS(svgNS, 'tspan');
  legend.setAttributeNS(null, "x", 5);
  legend.setAttributeNS(null, "y", window.innerHeight - 5);
  legend.setAttributeNS(null, "font-size", "15px");
  legend.textContent = "CONTROLS: MOUSE click&drag + wheel; KEYBOARD: left/right arrows + a/q + z/s + e/d";
  svgObj.appendChild(legend);

  thiz.description.appendChild(svgObj);

  // lines
  for (let i = 0; i < thiz.lines.length; i++) {
    thiz.lines[i].project(thiz.projection.func);
  }

  // shapes
  for (let i = 0; i < thiz.polygons.length; i++) {
    thiz.polygons[i].project(thiz.projection.func);
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

  document.onkeydown = function(e) {
    console.log(e.which);
    switch (e.which) {
      case 65: //a
        thiz.changeProj(0, 1);
        break;
      case 81: //q
        thiz.changeProj(0, -1);
        break;
      case 90: //z
        thiz.changeProj(0, 0, 1);
        break;
      case 83: //s
        thiz.changeProj(0, 0, -1);
        break;
      case 69: //e
        thiz.changeProj(0, 0, 0, 1);
        break;
      case 68: //d
        thiz.changeProj(0, 0, 0, -1);
        break;

        // case 82: //r (reset)
        //   thiz.changeProj(0, 0, 0, 0);
        //   break;

        // case 32: // space
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
    thiz.changeProj(0);
  }

  thiz.touchInput();
}


SVGView.prototype.touchInput = function() {
  var thiz = this;
  var dom = thiz.container;

  this.prevPos = null;
  this.prevSize = null;
  // this.inputThreshold = 40;

  this.input = new Input(dom); // dom

  this.input.spyEvent = function(e) {
    thiz.projection.title = e.type;
    thiz.changeProj(0, 0, 0, 0);
  };


  this.input.savePos = function(x, y) {
    thiz.prevPos = {
      x: x,
      y: y
    };
  };

  this.input.resetPos = function() {
    thiz.prevPos = null;
  };

  this.input.saveTouchSize = function(size) {
    thiz.prevSize = size;
  };

  this.input.resetTouchSize = function() {
    thiz.prevSize = null;
  };

  this.input.getTouchPos = function(l_touches) {
    let x = 0;
    let y = 0;
    let n = l_touches.length;
    for (let i = 0; i < n; i++) {
      x += l_touches[i].clientX / n;
      y += l_touches[i].clientY / n;
    }
    return {
      x: x,
      y: y
    };
  };

  this.input.getTouchSize = function(l_touches) {
    let lMax = 0;
    let n = l_touches.length;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        let l = Math.pow(l_touches[i].clientX - l_touches[j].clientX, 2);
        l += Math.pow(l_touches[i].clientY - l_touches[j].clientY, 2);
        lMax = Math.max(lMax, l);
      }
    }
    return Math.pow(lMax, 0.5);
  };


  this.input.move = function(x, y) {
    if (thiz.prevPos == null) {
      return;
    } else {
      let dx = x - thiz.prevPos.x;
      let dy = y - thiz.prevPos.y;
      thiz.input.savePos(x, y);
      thiz.viewBox.translate(-dx, -dy);
    }
  };

  this.input.zoom = function(x, y, k) {
    thiz.viewBox.scale(x, y, k);
  };



  this.input.handle_mousedown = function(e) {
    thiz.input.savePos(e.clientX, e.clientY);
  };

  this.input.handle_mousemove = function(e) {
    thiz.input.move(e.clientX, e.clientY);
  };

  this.input.handle_mouseup = function(e) {
    thiz.input.resetPos();
  };

  this.input.handle_wheel = function(e) {
    let k = 1.1;
    if (e.deltaY > 0) {
      k = 1 / k;
    }
    thiz.input.zoom(e.clientX, e.clientY, k);
  };

  this.input.handle_touchstart = function(e) {
    let curPos = thiz.input.getTouchPos(e.touches);
    thiz.input.savePos(curPos.x, curPos.y);
    let size = thiz.input.getTouchSize(e.touches);
    thiz.input.saveTouchSize(size);
    // thiz.projection.title += ')';
    // thiz.projection.title += curPos.x + ", " + curPos.y;
    // thiz.changeProj(0, 0, 0, 0);
  };

  this.input.handle_touchmove = function(e) {
    let curPos = thiz.input.getTouchPos(e.touches);
    let dx = curPos.x - thiz.input.prevPos.x;
    let dy = curPos.y - thiz.input.prevPos.y;
    let size = thiz.input.getTouchSize(e.touches);

    if (size > 0 && thiz.input.prevSize > 0) {
      let k = size / thiz.input.prevSize;

      thiz.input.move(curPos.x, curPos.y);
      thiz.input.zoom(curPos.x, curPos.y, k);
      thiz.input.saveTouchSize(size);

    } else if (Math.abs(dx / dy) > 1 && Math.abs(dx) > 20) {
      thiz.changeProj(Math.sign(dx));
    };
  };

  this.input.handle_touchend = function(e) {
    thiz.input.resetPos();
    thiz.input.resetTouchSize();
  };

  this.input.handle_touchcancel = function(e) {
    thiz.input.handle_touchend();
  };

  this.input.handle_touchleave = function(e) {
    thiz.input.handle_touchend();
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

  this.update = function() {}

  this.draw = function() {
    this.parentSvg.setAttributeNS(null, "viewBox", this.box.join(" "));
  }

  this.initSVG = function(style) {
    this.box = [-180, -90, 360, 360 * window.innerHeight / window.innerWidth];
    this.resize();
    this.draw();
  }

  this.scale = function(x, y, fact = 1) {
    let domRect = this.parentSvg.getBoundingClientRect();
    let coorX = (x - domRect.left) / domRect.width * this.box[2] + this.box[0];
    let coorY = (y - domRect.top) / domRect.height * this.box[3] + this.box[1];

    this.box[0] = coorX - (coorX - this.box[0]) / fact;
    this.box[1] = coorY - (coorY - this.box[1]) / fact;
    this.box[2] /= fact;
    this.box[3] /= fact;
    this.draw();
  }

  this.translate = function(dx, dy) {
    let domRect = this.parentSvg.getBoundingClientRect();
    this.box[0] += dx / domRect.width * this.box[2];
    this.box[1] += dy / domRect.height * this.box[3];
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
  return ListOfProjections[thiz.iProjection % ListOfProjections.length].func;
}