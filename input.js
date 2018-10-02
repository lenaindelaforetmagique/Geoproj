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

  var thiz = this;

  dom.addEventListener("mousedown", function(e) {
    e.preventDefault();
    thiz.handle_mousedown(e); //start(e.clientX, e.clientY);
  });

  dom.addEventListener("mousemove", function(e) {
    e.preventDefault();
    thiz.handle_mousemove(e); //move(e.clientX, e.clientY);
  });

  dom.addEventListener("mouseup", function(e) {
    e.preventDefault();
    thiz.handle_mouseup(e); //end(e.clientX, e.clientY);
  });

  dom.addEventListener("wheel", function(e) {
    e.preventDefault();
    thiz.handle_wheel(e); //scroll(e.clientX, e.clientY, e.deltaY);
  });


  dom.addEventListener("touchstart", function(e) {
    e.preventDefault();
    thiz.handle_touchstart(e);
  });

  dom.addEventListener("touchmove", function(e) {
    e.preventDefault();
    thiz.handle_touchmove(e);
  });

  dom.addEventListener("touchend", function(e) {
    e.preventDefault();
    thiz.handle_touchend(e);
  });

  dom.addEventListener("touchcancel", function(e) {
    e.preventDefault();
    thiz.handle_touchend(e);
  });

  dom.addEventListener("touchleave", function(e) {
    e.preventDefault();
    thiz.handle_touchend(e);
  });
};