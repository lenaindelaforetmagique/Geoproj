// global variables
var svgNS = "http://www.w3.org/2000/svg";


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
  // console.log(coastlines.geometries[0]);

  // console.log(coastlines.geometries[0].coordinates);
  var run = new SVGview(coastlines.geometries[0].coordinates);
  run.init();
  // draw(shapes);
}



SVGview = function(shapes) {
  this.shapes = shapes;
  this.lines = [];
  this.svg = null;

  this.project = function(coordinates) {
    // return EquiRectangularProjection(coordinates);
    return MercatorProjection(coordinates);
  }

  this.drawLines = function() {
    let thiz = this;
    thiz.lines.forEach(function(line) {
      let list = "";
      for (let i = 0; i < line.length; i += 1) {
        let xy = thiz.project(line[i]);
        list += `${xy[0]}, ${xy[1]} `;
      }

      let svgObj = document.createElementNS(svgNS, 'polyline');
      svgObj.setAttributeNS(null, "points", list);

      svgObj.setAttributeNS(null, "stroke", '#999999');
      svgObj.setAttributeNS(null, "stroke-width", "0.1");
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
        svgObj.setAttributeNS(null, "stroke-width", "0.1");
        thiz.svg.appendChild(svgObj);
      });
    });
  }

  this.init = function() {
    this.svg = document.createElementNS(svgNS, "svg");
    this.svg.setAttributeNS(null, "viewBox", "0 0 360 180");
    document.body.appendChild(this.svg);

    // generates lines
    // meridians
    for (let lat = -90; lat <= 90; lat += 10) {
      let line = [];
      for (let lon = -180; lon <= 180; lon += 10) {
        line.push([lon, lat]);
      }
      this.lines.push(line);
    }

    // parallels
    for (let lon = -180; lon <= 180; lon += 10) {
      let line = [];
      for (let lat = -90; lat <= 90; lat += 10) {
        line.push([lon, lat]);
      }
      this.lines.push(line);
    }

    this.drawLines();
    this.drawShapes();
  }
}


var EquiRectangularProjection = function(coordinates) {
  return [180 + coordinates[0], 90 - coordinates[1]];
}

var MercatorProjection = function(coordinates) {
  let lambda = coordinates[0];
  let phi = coordinates[1];
  let x = lambda + 180;

  phi = Math.min(85, Math.max(-85, phi));
  let h = 360;
  let y = h / 2 - 360 / (2 * Math.PI) * Math.log(Math.tan((45 + phi / 2) * Math.PI / 180));

  return [x, y];
}