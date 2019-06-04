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

// Main script.

function success(pos) {
  var crd = pos.coords;
  console.log(pos.coords);
  let newURL = 'https://www.heavens-above.com/?lat=' + pos.coords.latitude + '&lng=' + pos.coords.longitude + '&loc=__iCi__&alt=0&tz=CET';
  // window.location.replace(newURL);
  window.location.href = newURL;
  // window.location = newURL;

  // var run = new HTMLView(multiPolygons, [crd.longitude, crd.latitude], animated, projnum);
}

function error(err) {
  console.log("Pas de coord");
  // var run = new HTMLView(multiPolygons, [0, 0], animated, projnum);
}

navigator.geolocation.getCurrentPosition(success, error);

// // reading of .JSON file
// var request = new XMLHttpRequest();
// request.onload = function() {
//   var coastlines = request.response;
// }
// request.open('GET', requestURL);
// request.responseType = 'json';
// request.send();