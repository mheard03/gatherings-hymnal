// CAM16 http://sci-hub.io/10.1002/col.22131
import Color from "./colorjs.io";
import * as d3 from "d3-scale";

/* Pre-calculated constants */
const [ X_w, Y_w, Z_w ] = Color.WHITES.D65.map(c => c * 100);
const Y_b = 18;
const L_A = 200;
const F = 1, c = 0.69000, N_c = 1;
const D = 0.979986908169821;
const D_r = 1.02455818961772, D_g = 0.984122103286929, D_b = 0.923418966708456;
const F_L = 1.00000000015737;
const n = 0.18, z = 1.90426406871193, N_bb = 1.02160616614564, N_cb = 1.02160616614564;
const A_w = 44.3038077040247;

function get_cone_response(cone) {
  const neg = (cone < 0) ? -1 : 1;
  const temp = Math.abs(cone * F_L) / 100;
  return 0.1 + (neg * 400) * Math.pow(temp, 0.42) / (Math.pow(temp, 0.42) + 27.13);
}
function getSign(x) {
  if (x == 0) return 0;
  return (x > 0) ? 1 : -1;
}
function get_adaptation(a) {
  const bracketed_num = (27.13 * Math.abs(a - 0.1));
  const bracketed_denom = (400 - Math.abs(a - 0.1));
  return getSign(a - 0.1) * (100 / F_L) * Math.pow(bracketed_num / bracketed_denom, 1 / 0.42);
}
function clampHue(h) {
  return (h % 360) + ((h < 0) ? 360 : 0);
}
function rawToUcs(rawJ) {
  // Appendix B: UCS J
  return (1.7 * rawJ) / (1 + 0.007 * rawJ);
}
function ucsToRaw(ucsJ) {
  // Appendix B: UCS J
  return (142.857 * ucsJ) / (242.857 - ucsJ);
}

const jab = {
  id: 'jab',
  name: 'Cam16 Jab',
  coords: {
    J: {
      range: [0, 100],
      name: "Lightness",
    },
    a: {
      range: [-6, 6],
      name: "Green/Red",
    },
    b: {
      range: [-6, 6],
      name: "Blue/Yellow",
    }
  },
  base: 'xyz',
  fromBase(xyz) {
    xyz = xyz.map(c => c * 100);

    // 1. Calculate cone responses
    const R = (xyz[0] *  0.401288) + (xyz[1] * 0.650173) + (xyz[2] * -0.051461);
    const G = (xyz[0] * -0.250268) + (xyz[1] * 1.204414) + (xyz[2] *  0.045854);
    const B = (xyz[0] * -0.002079) + (xyz[1] * 0.048952) + (xyz[2] *  0.953127);
    // console.log('RGB', [R, G, B]);

    // 2. Color adaptation of illuminant in cone response space
    const R_c = D_r * R;
    const G_c = D_g * G;
    const B_c = D_b * B;
    // console.log('RGB_c', [R_c, G_c, B_c]);

    // 3. Post-adaptation cone response
    const R_a = get_cone_response(R_c);
    const G_a = get_cone_response(G_c);
    const B_a = get_cone_response(B_c);
    // console.log('RGB_a', [R_a, G_a, B_a]);

    // 4. Calculate a and b
    const a = R_a - (12 * G_a) / 11 + B_a / 11;
    // console.log('R_a', R_a, 'a', a);
    const b = (R_a + G_a - (2 * B_a)) / 9;

    // 6. Calculate achromatic response A
    const A = (2 * R_a + G_a + B_a / 20 - 0.305) * N_bb;
    // console.log('A', A);
    
    // 7. Calculate correlate of lightness J
    const J = 100 * Math.pow((A / A_w), (c * z));
    return [ rawToUcs(J), a, b ];
  },
  toBase(jab) {
    let [ Jprime, a, b ] = jab;
    const J = ucsToRaw(Jprime);
    
    // 2. Calculate t, e_t, A, p_1, p_2, and p_3
    const A = A_w * Math.pow(J / 100, 1 / (c * z));
    // console.log('A', A);
    const p_2 = (A / N_bb) + 0.305

    // 4. Calculate R_a, G_a, and B_a
    const R_a = (460 / 1403) * p_2 + (451 / 1403) * a + (288 / 1403) * b;
    const G_a = (460 / 1403) * p_2 - (891 / 1403) * a - (261 / 1403) * b;
    const B_a = (460 / 1403) * p_2 - (220 / 1403) * a - (6300 / 1403) * b;
    // console.log('RGB_a', [R_a, G_a, B_a]);

    // 5. Calculate R_c, G_c, and B_c
    const R_c = get_adaptation(R_a);
    const G_c = get_adaptation(G_a);
    const B_c = get_adaptation(B_a);
    // console.log('RGB_c', [R_c, G_c, B_c]);

    // 6. Calculate R, G, and B from R_c, G_c, and B_c
    const R = R_c / D_r;
    const G = G_c / D_g;
    const B = B_c / D_b;
    // console.log('RGB', [R, G, B]);

    // 7. Calculate X, Y, and Z
    const X = (R *  1.86206786) + (G * -1.01125463) + (B *  0.14918677);
    const Y = (R *  0.38752654) + (G *  0.62144744) + (B * -0.00897398);
    const Z = (R * -0.01584150) + (G * -0.03412294) + (B *  1.04996444);

    // console.log('[X, Y, Z]', [X, Y, Z]);
    return [X, Y, Z].map(c => c / 100);
  }
};
Color.Space.register(jab.id, new Color.Space(jab));

const jch = {
  id: 'jch',
  name: 'Cam16-UCS JCh',
  coords: {
    J: {
      range: [0, 100],
      name: "Lightness",
    },
    C: {
      range: [0, 150],
      name: "Chroma",
    },
    h: {
      range: [0, 360],
      type: "angle",
      name: "Hue",
    }
  },
  base: 'jab',
  fromBase(jab) {
    const [ Jprime, a, b ] = jab;
    const J = ucsToRaw(Jprime);    

    // 4. Calculate h
    const hrad = Math.atan2(b, a);
    const h = clampHue(hrad * 180 / Math.PI);

    // console.log('hrad, [h, a, b]', hrad, [h, a, b]);

    // 5. Calculate eccentricity
    const hprime = h < 20.14 ? h + 360 : h;
    const hprimerad = hprime * Math.PI / 180;
    const e_t = 1 / 4 * (Math.cos(hprimerad + 2) + 3.8)
    // console.log('e_t', e_t);

    // 9a. Calculate the correlate of chroma C
    // (Some code borrowed from step 4 of the the reverse model)
    const A = A_w * Math.pow(J / 100, 1 / (c * z));
    const p_2 = (A / N_bb) + 0.305;
    const R_a = (460 / 1403) * p_2 + (451 / 1403) * a + (288 / 1403) * b;
    const G_a = (460 / 1403) * p_2 - (891 / 1403) * a - (261 / 1403) * b;
    const B_a = (460 / 1403) * p_2 - (220 / 1403) * a - (6300 / 1403) * b;
    const t = (((50000 / 13) * N_c * N_cb) * e_t * Math.sqrt(a * a + b * b)) / (R_a + G_a + (21 / 20) * B_a);
    const C = Math.pow(t, 0.9) * Math.sqrt(J / 100) * Math.pow((1.64 - Math.pow(0.29, n)), 0.73);

    return [ Jprime, C, h ];
  },
  toBase(jch) {
    var [ Jprime, C, h ] = jch;
    h = isNaN(h) ? 0 : h;
    const J = ucsToRaw(Jprime);
    // console.log('J, C, h', [ J, C, h ]);
    
    var a = 0, b = 0;
    var A = A_w * Math.pow(J / 100, 1 / (c * z));
    // console.log('A', A);
    var p_2 = (A / N_bb) + 0.305
  
    var t_denom = Math.sqrt(J / 100) * Math.pow(1.64 - Math.pow(0.29, n), 0.73);
    var t = Math.pow(C / t_denom, 1 / 0.9);
    // console.log('t', t);
  
    if (t != 0) {
      var hrad = h * Math.PI / 180;
      // console.log('hrad', hrad);
      var e_t = 1 / 4 * (Math.cos(hrad + 2) + 3.8);
      // console.log('e_t', e_t);
      var p_1 = ((50000 / 13) * N_c * N_cb) * e_t * (1 / t);
      var p_3 = 21 / 20;
      // console.log("p_1", p_1);
      // console.log("p_2", p_2);
      // console.log("p_3", p_3);
  
      // 3. Calculate a and b (skipped if t == 0)
      if (Math.abs(Math.sin(hrad)) >= Math.abs(Math.cos(hrad))) {
        var p_4 = p_1 / Math.sin(hrad);
        //console.log("p_4", p_4);
        var b_num = p_2 * (2 + p_3) * 460 / 1403
        var b_denom = p_4 + (2 + p_3) * (220 / 1403) * (Math.cos(hrad) / Math.sin(hrad)) - (27 / 1403) + p_3 * (6300 / 1403);
        b = b_num / b_denom;
        a = b * (Math.cos(hrad) / Math.sin(hrad));
      }
      else {
        var p_5 = p_1 / Math.cos(hrad);
        // console.log("p_5", p_5);
        var a_num = p_2 * (2 + p_3) * (460 / 1403);
        var a_denom_bracket = (27 / 1403) - p_3 * (6300 / 1403);
        var a_denom = p_5 + (2 + p_3) * (220 / 1403) - a_denom_bracket * (Math.sin(hrad) / Math.cos(hrad));
        a = a_num / a_denom;
        b = a * (Math.sin(hrad) / Math.cos(hrad));
      }
  
      // console.log('a, b', a, b);
    }

    return [ Jprime, a, b ];
  }
};
Color.Space.register(jch.id, new Color.Space(jch));
Color.defaults.gamut_mapping = 'jch.h';
Color.defaults.interpolationSpace = 'jch';

export default Color;