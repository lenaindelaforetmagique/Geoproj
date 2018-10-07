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

  function success(pos) {
    var crd = pos.coords;
    var run = new HTMLView(coastlines.geometries[0].coordinates, [crd.longitude, crd.latitude]);
  }

  function error(err) {
    var run = new HTMLView(coastlines.geometries[0].coordinates);
  }

  navigator.geolocation.getCurrentPosition(success, error);
}

var requestURL = 'earth-coastlines-12.json';
request.open('GET', requestURL);
request.responseType = 'json';
request.send();