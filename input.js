var nop = function() {};

// var spyEvent = function(e) {
//   console.log(e.type);
//   changeBGColor();
// }
//
// var changeBGColor = function() {
//   let r = Math.floor(Math.random() * 255);
//   let v = Math.floor(Math.random() * 255);
//   let b = Math.floor(Math.random() * 255);
//   document.body.setAttributeNS(null, "style", "background-color:" + `rgb(${r},${v},${b})`);
// }



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
    thiz.spyEvent(e);
    e.preventDefault();
    thiz.handle_mousedown(e); //start(e.clientX, e.clientY);
  });

  dom.addEventListener("mousemove", function(e) {
    thiz.spyEvent(e);
    e.preventDefault();
    thiz.handle_mousemove(e); //move(e.clientX, e.clientY);
  });

  dom.addEventListener("mouseup", function(e) {
    thiz.spyEvent(e);
    e.preventDefault();
    thiz.handle_mouseup(e); //end(e.clientX, e.clientY);
  });

  dom.addEventListener("wheel", function(e) {
    thiz.spyEvent(e);
    e.preventDefault();
    thiz.handle_wheel(e); //scroll(e.clientX, e.clientY, e.deltaY);
  });


  dom.addEventListener("touchstart", function(e) {
    thiz.spyEvent(e);
    e.preventDefault();
    thiz.handle_touchstart(e); //start(e.touches[0].clientX, e.touches[0].clientY);
  });

  dom.addEventListener("touchmove", function(e) {
    thiz.spyEvent(e);
    e.preventDefault();
    thiz.handle_touchmove(e); //move(e.touches[0].clientX, e.touches[0].clientY);
  });

  dom.addEventListener("touchend", function(e) {
    thiz.spyEvent(e);
    e.preventDefault();
    thiz.handle_touchend(e); //end();
  });

  dom.addEventListener("touchcancel", function(e) {
    thiz.spyEvent(e);
    e.preventDefault();
    thiz.handle_touchcancel(e); //end();
  });

  dom.addEventListener("touchleave", function(e) {
    thiz.spyEvent(e);
    e.preventDefault();
    thiz.handle_touchleave(e); //end();
  });
};