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

  var thiz = this;

  this.setProj = function(projection) {
    thiz.title.textContent = projection.title;
    thiz.description.textContent = projection.description();
  }

  this.resize = function() {

  }

  this.init();
}

SVGText.prototype.init = function() {
  this.domObj = document.createElementNS(svgNS, "svg");

  this.title = document.createElementNS(svgNS, "text");
  this.title.setAttributeNS(null, "class", "title");
  this.title.setAttributeNS(null, "x", 2);
  this.title.setAttributeNS(null, "y", 30);
  this.domObj.appendChild(this.title);

  this.description = document.createElementNS(svgNS, "text");
  this.description.setAttributeNS(null, "x", 2);
  this.description.setAttributeNS(null, "y", 50);
  this.domObj.appendChild(this.description);

  this.animationBtn = document.createElementNS(svgNS, "text");
  this.animationBtn.setAttributeNS(null, "class", "button");
  this.animationBtn.setAttributeNS(null, "x", 2);
  this.animationBtn.setAttributeNS(null, "y", 70);
  this.domObj.appendChild(this.animationBtn);

  this.controlText = document.createElementNS(svgNS, "text");
  this.controlText.setAttributeNS(null, "class", "button");
  this.controlText.setAttributeNS(null, "x", 2);
  this.controlText.setAttributeNS(null, "y", 78);
  this.domObj.appendChild(this.controlText);

  let line;
  line = document.createElementNS(svgNS, "tspan");
  line.setAttributeNS(null, "x", 2);
  line.setAttributeNS(null, "dy", 12);
  line.textContent = "CONTROLS >";
  this.controlOn.push(line);

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
    this.controlOff.push(line);
  }
  this.toggleControl();
}

SVGText.prototype.toggleControl = function() {
  removeDOMChildren(this.controlText);
  if (this.ctrl) {
    for (i = 0; i < this.controlOn.length; i++) {
      this.controlText.appendChild(this.controlOn[i]);
    }
  } else {
    for (i = 0; i < this.controlOff.length; i++) {
      this.controlText.appendChild(this.controlOff[i]);
    }
  }
  this.ctrl = !this.ctrl;
}