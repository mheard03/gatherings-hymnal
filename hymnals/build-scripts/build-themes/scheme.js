import Color from "./jch/cam16";
import Palette from "./palette";
import NeutralPalette from "./neutral-palette";

function hex(color) {
  return color.to("srgb").toGamut().toString({ format: "hex" });
}
function rgbCoords(color) {
  let coords = color.to("srgb").toGamut().coords;
  return coords.map(c => Math.round(255 * c)).join(", ");
}

class Scheme {
  constructor(hexOrColor, options) {
    this.corePalette = new Palette(hexOrColor, options);
    this.neutralPalette = new NeutralPalette(hexOrColor, options);
    this.bodyBg = new Color("#f8f6f2").to("jch");
    if (this.corePalette.bgJ < 50) {
      this.bodyBg = this.neutralPalette.getTintOrShadeAtLightJ(this.bodyBg.j);
    }
  }

  getBlackOrWhite(j) {
    let contrastingJ = (j < 50) ? 100 : 0;
    return this.neutralPalette.getTintOrShadeAtLightJ(contrastingJ);
  }

  getRootCssParams(prefix) {
    let params = {};
    params[`--${prefix}`] = hex(this.corePalette.apex);
    params[`--${prefix}-rgb`] = rgbCoords(this.corePalette.apex);
    return params;
  }

  getOwnCssParams() {
    let params = {};

    params["--ui-color"] = hex(this.corePalette.apex);
    params["--ui-color-rgb"] = rgbCoords(this.corePalette.apex);
    params["--ui-text-color"] = hex(this.getBlackOrWhite(this.corePalette.apex.j));
    params["--ui-outline-color"] = `rgba(${rgbCoords(this.corePalette.apex)}, 0.4)`;
    this.corePalette.getTints().forEach((tint, i) => {
      params[`--light-${i+1}`] = hex(tint);
    });
    this.corePalette.getShades().forEach((shade, i) => {
      params[`--dark-${i+1}`] = hex(shade);
    });
    Object.entries(this.neutralPalette.generateBootstrapGrays()).forEach(([key, value]) => {
      params[key] = hex(value);
    })

    return params;
  }
}




/*
const optionsOverrideNames = [ "light", "dark", "neutral" ];

function getOverriddenOptions(options, name) {
  if (!options) return undefined;
  
  let overriddenOptions = JSON.parse(JSON.stringify(options));
  optionsOverrideNames.forEach(n => delete overriddenOptions[n]);

  if (!name) 
  if (name && options[name]) {
    let overrides = JSON.parse(JSON.stringify(options[name]));
    Object.assign(overriddenOptions, overrides);
  }
  return overriddenOptions;
}
*/

export default Scheme;
