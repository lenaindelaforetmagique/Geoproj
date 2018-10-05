var deg_rad = Math.PI / 180;
var rad_deg = 180 / Math.PI;

Projection = function(title, prop = []) {
  // ProjectionSurface: none, Cylinder, Cone, Plane
  // Aspect: Normal, Transverse, Oblique

  this.title = title;
  this.properties = prop;

  this.description = function() {
    return `lambda0:${this.lambda0}, phi0:${this.phi0}, theta:${this.theta}`;
  };

  this.lambda0 = 0;
  this.phi0 = 0;
  this.theta = 0;

  this.rotate = function(vect) {
    let ct = Math.cos(this.theta * deg_rad);
    let st = Math.sin(this.theta * deg_rad);
    return [ct * vect[0] + st * vect[1], -st * vect[0] + ct * vect[1]];
  }
};


var ListOfProjections = [];

//==============================================================================
let Orthographic = new Projection("Orthographic");
Orthographic.func = function(lambda, phi) {
  lambda *= deg_rad;
  phi *= deg_rad;

  let phi0 = Orthographic.phi0 * deg_rad;
  let lambda0 = Orthographic.lambda0 * deg_rad;

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
    let n = Math.pow(x * x + y * y, 0.5);
    x /= n;
    y /= n;
  }
  let r = rad_deg;

  x *= r;
  y *= -r;
  return [x, y];
};
ListOfProjections.push(Orthographic);

//==============================================================================
let Equirectangular = new Projection("Equirectangular", ["conique", "conforme", "ti"]);
Equirectangular.func = function(lambda, phi) {
  let x = lambda - Equirectangular.lambda0;
  let y = -phi;
  return Equirectangular.rotate([x, y]);
};
ListOfProjections.push(Equirectangular);

//==============================================================================
let Mercator = new Projection("Mercator");
Mercator.func = function(lambda, phi) {
  phi = Math.min(89, Math.max(-89, phi));
  let x = lambda;
  let y = -Math.log(Math.tan((45 + phi / 2) * deg_rad)) * rad_deg;

  return Mercator.rotate([x, y]);
};
ListOfProjections.push(Mercator);

//==============================================================================
let Bonne = new Projection("Bonne");
Bonne.phi0 = 45;
Bonne.func = function(lambda, phi) {
  lambda = (lambda - Bonne.lambda0) * deg_rad;
  phi *= deg_rad;

  let phi1 = Bonne.phi0 * deg_rad;
  let rho = 1 / Math.tan(phi1) + phi1 - phi;

  // console.log(rho);
  let e = (lambda) / rho * Math.cos(phi);

  let y0 = (1 / Math.tan(phi1) - (1 / Math.tan(phi1) + phi1))
  let k = rad_deg;
  let x = k * (rho * Math.sin(e));
  let y = -k * (1 / Math.tan(phi1) - rho * Math.cos(e) - y0);

  return Bonne.rotate([x, y]);
};
ListOfProjections.push(Bonne);

//==============================================================================
let Gall_stereographic = new Projection("Gall - stereographic");
Gall_stereographic.func = function(lambda, phi) {
  lambda *= deg_rad;
  phi *= deg_rad;

  let sqr2 = Math.pow(2, 0.5);

  let r = sqr2 * rad_deg;
  let x = r * lambda / sqr2;
  let y = -r * (1 + sqr2 / 2) * Math.tan(phi / 2);
  return Gall_stereographic.rotate([x, y]);
};
ListOfProjections.push(Gall_stereographic);

//==============================================================================
let Lambert_cylindrical = new Projection("Lambert - cylindrical");
Lambert_cylindrical.func = function(lambda, phi) {
  let x = lambda;
  let y = -(rad_deg) * Math.sin(phi * deg_rad);
  return Lambert_cylindrical.rotate([x, y]);
};
ListOfProjections.push(Lambert_cylindrical);

//==============================================================================
let Eckert_II = new Projection("Eckert II");
Eckert_II.func = function(lambda, phi) {
  lambda *= deg_rad;
  phi *= deg_rad;
  let sin_phi = Math.sin(Math.abs(phi));
  let r = (90 / Math.PI) / Math.pow(4 / (6 * Math.PI), 0.5);
  let x = 2 * r * (lambda - Eckert_II.lambda0 * deg_rad) * Math.pow((4 - 3 * sin_phi) / (6 * Math.PI), 0.5);
  let y = -Math.sign(phi) * r * Math.pow(2 * Math.PI / 3, 0.5) * (2 - Math.pow(4 - 3 * sin_phi, 0.5));
  return Eckert_II.rotate([x, y]);
}
ListOfProjections.push(Eckert_II);

//==============================================================================
let Sinusoidal = new Projection("Sinusoidal");
Sinusoidal.func = function(lambda, phi) {
  let x = lambda * Math.cos(phi * deg_rad);
  let y = -phi;
  return Sinusoidal.rotate([x, y]);
};
ListOfProjections.push(Sinusoidal);

//==============================================================================
let Mollweide = new Projection("Mollweide");
Mollweide.func = function(lambda, phi) {
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
  let r = 180 / (2 * Math.pow(2, 0.5));
  let x = r * 2 * Math.pow(2, 0.5) / Math.PI * (lambda - 0) * Math.cos(teta);
  let y = -r * Math.pow(2, 0.5) * Math.sin(teta);

  return Mollweide.rotate([x, y]);
};
ListOfProjections.push(Mollweide);

//==============================================================================
let Winkel_Tripel = new Projection("Winkel - Tripel");
Winkel_Tripel.func = function(lambda, phi) {
  lambda *= deg_rad;
  phi *= deg_rad;

  let alpha = Math.acos(Math.cos(phi) * Math.cos(lambda / 2));
  let phi1 = Math.acos(2 / Math.PI);

  let sinc_alpha = alpha == 0 ? 1 : Math.sin(alpha) / alpha;

  let r = rad_deg;
  let x = r * (lambda * Math.cos(phi1) + 2 * Math.cos(phi) * Math.sin(lambda / 2) / sinc_alpha) / 2;
  let y = -r * (phi + Math.sin(phi) / sinc_alpha) / 2;

  return Winkel_Tripel.rotate([x, y]);
};
ListOfProjections.push(Winkel_Tripel);

//==============================================================================
let Stereographic = new Projection("Stereographic");
Stereographic.func = function(lambda, phi) {
  phi = Math.max(phi, -80);
  lambda *= deg_rad;
  phi *= deg_rad;

  let x_ = Math.cos(lambda) * Math.cos(phi);
  let y_ = Math.sin(lambda) * Math.cos(phi);
  let z_ = -Math.sin(phi);

  let r = 90;
  let y = r * (x_ / (1 - z_) - 1);
  let x = r * (y_ / (1 - z_) - 0);

  return Stereographic.rotate([x, y]);
};
ListOfProjections.push(Stereographic);

//==============================================================================
let Postel = new Projection("Azimuthal_equidistant_projection");
Postel.phi0 = 90;
Postel.lambda0 = 0;
Postel.func = function(lambda, phi) {
  lambda *= deg_rad;
  phi *= deg_rad;
  // let phi1 = Postel.phi0 * deg_rad;
  // let lambda0 = Postel.lambda0 * deg_rad;
  //
  // let rho = Math.sin(phi1) * Math.sin(phi)
  // rho += Math.cos(phi1) * Math.cos(phi) * Math.cos(lambda - lambda0);
  // rho = Math.acos(rho);
  //
  // let theta = Math.cos(phi1) * Math.sin(phi);
  // theta += -Math.sin(phi1) * Math.cos(phi) * Math.cos(lambda - lambda0);
  // theta = Math.cos(phi) * Math.sin(lambda - lambda0) / theta;
  // theta = Math.atan(theta);
  // // console.log(theta);
  //
  // if (Math.abs(lambda - lambda0) > Math.PI / 2) {
  //   theta += Math.PI;
  // }
  let r = 90;
  let rho = Math.PI / 2 - phi;
  let theta = lambda;
  let x = r * rho * Math.sin(theta);
  let y = r * (rho * Math.cos(theta) - Math.PI / 2);
  // console.log(x, y);
  return Postel.rotate([x, y]);
};

ListOfProjections.push(Postel);

//==============================================================================
// // ,
// //
// // Craig = function(lambda, phi) {
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