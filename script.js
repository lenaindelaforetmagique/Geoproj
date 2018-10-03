// reading of .JSON file

var request = new XMLHttpRequest();
request.onload = function() {
  var coastlines = request.response;
  // see http://geojson.org/
  // coastlines : object
  // coastlines.geometries : Array of objects
  // coastlines.geometries[0] : object
  // coastlines.geometries[0].coordinates : Array of MultiPolygons
  // coastlines.geometries.coordinates[i] : Array of Polygons

  var run = new SVGView(coastlines.geometries[0].coordinates);
  // run.init();
}

var requestURL = 'earth-coastlines-12.json';
request.open('GET', requestURL);
request.responseType = 'json';
request.send();