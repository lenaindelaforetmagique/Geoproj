// reading of .JSON file
//https://lenaindelaforetmagique.github.io/Geoproj/
var requestURL = 'earth-coastlines-12.json';
var request = new XMLHttpRequest();

request.open('GET', requestURL);
request.responseType = 'json';
request.send();
request.onload = function() {
  console.log(request);
  console.log(request.response);
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