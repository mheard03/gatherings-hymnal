import Color from "./jch/jch-color";
import toneToJScale from "./jch/tone-scale";
import * as d3 from "d3-scale";

function clamp(value, range) {
  value = Math.max(value, Math.min(...range));
  value = Math.min(value, Math.max(...range));
  return value;
}

const lightJRange = [0, 100];

class PaletteBase {
  constructor(hexOrColor, options) {
    this.apex = new Color(hexOrColor).to("jch");

    // Read options
    options = options ?? {};
    this.absJForMaxLightJ = 100, this.absJForMinLightJ = 0;
    this.absJRange = [ this.absJForMinLightJ, this.absJForMaxLightJ ] = options.jRange ?? lightJRange;
    this.maxChroma = options.maxChroma ?? this.apex.c;
    this.minChroma = options.minChroma ?? 0;

    // Bring apex into bounds if needed
    this.apex.j = clamp(this.apex.j, this.absJRange);
    this.apex.c = Math.min(this.apex.c, this.maxChroma);
    this.apex.toGamut("srgb");

    // Derive a smarter default for options.minChroma if none was provided
    /*
    let isJRangeCompressed = !(this.absJRange.includes(0) && this.absJRange.includes(100));
    if (isJRangeCompressed && options.minChroma === undefined) {
      let jToChromaTmp = d3.scaleLinear()
        .domain([0, this.apex.j, 100])
        .range([0, this.apex.c, 0]);
      
      let chromaValuesAtAbsJBoundaries = this.absJRange.map(absJ => {
        let color = new Color("jch", [ absJ, jToChromaTmp(absJ), this.apex.h ]);
        return color.toGamut("srgb").c;
      });
      this.minChroma = chromaValuesAtAbsJBoundaries.reduce((a,b) => a + b) / 2;
    }
    */

    // lightJToAbsJScale
    this.lightJToAbsJScale = d3.scaleLinear()
      .domain(lightJRange)
      .range(this.absJRange)
      .clamp(true);

    // absJToCScale
    let absJToCTmp = d3.scaleLinear().domain([0, this.apex.j, 100]).range([0, this.apex.c, 0]);    
    let [cLeft, cRight] = this.absJRange.map(absJ => {
      let color = new Color("jch", [ absJ, absJToCTmp(absJ), this.apex.h ]);
      let chroma = color.toGamut("srgb").c;
      return Math.max(chroma, this.minChroma);
    });
    this.absJToCScale = d3.scaleLinear()
      .domain([this.absJForMinLightJ, this.apex.j, this.absJForMaxLightJ])
      .range([cLeft, this.maxChroma, cRight])
      .clamp(true);

    // range inverters
    const getRangeInverter = range => {
      let forwards = [...range];
      let backwards = [...range].reverse();
      return d3.scaleLinear().domain(forwards).range(backwards).clamp(true);
    }
    this.lightJInverter = getRangeInverter(lightJRange);
    this.absJInverter = getRangeInverter(this.absJRange);
  }

  getTextColorForAbsJ(absJ) {
    absJ = clamp(absJ, this.absJRange)
    let textJ = (absJ < 50) ? Math.max(...this.absJRange) : Math.min(...this.absJRange);
    return this.getTintOrShadeAtAbsJ(textJ);
  }

  getTintOrShadeAtAbsJ(absJ) {
    absJ = clamp(absJ, this.absJRange)
    let c = this.absJToCScale(absJ);
    return new Color('jch', [absJ, c, this.apex.h]).toGamut("srgb");
  }

  getMaxChromaAtAbsJ(absJ) {
    absJ = clamp(absJ, this.absJRange)
    let color = new Color("jch", [absJ, 150, this.apex.h]).toGamut("srgb");
    return color.c;
  }

  getInvertedAbsJ(absJ) {
    absJ = clamp(absJ, this.absJRange)
    return this.absJInverter(absJ);
  }

  getTextColorForLightJ(lightJ) {
    lightJ = clamp(lightJ, lightJRange);
    let jValue = this.lightJToAbsJScale(lightJ);
    return this.getTextColorForAbsJ(jValue);
  }

  getTintOrShadeAtLightJ(lightJ) {
    lightJ = clamp(lightJ, lightJRange);
    let jValue = this.lightJToAbsJScale(lightJ);
    return (this.getTintOrShadeAtAbsJ(jValue));
  }

  getMaxChromaAtLightJ(lightJ) {
    lightJ = clamp(lightJ, lightJRange);
    let absJ = this.lightJToAbsJScale(lightJ);
    return this.getMaxChromaAtAbsJ(absJ);
  }

  getInvertedLightJ(lightJ) {
    lightJ = clamp(lightJ, lightJRange);
    return this.lightJInverter(lightJ);
  }
}

export default PaletteBase;