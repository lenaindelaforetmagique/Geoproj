var ListOfProjections = [
  EquiRectangular = function(lambda, phi) {
    return [lambda, -phi];
  },

  Mercator = function(lambda, phi) {
    // let lambda = coordinates[0];
    // let phi = coordinates[1];
    let x = lambda;

    phi = Math.min(89, Math.max(-89, phi));

    let y = -360 / (2 * Math.PI) * Math.log(Math.tan((45 + phi / 2) * Math.PI / 180));

    return [x, y];
  },

  Bonne = function(lambda, phi) {
    lambda *= Math.PI / 180;
    phi *= Math.PI / 180;

    let phi1 = Math.PI / 4;

    let rho = 1 / Math.tan(phi1) + phi1 - phi;
    // console.log(rho);
    let e = (lambda - 0) / rho * Math.cos(phi);

    let y0 = (1 / Math.tan(phi1) - (1 / Math.tan(phi1) + phi1))
    let k = 180 / Math.PI;
    let x = k * (rho * Math.sin(e));
    let y = -k * (1 / Math.tan(phi1) - rho * Math.cos(e) - y0);

    return [x, y];
  },

  // Gall_stereographic = function(coordinates) {
  //   let lambda = coordinates[0];
  //   let phi = coordinates[1] * Math.PI / 180;
  //
  //   let r = 1 * Math.pow(2, 0.5);
  //   let x = r * lambda / Math.pow(2, 0.5);
  //   let y = -45 * r * (1 + Math.pow(2, 0.5) / 2) * Math.tan(phi / 2);
  //   return [x, y];
  // },

  Lambert_cylindrical = function(lambda, phi) {
    let x = lambda;
    let y = -(180 / Math.PI) * Math.sin(phi * Math.PI / 180);
    return [x, y];
  },

  Sinusoidal = function(lambda, phi) {
    let x = lambda * Math.cos(phi * Math.PI / 180);
    let y = -phi;
    return [x, y];
  },

  Mollweide = function(lambda, phi) {
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

    return [x, y];
  }
];