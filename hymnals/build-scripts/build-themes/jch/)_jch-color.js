import Color from "./colorjs.io";
import * as d3 from "d3-scale";

const jMax = new Color("#ffffff").to("jzczhz").jz
const jScale = d3.scaleLinear().domain([0, jMax]).range([0, 100]);

const cMax = 0.2
const cScale = d3.scaleLinear().domain([0, cMax]).range([0, 100]);

const srgbHex = Color.spaces.srgb.formats.hex;

const jchOptions = {
  id: 'jch',
  name: 'Jch',
  coords: {
    j: {
      refRange: jScale.range(),
      name: "J",
    },
    c: {
      refRange: cScale.range(),
      name: "Chroma",
    },
    h: {
      refRange: [0, 360],
      type: "angle",
      name: "Hue",
    }
  },
  base: 'jzczhz',
  fromBase(jzczhz) {
    let [jz, cz, hz] = jzczhz;
    return [jScale(jz), cScale(cz), hz];
  },
  toBase(jch) {
    return [jScale.invert(jch[0]), cScale.invert(jch[1]), jch[2]];
  },
  formats: {
    color: {},
    hex: {
      type: "custom",
      toGamut: false,
      test: srgbHex.test,
      parse (str) {
        let srgb = srgbHex.parse(str);
        return srgb.to("jch");
      },
      serialize: (coords, alpha, {
        collapse = true // collapse to 3-4 digit hex when possible?
      } = {}) => {
        let srgb = new Color("jch", coords, alpha).to("srgb").toGamut();
        return srgbHex.serialize(srgb.coords, srgb.alpha, collapse);
      }
    }
  }
};
Color.Space.register('jch', new Color.Space(jchOptions));

Color.defaults.gamut_mapping = 'jch.c';
Color.defaults.interpolationSpace = 'jch';

export default Color;