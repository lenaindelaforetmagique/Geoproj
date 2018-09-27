// global variables
var svgNS = "http://www.w3.org/2000/svg";

removeDOMChildren = function(dom) {
  //removes all children of dom
  while (dom.firstChild) {
    dom.removeChild(dom.firstChild);
  };
};




// reading of .JSON file
var requestURL = 'earth-coastlines-100%.json';
var request = new XMLHttpRequest();

request.open('GET', requestURL);
request.responseType = 'json';
request.send();
request.onload = function() {
  var coastlines = request.response;
  // see http://geojson.org/
  // coastlines : object
  // coastlines.geometries : Array of objects
  // coastlines.geometries[0] : object
  // coastlines.geometries[0].coordinates : Array of MultiPolygons
  // coastlines.geometries.coordinates[i] : Array of Polygons

  var run = new SVGView(coastlines.geometries[0].coordinates);
  run.init();
}


SVGView = function(shapes) {
  this.shapes = shapes;
  this.lines = [];
  this.svg = null;

  this.viewBox = null;
  this.iProjection = 0;

  this.project = function(coordinates) {
    // return EquiRectangularProjection(coordinates);
    return this.ListOfProjections[this.iProjection % this.ListOfProjections.length](coordinates);
    // return MercatorProjection(coordinates);
  }


  this.changeProj = function(incr) {
    removeDOMChildren(this.svg);
    this.iProjection += incr;

    while (this.iProjection < 0) {
      this.iProjection += this.ListOfProjections.length;
    }

    this.draw();
  }

  this.draw = function() {
    this.drawLines();
    this.drawShapes();
  }

  this.drawLines = function() {
    let thiz = this;
    thiz.lines.forEach(function(points) {
      let list = "";
      for (let i = 0; i < points.length; i += 1) {
        let xy = thiz.project(points[i]);
        list += `${xy[0]}, ${xy[1]} `;
      }
      let color = '#999999';
      let strokeW = "0.2";

      // Greenwich and Equator in red
      if ((points[0][1] == 0) || (points[0][0] == 0)) {
        color = '#FF0000';
        strokeW = "0.4";
      }

      let svgObj = document.createElementNS(svgNS, 'polyline');
      svgObj.setAttributeNS(null, "points", list);
      svgObj.setAttributeNS(null, "fill", "none");
      svgObj.setAttributeNS(null, "stroke", color);
      svgObj.setAttributeNS(null, "stroke-width", strokeW);
      thiz.svg.appendChild(svgObj);

    });
  }

  this.drawShapes = function() {
    let thiz = this;
    thiz.shapes.forEach(function(mPolygon) {
      mPolygon.forEach(function(polygon) {
        let list = "";

        for (let i = 0; i < polygon.length; i += 1) {
          let xy = thiz.project(polygon[i]);
          list += `${xy[0]}, ${xy[1]} `;
        }

        let svgObj = document.createElementNS(svgNS, 'polygon');
        svgObj.setAttributeNS(null, "points", list);
        let col = 'rgb(0,0,0,0.6)';

        svgObj.setAttributeNS(null, "style", "fill:" + col);
        svgObj.setAttributeNS(null, "stroke", 'black');
        svgObj.setAttributeNS(null, "stroke-width", "0.01");
        thiz.svg.appendChild(svgObj);
      });
    });
  }

  this.init = function() {
    this.svg = document.createElementNS(svgNS, "svg");
    document.body.appendChild(this.svg);

    // generates lines
    // meridians
    for (let lat = -90; lat <= 90; lat += 10) {
      let line = [];
      for (let lon = -180; lon <= 180; lon += 1) {
        line.push([lon, lat]);
      }
      this.lines.push(line);
    }

    // parallels
    for (let lon = -180; lon <= 180; lon += 10) {
      let line = [];
      for (let lat = -90; lat <= 90; lat += 1) {
        line.push([lon, lat]);
      }
      this.lines.push(line);
    }

    this.viewBox = new ViewBox(this.svg);
    this.draw();
    this.setupInput();
  }
}



SVGView.prototype.setupInput = function() {
  // all events behavior here

  var thiz = this;

  document.onclick = function(e) {
    if (e.shiftKey) {
      thiz.viewBox.zoomOut(e.clientX, e.clientY);
    } else {
      thiz.viewBox.zoomIn(e.clientX, e.clientY);
    }
  }

  document.onkeydown = function(e) {
    switch (e.which) {
      // case 32: // space
      //   thiz.changeProj();
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
  }
}

ViewBox = function(parentSvg) {
  this.parentSvg = parentSvg;
  this.box = [];

  this.fact = 1.2;
  this.zoom = 1;

  this.update = function() {}

  this.draw = function() {
    this.parentSvg.setAttributeNS(null, "viewBox", this.box.join(" "));
  }

  this.initSVG = function(style) {
    this.box = [-180, -90, 360, 360 * window.innerHeight / window.innerWidth];
    this.resize();
    this.draw();
  }


  this.zoomIn = function(x, y) {
    let domRect = this.parentSvg.getBoundingClientRect();
    // console.log(domRect);

    let coorX = (x - domRect.left) / domRect.width * this.box[2] + this.box[0];
    let coorY = (y - domRect.top) / domRect.height * this.box[3] + this.box[1];
    // console.log('coordinates', coorX, coorY);

    this.box[0] = coorX - (coorX - this.box[0]) / this.fact;
    this.box[1] = coorY - (coorY - this.box[1]) / this.fact;
    this.box[2] /= this.fact;
    this.box[3] /= this.fact;
    // this.update();
    this.draw();

  }

  this.zoomOut = function(x, y) {
    let domRect = this.parentSvg.getBoundingClientRect();
    // console.log(domRect);

    let coorX = (x - domRect.left) / domRect.width * this.box[2] + this.box[0];
    let coorY = (y - domRect.top) / domRect.height * this.box[3] + this.box[1];
    // console.log('coordinates', coorX, coorY);

    this.box[0] = coorX - (coorX - this.box[0]) * this.fact;
    this.box[1] = coorY - (coorY - this.box[1]) * this.fact;
    this.box[2] *= this.fact;
    this.box[3] *= this.fact;
    // this.update();
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

SVGView.prototype.ListOfProjections = [
  EquiRectangular = function(coordinates) {
    return [coordinates[0], -coordinates[1]];
  },

  Mercator = function(coordinates) {
    let lambda = coordinates[0];
    let phi = coordinates[1];
    let x = lambda;

    phi = Math.min(89, Math.max(-89, phi));

    let y = -360 / (2 * Math.PI) * Math.log(Math.tan((45 + phi / 2) * Math.PI / 180));

    return [x, y];
  },

  Bonne = function(coordinates) {
    let lambda = coordinates[0] * Math.PI / 180;
    let phi = coordinates[1] * Math.PI / 180;
    let phi1 = Math.PI / 4;

    let rho = 1 / Math.tan(phi1) + phi1 - phi;
    // console.log(rho);
    let e = (lambda - 0) / rho * Math.cos(phi);


    let y0 = (1 / Math.tan(phi1) - (1 / Math.tan(phi1) + phi1))
    let x = 60 * (rho * Math.sin(e));
    let y = -60 * (1 / Math.tan(phi1) - rho * Math.cos(e) - y0);

    return [x, y];
  },

  // Gall_stereographic = function(coordinates) {
  //   let lambda = coordinates[0];
  //   let phi = coordinates[1] * Math.PI / 180;
  //
  //   let r = 1 * Math.pow(2, 0.5);
  //   let x = r * lambda / Math.pow(2, 0.5);
  //   let y = -45 * r * (1 + Math.pow(2, 0.5) / 2) * Math.tan(phi / 2);
  //   return [x, y];
  // },

  Lambert_cylindrical = function(coordinates) {
    let x = coordinates[0];
    let y = -(180 / Math.PI) * Math.sin(coordinates[1] * Math.PI / 180);
    return [x, y];
  },

  Sinusoidal = function(coordinates) {
    let x = coordinates[0] * Math.cos(coordinates[1] * Math.PI / 180);
    let y = -coordinates[1];
    return [x, y];
  },

  Mollweide = function(coordinates) {
    let lambda = coordinates[0] * Math.PI / 180;
    let phi = coordinates[1] * Math.PI / 180;

    let teta = 0;
    if (Math.abs(coordinates[1]) == 90) {
      teta = phi;
    } else {

      let teta0 = -1000;
      let teta1 = phi;

      while (Math.abs(teta1 - teta0) > 0.00001) {
        teta0 = teta1;
        teta1 = teta0 - (2 * teta0 + Math.sin(2 * teta0) - Math.PI * Math.sin(phi)) / (2 + 2 * Math.cos(2 * teta0));
      }
      teta = teta1;
    }
    let r = 180 / (2 * Math.pow(2, 0.5));
    let x = r * 2 * Math.pow(2, 0.5) / Math.PI * (lambda - 0) * Math.cos(teta);
    let y = -r * Math.pow(2, 0.5) * Math.sin(teta);

    return [x, y];
  }
];