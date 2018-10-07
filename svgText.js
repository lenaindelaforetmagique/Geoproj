SVGText = function() {
  this.domObj = null;

  // components
  this.text = null;
  this.title = null;
  this.description = null;

  this.setProj = function(projection) {
    console.log(projection.title);
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
  thiz.text.setAttributeNS(null, "x", 0);
  thiz.text.setAttributeNS(null, "y", 30);
  thiz.text.setAttributeNS(null, "fill", "rgba(0,0,0,0.7)");

  thiz.title = document.createElementNS(svgNS, "tspan");
  thiz.title.setAttributeNS(null, "font-size", "30px")
  thiz.text.appendChild(thiz.title);

  thiz.description = document.createElementNS(svgNS, "tspan");
  thiz.description.setAttributeNS(null, "font-size", "20px")
  thiz.description.setAttributeNS(null, "x", 0);
  thiz.description.setAttributeNS(null, "dy", 20);
  thiz.text.appendChild(thiz.description);

  thiz.domObj.appendChild(thiz.text);
}