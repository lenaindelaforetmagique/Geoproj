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
    let ct = Math.cos(this.theta * Math.PI / 180);
    let st = Math.sin(this.theta * Math.PI / 180);
    return [ct * vect[0] + st * vect[1], -st * vect[0] + ct * vect[1]];
  }
};

var ListOfProjections = [];

let Equirectangular = new Projection("Equirectangular", ["conique", "conforme", "ti"]);
Equirectangular.func = function(lambda, phi) {
  let x = lambda - Equirectangular.lambda0;
  let y = -phi;
  return Equirectangular.rotate([x, y]);
};
ListOfProjections.push(Equirectangular);

let Mercator = new Projection("Mercator");
Mercator.func = function(lambda, phi) {

  phi = Math.min(89, Math.max(-89, phi));
  let x = lambda;
  let y = -Math.log(Math.tan((45 + phi / 2) * Math.PI / 180)) * 180 / Math.PI;

  return Mercator.rotate([x, y]);
};
ListOfProjections.push(Mercator);

let Bonne = new Projection("Bonne");
Bonne.phi0 = 45;
Bonne.func = function(lambda, phi) {
  lambda = (lambda - Bonne.lambda0) * Math.PI / 180;
  phi *= Math.PI / 180;

  let phi1 = Bonne.phi0 * Math.PI / 180;
  let rho = 1 / Math.tan(phi1) + phi1 - phi;

  // console.log(rho);
  let e = (lambda) / rho * Math.cos(phi);

  let y0 = (1 / Math.tan(phi1) - (1 / Math.tan(phi1) + phi1))
  let k = 180 / Math.PI;
  let x = k * (rho * Math.sin(e));
  let y = -k * (1 / Math.tan(phi1) - rho * Math.cos(e) - y0);

  return Bonne.rotate([x, y]);
};
ListOfProjections.push(Bonne);

let Gall_stereographic = new Projection("Gall - stereographic");
Gall_stereographic.func = function(lambda, phi) {
  lambda *= Math.PI / 180;
  phi *= Math.PI / 180;

  let sqr2 = Math.pow(2, 0.5);

  let r = sqr2 * 180 / Math.PI;
  let x = r * lambda / sqr2;
  let y = -r * (1 + sqr2 / 2) * Math.tan(phi / 2);
  return Gall_stereographic.rotate([x, y]);
};
ListOfProjections.push(Gall_stereographic);

let Lambert_cylindrical = new Projection("Lambert - cylindrical");
Lambert_cylindrical.func = function(lambda, phi) {
  let x = lambda;
  let y = -(180 / Math.PI) * Math.sin(phi * Math.PI / 180);
  return Lambert_cylindrical.rotate([x, y]);
};
ListOfProjections.push(Lambert_cylindrical);

let Sinusoidal = new Projection("Sinusoidal");
Sinusoidal.func = function(lambda, phi) {
  let x = lambda * Math.cos(phi * Math.PI / 180);
  let y = -phi;
  return Sinusoidal.rotate([x, y]);
};
ListOfProjections.push(Sinusoidal);

let Mollweide = new Projection("Mollweide");
Mollweide.func = function(lambda, phi) {
  lambda *= Math.PI / 180;
  phi *= Math.PI / 180;

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


let Winkel_Tripel = new Projection("Winkel - Tripel");
Winkel_Tripel.func = function(lambda, phi) {
  lambda *= Math.PI / 180;
  phi *= Math.PI / 180;

  let alpha = Math.acos(Math.cos(phi) * Math.cos(lambda / 2));
  let phi1 = Math.acos(2 / Math.PI);

  let sinc_alpha = alpha == 0 ? 1 : Math.sin(alpha) / alpha;

  let r = 180 / Math.PI;
  let x = r * (lambda * Math.cos(phi1) + 2 * Math.cos(phi) * Math.sin(lambda / 2) / sinc_alpha) / 2;
  let y = -r * (phi + Math.sin(phi) / sinc_alpha) / 2;

  return Winkel_Tripel.rotate([x, y]);
};
ListOfProjections.push(Winkel_Tripel);

let Stereographic = new Projection("Stereographic");
Stereographic.func = function(lambda, phi) {
  phi = Math.max(phi, -80);
  lambda *= Math.PI / 180;
  phi *= Math.PI / 180;

  let x_ = Math.cos(lambda) * Math.cos(phi);
  let y_ = Math.sin(lambda) * Math.cos(phi);
  let z_ = -Math.sin(phi);

  let r = 90;
  let y = r * (x_ / (1 - z_) - 1);
  let x = r * (y_ / (1 - z_) - 0);

  return Stereographic.rotate([x, y]);
};

ListOfProjections.push(Stereographic);
// // ,
// //
// // Craig = function(lambda, phi) {
// //   lambda *= Math.PI / 180;
// //   phi *= Math.PI / 180;
// //
// //   let lambda0 = 0;
// //   let phi0 = 10 * 180 / Math.PI;
// //   let r = 180 / Math.PI;
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