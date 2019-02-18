// MIT License
//
// Copyright (c) 2018 Xavier Morin
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

// Contains everything about the text-layer.

SVGText = function() {
  this.domObj = null;

  // components
  this.title = null;
  this.description = null;
  this.animationBtn = null;
  this.controlText = null;

  this.controlOff = [];
  this.controlOn = [];

  this.ctrl = true;

  this.setAnimationBtn = function(animated) {
    this.animationBtn.textContent = animated ? "Animation: ON" : "Animation: OFF";
  }

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

  thiz.title = document.createElementNS(svgNS, "text");
  thiz.title.setAttributeNS(null, "class", "title");
  thiz.title.setAttributeNS(null, "x", 2);
  thiz.title.setAttributeNS(null, "y", 30);
  thiz.domObj.appendChild(thiz.title);

  thiz.description = document.createElementNS(svgNS, "text");
  thiz.description.setAttributeNS(null, "x", 2);
  thiz.description.setAttributeNS(null, "y", 50);
  thiz.domObj.appendChild(thiz.description);

  thiz.animationBtn = document.createElementNS(svgNS, "text");
  thiz.animationBtn.setAttributeNS(null, "class", "button");
  thiz.animationBtn.setAttributeNS(null, "x", 2);
  thiz.animationBtn.setAttributeNS(null, "y", 70);
  thiz.domObj.appendChild(thiz.animationBtn);

  thiz.controlText = document.createElementNS(svgNS, "text");
  thiz.controlText.setAttributeNS(null, "class", "button");
  thiz.controlText.setAttributeNS(null, "x", 2);
  thiz.controlText.setAttributeNS(null, "y", 78);
  thiz.domObj.appendChild(thiz.controlText);

  let line;
  line = document.createElementNS(svgNS, "tspan");
  line.setAttributeNS(null, "x", 2);
  line.setAttributeNS(null, "dy", 12);
  line.textContent = "CONTROLS >";
  thiz.controlOn.push(line);

  let lines = [
    "CONTROLS v",
    " # Mouse",
    " - click & move : slide the view.",
    " - wheel : zoom in/out.",
    " - SHIFT + click & move : change center.",
    " # Keyboard",
    " - left/right arrow to change projection.",
    " - s/f : change longitude-center.",
    " - d/e : change latitude-center.",
    " # Touch",
    " - two-fingers-move : slide + zoom.",
    " - one-finger-move : change center.",
    " - left-touch : previous projection.",
    " - right-touch : next projection.",
    " # Query arguments",
    " - ?file=fileName.json : specific GeoJSON file."
  ];

  for (let i = 0; i < lines.length; i++) {
    line = document.createElementNS(svgNS, "tspan");
    line.setAttributeNS(null, "x", 2);
    line.setAttributeNS(null, "dy", 12);
    line.textContent = lines[i];
    thiz.controlOff.push(line);
  }
  thiz.toggleControl();
}

SVGText.prototype.toggleControl = function() {
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