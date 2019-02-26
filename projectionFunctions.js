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


// Contains the projection function.

const deg_rad = Math.PI / 180;
const rad_deg = 180 / Math.PI;

dotProduct = function(vA, vB) {
  // vA, vB are supposed compatible-vectors, no check is done here.
  // returns vA . vB
  let res = 0;
  for (let i = 0; i < vA.length; i++) {
    res += vA[i] * vB[i];
  }
  return res;
}

crossProduct = function(vA, vB) {
  // vA, vB are supposed compatible-vectors, no check is done here.
  // returns vA x vB
  let vC = [];
  vC.push(vA[1] * vB[2] - vA[2] * vB[1]);
  vC.push(vA[2] * vB[0] - vA[0] * vB[2]);
  vC.push(vA[0] * vB[1] - vA[1] * vB[0]);
  return vC;
}

euclideanNorm = function(vA) {
  // returns the euclidean norm of a vector
  let res = 0;
  for (let i = 0; i < vA.length; i++) {
    res += vA[i] * vA[i];
  }
  return Math.sqrt(res);
}

limitNorm = function(vA, normLimit) {
  let norm = euclideanNorm(vA);
  let k = normLimit / norm;

  if (k <= 1) {
    return [vA[0] * k, vA[1] * k];
  } else {
    return vA;
  }
}

geographicalVector = function(lambda, phi) {
  // return vA as cartesian unit-vector
  let cphi = Math.cos(phi);
  let sphi = Math.sin(phi);
  let clam = Math.cos(lambda);
  let slam = Math.sin(lambda);
  return [clam * cphi, slam * cphi, sphi];
}



Projection = function(projObj) {
  // ProjectionSurface: none, Cylinder, Cone, Plane
  // Aspect: Normal, Transverse, Oblique

  this.title = projObj.title;
  this.prop = projObj.prop;
  this.func = projObj.func;

  this.lambda0 = 0;
  this.phi0 = 0;
  this.center = [0, 0];

  this.description = function() {

    var round = function(x) {
      return Number.parseFloat(x).toFixed(2);
    };
    let lam = "lambda"; //String.fromCharCode(955);
    let phi = "phi"; //String.fromCharCode(981);
    return `{${lam}0: ${round(this.lambda0)}, ${phi}0: ${round(this.phi0)}}`;
  };

  this.setProj = function(lambda, phi) {
    this.lambda0 = lambda;
    this.phi0 = phi;
    this.center = this.func(lambda, phi, lambda, phi);
  }

  this.proj = function(lambda, phi) {
    let res = this.func(lambda, phi, this.lambda0, this.phi0);
    res[0] -= this.center[0];
    res[1] -= this.center[1];
    return res;
  }
};


var ListOfProjections = [];
let proj;
// // format of proj:
// proj = {
//   title: "",
//   prop: "",
//   func: function(lambda, phi, lambda0, phi0) {}
// };
// ListOfProjections.push(new Projection(proj));


//==============================================================================
proj = {
  title: "Orthographic",
  prop: "",
  func: function(lambda, phi, lambda0, phi0) {
    lambda *= deg_rad;
    phi *= deg_rad;

    phi0 *= deg_rad;
    lambda0 *= deg_rad;

    let slam = Math.sin(lambda - lambda0);
    let clam = Math.cos(lambda - lambda0);
    let cphi = Math.cos(phi);
    let sphi = Math.sin(phi);
    let cphi0 = Math.cos(phi0);
    let sphi0 = Math.sin(phi0);

    let x = cphi * slam;
    let y = (cphi0 * sphi - sphi0 * cphi * clam);

    let cc = sphi0 * sphi + cphi0 * cphi * clam;
    if (cc < 0) {
      let n = Math.sqrt(x * x + y * y);
      x /= n;
      y /= n;
    }
    let r = rad_deg;

    x *= r;
    y *= -r;
    return [x, y];
  }
};
ListOfProjections.push(new Projection(proj));


//==============================================================================
proj = {
  title: "Equirectangular",
  prop: "",
  func: function(lambda, phi, lambda0, phi0) {
    let x = lambda;
    let y = -phi;
    return [x, y];
  }
};
ListOfProjections.push(new Projection(proj));

//==============================================================================
proj = {
  title: "Mercator",
  prop: "",
  func: function(lambda, phi, lambda0, phi0) {
    phi = Math.min(89, Math.max(-89, phi));
    let x = lambda;
    let y = Math.log(Math.tan((45 + phi / 2) * deg_rad));
    y *= -rad_deg;
    return [x, y];
  }
};
ListOfProjections.push(new Projection(proj));

//==============================================================================
proj = {
  title: "Bonne",
  prop: "",
  func: function(lambda, phi, lambda0, phi0) {
    let dlambda = (lambda - lambda0) * deg_rad;
    phi = (phi == 0) ? 0.1 : Math.min(89.9, Math.max(-89.9, phi));
    phi *= deg_rad;

    let phi1 = (phi0 == 0) ? 0.1 : Math.min(89.9, Math.max(-89.9, phi0));
    phi1 *= deg_rad;

    let cotphi1 = 1 / Math.tan(phi1);
    let rho = cotphi1 + phi1 - phi;
    let e = (dlambda) / rho * Math.cos(phi);

    let k = rad_deg;
    let x = k * (rho * Math.sin(e));
    let y = -k * (cotphi1 - rho * Math.cos(e));

    return [x, y];
  }
};
ListOfProjections.push(new Projection(proj));

//==============================================================================
proj = {
  title: "Gall - stereographic",
  prop: "",
  func: function(lambda, phi, lambda0, phi0) {
    lambda *= deg_rad;
    phi *= deg_rad;

    let sqr2 = Math.sqrt(2);

    let r = sqr2 * rad_deg;
    let x = r * lambda / sqr2;
    let y = Math.tan(phi / 2);
    y *= -r * (1 + sqr2 / 2);
    return [x, y];
  }
};
ListOfProjections.push(new Projection(proj));

//==============================================================================
proj = {
  title: "Lambert - cylindrical",
  prop: "",
  func: function(lambda, phi, lambda0, phi0) {
    let x = lambda;
    let y = Math.sin(phi * deg_rad);
    y *= -rad_deg;
    return [x, y];
  }
};
ListOfProjections.push(new Projection(proj));

//==============================================================================
proj = {
  title: "Eckert II",
  prop: "",
  func: function(lambda, phi, lambda0, phi0) {
    lambda -= lambda0;
    lambda *= deg_rad;
    phi *= deg_rad;
    let sin_phi = Math.sin(Math.abs(phi));

    let r = (90 / Math.PI) / Math.sqrt(4 / (6 * Math.PI));
    let x = 2 * r * lambda * Math.sqrt((4 - 3 * sin_phi) / (6 * Math.PI));
    let y = Math.sign(phi) * (2 - Math.sqrt(4 - 3 * sin_phi));
    y *= -r * Math.sqrt(2 * Math.PI / 3);
    return [x, y];
  }
};
ListOfProjections.push(new Projection(proj));

//==============================================================================
proj = {
  title: "Sinusoidal",
  prop: "",
  func: function(lambda, phi, lambda0, phi0) {
    let x = lambda * Math.cos(phi * deg_rad);
    let y = -phi;
    return [x, y];
  }
};
ListOfProjections.push(new Projection(proj));

//==============================================================================
proj = {
  title: "Mollweide",
  prop: "",
  func: function(lambda, phi, lambda0, phi0) {
    lambda *= deg_rad;
    phi *= deg_rad;

    let teta = 0;
    if (Math.abs(phi) > Math.PI / 2 - 0.0001) {
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
    let sqr2 = Math.sqrt(2);
    let r = 180 / (2 * sqr2);
    let x = r * 2 * sqr2 / Math.PI * (lambda - 0) * Math.cos(teta);
    let y = -r * sqr2 * Math.sin(teta);

    return [x, y];
  }
};
ListOfProjections.push(new Projection(proj));

//==============================================================================
proj = {
  title: "Winkel - Tripel",
  prop: "",
  func: function(lambda, phi, lambda0, phi0) {
    lambda *= deg_rad;
    phi *= deg_rad;

    let alpha = Math.acos(Math.cos(phi) * Math.cos(lambda / 2));
    let phi1 = Math.acos(2 / Math.PI);

    let sinc_alpha = alpha == 0 ? 1 : Math.sin(alpha) / alpha;

    let r = rad_deg;
    let x = r * (lambda * Math.cos(phi1) + 2 * Math.cos(phi) * Math.sin(lambda / 2) / sinc_alpha) / 2;
    let y = -r * (phi + Math.sin(phi) / sinc_alpha) / 2;

    return [x, y];
  }
};
ListOfProjections.push(new Projection(proj));

//==============================================================================
proj = {
  title: "Stereographic",
  prop: "",
  func: function(lambda, phi, lambda0, phi0) {
    phi = Math.max(phi, -89);
    phi = Math.min(phi, 89);
    lambda *= deg_rad;
    phi *= deg_rad;

    lambda0 *= deg_rad;
    phi0 *= deg_rad;

    let cphi = Math.cos(phi);
    let sphi = Math.sin(phi);
    let clam = Math.cos(lambda);
    let slam = Math.sin(lambda);

    let pt = geographicalVector(lambda, phi);

    let cphi0 = Math.cos(phi0);
    let sphi0 = Math.sin(phi0);
    let clam0 = Math.cos(lambda0);
    let slam0 = Math.sin(lambda0);

    let u = [-slam0, clam0, 0];
    let v = [-sphi0 * clam0, -sphi0 * slam0, cphi0];
    let w = [-cphi0 * clam0, -cphi0 * slam0, -sphi0];

    let x_ = dotProduct(u, pt);
    let y_ = dotProduct(v, pt);
    let z_ = dotProduct(w, pt);

    let r = 90;
    let x = r * x_ / (1 - z_);
    let y = -r * y_ / (1 - z_);

    return limitNorm([x, y], 250);
  }
};
ListOfProjections.push(new Projection(proj));

var vMin = 1000;
var vMax = -1000;

//==============================================================================
proj = {
  title: "Azimuthal equidistant",
  prop: "",
  func: function(lambda, phi, lambda0, phi0) {
    let dlambda = lambda - lambda0;
    while (dlambda < -180) {
      dlambda += 360;
    }
    while (dlambda > 180) {
      dlambda -= 360;
    }
    lambda *= deg_rad;
    phi *= deg_rad;
    lambda0 *= deg_rad;
    phi0 *= deg_rad;

    let cphi0 = Math.cos(phi0);
    let sphi0 = Math.sin(phi0);
    let clam0 = Math.cos(lambda0);
    let slam0 = Math.sin(lambda0);

    // let u = [-slam0, clam0, 0];
    let v = [-sphi0 * clam0, -sphi0 * slam0, cphi0];
    // let w = [-cphi0 * clam0, -cphi0 * slam0, -sphi0];

    let vOP = geographicalVector(lambda, phi);
    let vON = geographicalVector(lambda0, phi0);

    let rho = Math.acos(dotProduct(vOP, vON));
    rho = Math.min(rho, Math.PI * 0.8);

    let vN = crossProduct(vOP, vON);
    let vNP = crossProduct(vN, vON);
    let nNP = euclideanNorm(vNP);

    if (nNP < 0.00001) {
      var x = 0;
      var y = 0;
    } else {
      let ctheta = Math.max(-1, Math.min(dotProduct(vNP, v) / nNP, 1));
      let theta = Math.acos(ctheta) * Math.sign(dlambda);
      var x = rho * Math.sin(theta);
      var y = rho * Math.cos(theta);
      x *= rad_deg;
      y *= rad_deg;
    }
    return [x, y];
  }
};
ListOfProjections.push(new Projection(proj));

//==============================================================================
proj = {
  title: "Lambert conformal conic",
  prop: "",
  func: function(lambda, phi, lambda0, phi0) {
    let dphi = 0;
    let dphi2 = 90;
    phi0 = Math.max(-89 + dphi, Math.min(phi0, 89 - dphi));

    phi = Math.min(89, Math.max(-89, phi));
    phi = Math.min(phi0 + dphi2, Math.max(phi0 - dphi2, phi));


    let phi1 = phi0 - dphi;
    let phi2 = phi0 + dphi;


    lambda *= deg_rad;
    phi *= deg_rad;
    lambda0 *= deg_rad;
    phi0 *= deg_rad;

    phi1 *= deg_rad;
    phi2 *= deg_rad;

    let n_;
    if (dphi == 0) {
      n_ = Math.sin(phi1);
    } else {
      n_ = Math.tan(Math.PI / 4 + phi1 / 2);
      n_ = 1 / n_;
      n_ *= Math.tan(Math.PI / 4 + phi2 / 2);
      n_ = Math.log(n_);
      n_ = 1 / n_;
      n_ *= Math.log(Math.cos(phi1) / Math.cos(phi2));
    }

    let f_ = Math.pow(Math.tan(Math.PI / 4 + phi1 / 2), n_);
    f_ *= (Math.cos(phi1) / n_);

    let rho = Math.tan(Math.PI / 4 + phi / 2);
    rho = 1 / rho;
    rho = f_ * Math.pow(rho, n_);

    let rho0 = Math.tan(Math.PI / 4 + phi0 / 2);
    rho0 = 1 / rho0;
    rho0 = f_ * Math.pow(rho0, n_);

    let x = rho * Math.sin(n_ * (lambda - lambda0));
    let y = rho0 - rho * Math.cos(n_ * (lambda - lambda0));

    x *= rad_deg;
    y *= rad_deg;

    // if (isNaN(x) || isNaN(y)) {
    //   console.log(lambda, phi, lambda0, phi0);
    // }
    return [x, -y];
  }
};
ListOfProjections.push(new Projection(proj));


//==============================================================================
// // ,
// //
// // Craig = function(lambda, phi, lambda0, phi0) {
// //   lambda *= deg_rad;
// //   phi *= deg_rad;
// //
// //   let lambda0 = 0;
// //   let phi0 = 10 * rad_deg;
// //   let r = rad_deg;
// //   let x = (lambda - lambda0);
// //   let y = Math.sin(phi) * Math.cos(x) - Math.tan(phi0) * Math.cos(phi);
// //   if (Math.abs(Math.sin(x)) > 0.001) {
// //     y *= x / Math.sin(x);
// //   }
// //
// //   x *= r;
// //   y *= -r;
// //
// //   return [x, y];
// // }
// ];