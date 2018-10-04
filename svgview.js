// global variables

removeDOMChildren = function(dom) {
  //removes all children of dom
  while (dom.firstChild) {
    dom.removeChild(dom.firstChild);
  };
};


HTMLView = function(sourceShapes) {
  this.container = document.getElementById("container");

  this.bottom = document.getElementById("console");
  this.console = null;

  this.svgMap = null;
  // this.description = null;

  this.iProjection = 0;
  this.projection = ListOfProjections[0];
  this.projTitle = "";



  this.lastUpdate = Date.now();

  this.init(sourceShapes);
  this.setupInput();
  this.changeProj();
  this.setupUpdate();
}


HTMLView.prototype.init = function(sourceShapes) {
  var thiz = this;
  thiz.svgMap = new SVGMap(sourceShapes);
  thiz.container.appendChild(thiz.svgMap.domObj);

  thiz.console = document.createElement("textarea");
  thiz.bottom.appendChild(thiz.console);
}

HTMLView.prototype.changeProj = function(incr = 0, dlambda = 0, dphi = 0, dtheta = 0) {
  var thiz = this;

  thiz.iProjection += incr;
  while (thiz.iProjection < 0) {
    thiz.iProjection += ListOfProjections.length;
  }
  thiz.iProjection %= ListOfProjections.length;
  thiz.projection = ListOfProjections[thiz.iProjection];

  thiz.projection.lambda0 += dlambda;
  thiz.projection.phi0 += dphi;
  thiz.projection.theta += dtheta;

  thiz.print("");
  thiz.print(thiz.projection.title);
  thiz.print(thiz.projection.description());

  thiz.svgMap.reProject(thiz.projection.func)
}

HTMLView.prototype.update = function() {
  var thiz = this;
  thiz.svgMap.update();
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
    thiz.svgMap.viewBox.resize();
    thiz.changeProj(0);
  }

  thiz.touchInput();
}


HTMLView.prototype.print = function(msg = "") {
  var thiz = this;
  thiz.console.textContent += `\n` + msg;
  thiz.console.scrollTop = thiz.console.scrollHeight;
};

HTMLView.prototype.clrConsole = function() {
  var thiz = this;
  thiz.console.textContent = "";
};

HTMLView.prototype.touchInput = function() {
  var thiz = this;
  var dom = thiz.container;

  this.input = new Input(dom); // dom
  // this.inputThreshold = 40;
  move = function() {
    if (thiz.input.prevPos == null) {
      return;
    } else {
      let dx = thiz.input.curPos.x - thiz.input.prevPos.x;
      let dy = thiz.input.curPos.y - thiz.input.prevPos.y;
      thiz.svgMap.viewBox.translate(-dx, -dy);
    }
  };

  zoom = function(k) {
    thiz.svgMap.viewBox.scale(thiz.input.curPos.x, thiz.input.curPos.y, k);
  };

  this.input.handle_mousedown = function(e) {
    thiz.input.loadMouse(e);
    // thiz.print(thiz.input.msg);
    thiz.input.savePos();
  };

  this.input.handle_mousemove = function(e) {
    thiz.input.loadMouse(e);
    // thiz.print(thiz.input.prevPos);
    if (thiz.input.prevPos !== null) {
      // thiz.print(thiz.input.msg);
      move();
      thiz.input.savePos();
    }
  };

  this.input.handle_mouseup = function(e) {
    thiz.input.loadMouse(e);
    // thiz.print(thiz.input.msg);
    thiz.input.resetPos();
  };

  this.input.handle_wheel = function(e) {
    thiz.input.loadMouse(e);
    // thiz.print(thiz.input.msg);
    let k = 1.1;
    if (e.deltaY > 0) {
      k = 1 / k;
    }
    zoom(k);
  };

  this.input.handle_touchstart = function(e) {
    thiz.input.loadTouch(e);
    // thiz.print(thiz.input.msg);
    thiz.input.savePos();
    thiz.input.saveTouchSize();
  };

  this.input.handle_touchmove = function(e) {
    thiz.input.loadTouch(e);

    if (thiz.input.prevPos !== null) {
      let dx = thiz.input.curPos.x - thiz.input.prevPos.x;
      let dy = thiz.input.curPos.y - thiz.input.prevPos.y;

      if (thiz.input.curSize > 0) {
        // more than 1 finger
        move();
        thiz.input.savePos();
        if (thiz.input.prevSize > 0) {
          zoom(thiz.input.curSize / thiz.input.prevSize);
          thiz.input.saveTouchSize();
        }
      } else if (Math.abs(dx / dy) > 1 && Math.abs(dx) > 20) {
        // 1 finger + x-slide>20px
        thiz.changeProj(Math.sign(dx));
        thiz.input.resetPos();
        thiz.input.resetTouchSize();
      }
    }
  };

  this.input.handle_touchend = function(e) {
    thiz.input.loadTouch(e);
    // thiz.print(thiz.input.msg);
    thiz.input.resetPos();
    thiz.input.resetTouchSize();
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

HTMLView.prototype.refresh = function(ts) {
  let now = Date.now();
  if (now - this.lastUpdate > 20) {
    this.lastUpdate = now;
    this.update();
    this.draw();
  }
};

HTMLView.prototype.projectionFunction = function() {
  var thiz = this;
  // return EquiRectangularProjection(coordinates);
  // console.log(thiz.iProjection);
  // console.log(ListOfProjections);
  return ListOfProjections[thiz.iProjection % ListOfProjections.length].func;
}