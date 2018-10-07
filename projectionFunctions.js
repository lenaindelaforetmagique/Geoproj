const deg_rad = Math.PI / 180;
const rad_deg = 180 / Math.PI;

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
  prop: "jolie",
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
  prop: "belle",
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
    phi = Math.max(phi, -80);
    lambda -= lambda0;
    lambda *= deg_rad;
    phi *= deg_rad;

    let x_ = Math.cos(lambda) * Math.cos(phi);
    let y_ = Math.sin(lambda) * Math.cos(phi);
    let z_ = -Math.sin(phi);

    let r = 90;
    let y = r * (x_ / (1 - z_) - 1);
    let x = r * (y_ / (1 - z_) - 0);

    return [x, y];
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

    var ortho = function(lambda, phi, lambda0, phi0) {
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
    };

    var res0 = ortho(lambda0, phi0, lambda0, phi0);
    var res1 = ortho(lambda, phi, lambda0, phi0);
    var res = [res1[0] - res0[0], res1[1] - res0[1]];

    lambda -= lambda0
    lambda *= deg_rad;
    phi *= deg_rad;
    phi0 *= deg_rad;

    let rho = Math.sin(phi0) * Math.sin(phi)
    rho += Math.cos(phi0) * Math.cos(phi) * Math.cos(lambda);
    rho = Math.acos(rho);
    // rho = Math.abs(rho);

    let theta = Math.cos(phi0) * Math.sin(phi);
    theta -= Math.sin(phi0) * Math.cos(phi) * Math.cos(lambda);
    theta = Math.cos(phi) * Math.sin(lambda) / theta;
    theta = Math.atan(theta);

    if (Number.isNaN(theta)) {
      var x = 0;
      var y = 0;
    } else {
      // theta = Math.pow(theta, 2);
      // let sin_theta = Math.sqrt(theta / (1 + theta));
      // let cos_theta = Math.sqrt(1 / (1 + theta));
      let sin_theta = Math.sin(theta);
      let cos_theta = Math.cos(theta);

      var x = -rho * sin_theta;
      var y = -rho * cos_theta;
    }

    // sign correction with ortho result, ugly but works...
    if (res[1] > 0) {
      y *= -1;
    } else {
      x *= -1;
    }

    x *= rad_deg;
    y *= rad_deg;

    return [x, y];
  }
};
ListOfProjections.push(new Projection(proj));


// let r = 90;
// let rho = Math.PI / 2 - phi;
// let theta = lambda;
// let x = r * rho * Math.sin(theta);
// let y = r * (rho * Math.cos(theta) - Math.PI / 2);
// console.log(x, y);


// ListOfProjections.push(Postel);

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