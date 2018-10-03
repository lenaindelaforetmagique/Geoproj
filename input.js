var nop = function() {};

Input = function(dom) {

  this.spyEvent = nop;

  this.handle_mousedown = nop;
  this.handle_mousemove = nop;
  this.handle_mouseup = nop;
  this.handle_wheel = nop;

  this.handle_touchstart = nop;
  this.handle_touchmove = nop;
  this.handle_touchend = nop;
  this.handle_touchcancel = nop;
  this.handle_touchleave = nop;

  this.msg = null;
  this.prevPos = null;
  this.curPos = null;

  this.prevSize = null;
  this.curSize = null;

  var thiz = this;

  dom.addEventListener("mousedown", function(e) {
    e.preventDefault();
    thiz.handle_mousedown(e);
  }, false);

  dom.addEventListener("mousemove", function(e) {
    e.preventDefault();
    thiz.handle_mousemove(e);
  }, false);

  dom.addEventListener("mouseup", function(e) {
    e.preventDefault();
    thiz.handle_mouseup(e);
  }, false);

  dom.addEventListener("wheel", function(e) {
    e.preventDefault();
    thiz.handle_wheel(e);
  }, false);

  dom.addEventListener("touchstart", function(e) {
    e.preventDefault();
    thiz.handle_touchstart(e);
  }, false);

  dom.addEventListener("touchmove", function(e) {
    e.preventDefault();
    thiz.handle_touchmove(e);
  }, false);

  dom.addEventListener("touchend", function(e) {
    e.preventDefault();
    thiz.handle_touchend(e);
  }, false);

  dom.addEventListener("touchcancel", function(e) {
    e.preventDefault();
    thiz.handle_touchend(e);
  }, false);

  dom.addEventListener("touchleave", function(e) {
    e.preventDefault();
    thiz.handle_touchend(e);
  }, false);
};

Input.prototype.loadMouse = function(e) {
  var thiz = this;
  thiz.getMousePos(e);
  thiz.msg = `${e.type} {x: ${thiz.curPos.x}, y: ${thiz.curPos.y}}`;
};

Input.prototype.loadTouch = function(e) {
  var thiz = this;
  thiz.getTouchPos(e);
  thiz.getTouchSize(e);
  thiz.msg = `${e.type} {x: ${thiz.curPos.x}, y: ${thiz.curPos.y}, l:${thiz.curSize}}`;
};


Input.prototype.getMousePos = function(e) {
  var thiz = this;
  thiz.curPos = {
    x: e.clientX,
    y: e.clientY
  };
};

Input.prototype.getTouchPos = function(e) {
  let x = 0;
  let y = 0;
  let n = e.touches.length;
  for (let i = 0; i < n; i++) {
    x += e.touches[i].clientX / n;
    y += e.touches[i].clientY / n;
  }
  var thiz = this;
  thiz.curPos = {
    x: x,
    y: y
  };
};

Input.prototype.savePos = function() {
  var thiz = this;
  thiz.prevPos = thiz.curPos;
};

Input.prototype.resetPos = function() {
  var thiz = this;
  thiz.prevPos = null;
};


Input.prototype.getTouchSize = function(e) {
  var thiz = this;
  let lMax = 0;
  let n = e.touches.length;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let l = Math.pow(e.touches[i].clientX - e.touches[j].clientX, 2);
      l += Math.pow(e.touches[i].clientY - e.touches[j].clientY, 2);
      lMax = Math.max(lMax, l);
    }
  }
  thiz.curSize = Math.pow(lMax, 0.5);
};


Input.prototype.saveTouchSize = function() {
  var thiz = this;
  thiz.prevSize = thiz.curSize;
};

Input.prototype.resetTouchSize = function() {
  var thiz = this;
  thiz.prevSize = null;
};