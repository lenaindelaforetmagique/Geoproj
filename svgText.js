SVGText = function() {
  this.domObj = null;

  // components
  this.text = null;
  this.title = null;
  this.description = null;

  this.controlText = null;

  this.controlOff = [];
  this.controlOn = [];

  this.ctrl = true;

  this.setProj = function(projection) {
    var thiz = this;
    thiz.title.textContent = projection.title;
    thiz.description.textContent = projection.description();
  }

  this.resize = function() {

  }

  this.init();
}

SVGText.prototype.init = function() {
  var thiz = this;

  thiz.domObj = document.createElementNS(svgNS, "svg");
  thiz.domObj.setAttributeNS(null, "class", "legend");
  // thiz.viewBox = new ViewBox(thiz.domObj);

  thiz.text = document.createElementNS(svgNS, "text");
  thiz.domObj.appendChild(thiz.text);
  thiz.text.setAttributeNS(null, "x", 0);
  thiz.text.setAttributeNS(null, "y", 30);
  thiz.text.setAttributeNS(null, "fill", "rgba(0,0,0,0.7)");

  thiz.title = document.createElementNS(svgNS, "tspan");
  thiz.text.appendChild(thiz.title);
  thiz.title.setAttributeNS(null, "font-size", "30px");

  thiz.description = document.createElementNS(svgNS, "tspan");
  thiz.text.appendChild(thiz.description);
  thiz.description.setAttributeNS(null, "font-size", "12px");
  thiz.description.setAttributeNS(null, "x", 0);
  thiz.description.setAttributeNS(null, "dy", 20);

  thiz.controlText = document.createElementNS(svgNS, "text");
  thiz.domObj.appendChild(thiz.controlText);
  thiz.controlText.setAttributeNS(null, "x", 0);
  thiz.controlText.setAttributeNS(null, "y", 60);
  thiz.controlText.setAttributeNS(null, "fill", "rgba(0,0,0,0.7)");
  thiz.controlText.setAttributeNS(null, "font-size", "12px");

  let line;
  line = document.createElementNS(svgNS, "tspan");
  line.setAttributeNS(null, "x", 0);
  line.setAttributeNS(null, "dy", 12);
  line.textContent = "CONTROLS >";
  thiz.controlOn.push(line);

  let lines = [
    "CONTROLS v",
    " # Mouse",
    " - click & move : slide the view.",
    " - wheel : zoom in/out.",
    " - SHIFT + click & move : change center of projection.",
    " # Keyboard",
    " - left/right arrow to change projection.",
    " - q/d : change longitude center of projection.",
    " - s/z : change latitude center of projection.",
    " # Touch",
    " - two-fingers-move : slide + zoom.",
    " - one-finger-move : change center of projection.",
    " - touch in left-quarter of the screen : previous projection.",
    " - touch in right-quarter of the screen : next projection."
  ];

  for (let i = 0; i < lines.length; i++) {
    line = document.createElementNS(svgNS, "tspan");
    line.setAttributeNS(null, "x", 0);
    line.setAttributeNS(null, "dy", 12);
    line.textContent = lines[i];
    thiz.controlOff.push(line);
  }
  thiz.changeText();
}

SVGText.prototype.changeText = function() {
  var thiz = this;
  removeDOMChildren(thiz.controlText);
  if (thiz.ctrl) {
    for (i = 0; i < thiz.controlOn.length; i++) {
      thiz.controlText.appendChild(thiz.controlOn[i]);
    }
  } else {
    for (i = 0; i < thiz.controlOff.length; i++) {
      thiz.controlText.appendChild(thiz.controlOff[i]);
    }
  }
  thiz.ctrl = !thiz.ctrl;
}