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

let requestURL = getQueryVariable("file");
if (!requestURL) {
  requestURL = 'earth-coastlines-12.json';
}

let animated = getQueryVariable("animated");
animated = (!animated || animated !== "false")

console.log(requestURL, animated);



// reading of .JSON file
var request = new XMLHttpRequest();
request.onload = function() {
  var coastlines = request.response;

  var multiPolygons = getGeoJsonObj(coastlines, "MultiPolygon");
  var polygons = getGeoJsonObj(coastlines, "Polygon");
  for (let i = 0; i < polygons.length; i++) {
    multiPolygons.push([polygons[i]]);
  }

  function success(pos) {
    var crd = pos.coords;
    var run = new HTMLView(multiPolygons, [crd.longitude, crd.latitude], animated);
  }

  function error(err) {
    var run = new HTMLView(multiPolygons, [0, 0], animated);
  }

  navigator.geolocation.getCurrentPosition(success, error);
}

function getGeoJsonObj(o, type) {
  // returns an Arry of every type-objects
  if (o.type == type) {
    return o.coordinates;
  } else {
    let r = [];
    for (var p in o) {
      if (typeof(o[p]) == "object") {
        r = r.concat(getGeoJsonObj(o[p], type));
      }
    }
    return r;
  }
}

request.open('GET', requestURL);
request.responseType = 'json';
request.send();