// global variables

removeDOMChildren = function(dom) {
  //removes all children of dom
  while (dom.firstChild) {
    dom.removeChild(dom.firstChild);
  };
};


HTMLView = function(sourceShapes, coord = [0, 0], animated = true) {
  this.container = document.getElementById("container");
  this.animated = animated;
  this.hasChanged = false;

  this.svgMap = null;
  this.svgText = null;

  this.lambda0 = coord[0];
  this.phi0 = coord[1];

  this.iProjection = 0;
  this.projection = ListOfProjections[0];
  this.projTitle = "";

  this.lastUpdate = Date.now();

  this.init(sourceShapes, coord);
  this.setupInput();
  this.changeProj();
  this.setupUpdate();
}


HTMLView.prototype.init = function(sourceShapes, coord) {
  var thiz = this;
  thiz.svgMap = new SVGMap(sourceShapes, coord);
  thiz.container.appendChild(thiz.svgMap.domObj);

  thiz.svgText = new SVGText();
  thiz.container.appendChild(thiz.svgText.domObj);
}

HTMLView.prototype.changeProj = function(incr = 0, dlambda = 0, dphi = 0) {
  var thiz = this;

  thiz.iProjection += incr;
  while (thiz.iProjection < 0) {
    thiz.iProjection += ListOfProjections.length;
  }
  thiz.iProjection %= ListOfProjections.length;
  thiz.projection = ListOfProjections[thiz.iProjection];

  thiz.phi0 = Math.max(-90, Math.min(90, thiz.phi0 + dphi));
  thiz.lambda0 += dlambda;
  while (thiz.lambda0 < -180) {
    thiz.lambda0 += 360;
    thiz.lambda0 = Math.floor(thiz.lambda0 / 10) * 10;
  }
  while (thiz.lambda0 > 180) {
    thiz.lambda0 -= 360;
    thiz.lambda0 = Math.floor(thiz.lambda0 / 10) * 10;
  }

  thiz.projection.setProj(thiz.lambda0, thiz.phi0);
  thiz.svgText.setProj(thiz.projection);
  thiz.svgMap.reProject(thiz.projection)

  thiz.hasChanged = true;
}

HTMLView.prototype.update = function() {
  var thiz = this;
  thiz.svgMap.update(thiz.animated);
}

HTMLView.prototype.draw = function() {
  var thiz = this;
  thiz.svgMap.draw();
}

HTMLView.prototype.setupInput = function() {
  // all events behavior here
  var thiz = this;

  document.onkeydown = function(e) {
    // console.log(e.which);
    switch (e.which) {
      case 68: //d
        thiz.changeProj(0, 0, -10);
        break;
      case 69: //e
        thiz.changeProj(0, 0, 10);
        break;
      case 70: //f
        thiz.changeProj(0, 10);
        break;
      case 83: //s
        thiz.changeProj(0, -10);
        break;
      case 37: // left arrow
        thiz.changeProj(-1);
        break;
      case 39: // right arrow
        thiz.changeProj(1);
        break;
    }
  }

  window.onresize = function(e) {
    thiz.svgMap.viewBox.resize();
    thiz.changeProj(0);
    thiz.svgText.resize();
  }

  thiz.svgText.controlText.onclick = function(e) {
    thiz.svgText.changeText();
  }

  thiz.touchInput();
}

HTMLView.prototype.touchInput = function() {
  var thiz = this;
  var dom = thiz.container;

  this.input = new Input(dom);

  move = function(dx, dy) {
    thiz.svgMap.viewBox.translate(-dx, -dy);
  };

  zoom = function(k) {
    thiz.svgMap.viewBox.scale(thiz.input.curPos.x, thiz.input.curPos.y, k);
  };

  changeOrigin = function(dx, dy) {
    let domRect = thiz.svgMap.domObj.getBoundingClientRect();
    let k = domRect.width / thiz.svgMap.viewBox.box[2];
    thiz.changeProj(0, dx / k, dy / k);
  }

  this.input.handle_mousedown = function(e) {
    thiz.input.loadMouse(e);
    thiz.input.savePos();
  };

  this.input.handle_mousemove = function(e) {
    thiz.input.loadMouse(e);
    if (thiz.input.prevPos !== null) {
      let dx = thiz.input.curPos.x - thiz.input.prevPos.x;
      let dy = thiz.input.curPos.y - thiz.input.prevPos.y;
      if (e.shiftKey) {
        changeOrigin(-dx, dy);
      } else {
        move(dx, dy);
      }
      thiz.input.savePos();
    }
  };

  this.input.handle_mouseup = function(e) {
    thiz.input.loadMouse(e);
    thiz.input.resetPos();
  };

  this.input.handle_wheel = function(e) {
    thiz.input.loadMouse(e);
    let k = 1.1;
    if (e.deltaY > 0) {
      k = 1 / k;
    }
    zoom(k);
  };

  this.input.handle_touchstart = function(e) {
    thiz.input.loadTouch(e);
    thiz.input.savePos();
    thiz.input.saveTouchSize();
  };

  this.input.handle_touchmove = function(e) {
    thiz.input.loadTouch(e);
    thiz.input.hasMoved = true;

    if (thiz.input.prevPos !== null) {
      let dx = thiz.input.curPos.x - thiz.input.prevPos.x;
      let dy = thiz.input.curPos.y - thiz.input.prevPos.y;

      if (thiz.input.curSize > 0) {
        // more than 1 finger
        move(dx, dy);

        if (thiz.input.prevSize > 0) {
          zoom(thiz.input.curSize / thiz.input.prevSize);
          thiz.input.saveTouchSize();
        }
      } else {
        // 1 finger + x-slide>20px
        changeOrigin(-dx, dy);
      }
      thiz.input.savePos();
    }
  };

  this.input.handle_touchend = function(e) {
    if (!thiz.input.hasMoved) {
      if (thiz.input.prevPos.y < 80) {
        thiz.svgText.changeText();
      } else if (thiz.input.prevPos.x < window.innerWidth / 4) {
        thiz.changeProj(-1);
      } else if (thiz.input.prevPos.x > window.innerWidth * 3 / 4) {
        thiz.changeProj(1);
      }
    }
    thiz.input.resetPos();
    thiz.input.resetTouchSize();
    thiz.input.hasMoved = false;
  };
};


HTMLView.prototype.setupUpdate = function() {
  var thiz = this;
  var updateCB = function(timestamp) {
    thiz.refresh(timestamp);
    window.requestAnimationFrame(updateCB);
  };
  updateCB(0);
};

HTMLView.prototype.needRefresh = function() {
  if (this.animated) {
    let now = Date.now();
    if (now - this.lastUpdate > 20) {
      this.lastUpdate = now;
      return true;
    } else {
      return false;
    }
  } else if (this.hasChanged) {
    this.hasChanged = false;
    return true;
  }
}

HTMLView.prototype.refresh = function(ts) {
  if (this.needRefresh()) {
    this.update();
    this.draw();
  }
};