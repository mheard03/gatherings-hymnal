import Color from "./jch/cam16";
import PaletteBase from "./palette-base";
import * as d3 from "d3-scale";

const bootstrapGrays = {
  "white": "#ffffff",
  "gray-100": "#f8f9fa",
  "gray-200": "#e9ecef",
  "gray-300": "#dee2e6",
  "gray-400": "#ced4da",
  "gray-500": "#adb5bd",
  "gray-600": "#6c757d",
  "gray-700": "#495057",
  "gray-800": "#343a40",
  "gray-900": "#212529",
  "black": "#000000",
};

let np;

class NeutralPalette extends PaletteBase {
  static {
    const np = NeutralPalette;
    np.jchGrayValues = Object.values(bootstrapGrays).map(hex => new Color(hex).to("jch"));
    np.defaultMaxChroma = Math.max(...np.jchGrayValues.map(jch => jch.c));
    np.bootstrapDomain = [...new Array(11)].map((e,i) => i * 100);    
  }

  constructor(hexOrColor, options = {}) {
    super(hexOrColor, options);

    this.bsToAbsJScale = d3.scaleLinear()
      .domain([0, 600, 1000])
      .range([100, np.jchGrayValues[6].j, 0])
      .clamp(true);

    if (options.maxChroma === undefined) {
      this.maxChroma = Math.min(np.defaultMaxChroma, (this.apex.c / 2));
    }

    let chromaDomain = np.bootstrapDomain.map(bs => this.bsToAbsJScale(bs));
    let chromaRange = [0, ...np.jchGrayValues.map(g => g.c).slice(1, -1), 0];
    chromaRange = this.transformRange(chromaRange, { min: this.minChroma, max: this.maxChroma });
    this.absJToCScale = d3.scaleLinear()
      .domain(chromaDomain)
      .range(chromaRange)
      .clamp(true);
  }

  transformRange(range, options = {}) {
    let currentMin = Math.min(...range);
    let currentMax = Math.max(...range);
    let newMin = options.min ?? currentMin;
    let newMax = options.max ?? currentMax;
    
    let invert = options.invert ?? false;
    if (invert) {
      let tmp = currentMin;
      currentMin = currentMax;
      currentMax = tmp;
    }

    let transformer = d3.scaleLinear().domain([currentMin, currentMax]).range([newMin, newMax]);
    return range.map(s => transformer(s));
  }

  bs(bsValue) {
    let j = this.bsToAbsJScale(bsValue);
    return this.getTintOrShadeAtAbsJ(j);
  }

  generateBootstrapGrays() {
    let result = {};
    for (let bsValue of np.bootstrapDomain) {
      let name = "--gray-" + Math.round(bsValue).toString().padStart(3, "0");
      if (bsValue == 0) name = "--white";
      if (bsValue == 1000) name = "--black";
      
      result[name] = this.bs(bsValue);
    }
    return result;
  }
}

np = NeutralPalette;

export default NeutralPalette;