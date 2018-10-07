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

function getQueryVariable(variable) {
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    if (pair[0] == variable) {
      return pair[1];
    }
  }
  return (false);
}

// resolution
let res = parseInt(getQueryVariable("res"));
if (!res || res < 25) {
  var requestURL = 'earth-coastlines-12.json';
} else if (res < 50) {
  var requestURL = 'earth-coastlines-25.json';
} else if (res < 100) {
  var requestURL = 'earth-coastlines-50.json';
} else {
  var requestURL = 'earth-coastlines-100.json';
}


request.open('GET', requestURL);
request.responseType = 'json';
request.send();