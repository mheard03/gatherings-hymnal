import Color from "./jch/jch-color";
import { getBsGray, getJ } from "./neutral-palette-scale-utils";
import Palette from "./palette";
import { scaleLinear } from "d3-scale";
import { range } from "d3-array";
const d3 = Object.assign({}, { range, scaleLinear });
let np;

function boundsContains(array, value) {
  return (value > Math.min(...array) && value < Math.max(...array));
}

class NeutralPalette extends Palette {
  static {
    const np = NeutralPalette;
    np.gray600 = getBsGray(600);
    np.defaultJRange = [ 0, np.gray600.J, 100 ]
    np.defaultCRange = [ 0, np.gray600.C ];
  }

  constructor(colorDefinition, paletteOptions = {}) {
    super(colorDefinition, paletteOptions);
    
    let cRange = paletteOptions.cRange ?? np.defaultCRange;
    if (cRange.length != 2) throw new Error("options.cRange must be of length 2");
    cRange = cRange.map(c => Math.min(c, this.apex.C));
    this.cScale = d3.scaleLinear().domain(np.defaultCRange).range(cRange).clamp(true);

    let jRange = paletteOptions.jRange ?? [0, 100];
    if (jRange.length == 2) jRange = [jRange[0], np.gray600.J, jRange[1]];
    if (jRange.length != 3) throw new Error("options.jRange must be of length 2 or 3");
    this.jScale = d3.scaleLinear().domain(np.defaultJRange).range(jRange).clamp(true);

    let minC = Math.min(...cRange);
    let outOfBoundsJDomain = [0, ...jRange, 100];
    outOfBoundsJDomain.sort((a,b) => a - b);
    this.cFromOutOfBoundsJScale = d3.scaleLinear().domain(outOfBoundsJDomain).range([0, minC, minC, 0]);
  }

  bs(bsValue) {
    let result = getBsGray(bsValue, this.apex.h);
    result.C = this.cScale(result.C);
    result.J = this.jScale(result.J);
    return result.toGamut("srgb");
  }

  j(jValue) {
    let result = getJ(jValue, this.apex.h);
    if (boundsContains(this.jScale.range(), jValue)) {
      result.C = this.cScale(result.C);
    }
    else {
      result.C = this.cFromOutOfBoundsJScale(jValue);
    }
    return result.toGamut("srgb");
  }

  jOrVariable(jValue, tolerance = 5) {
    let exactJ = this.j(jValue);
    if (tolerance <= 0) return exactJ;

    let bsVariables = Object.entries(this.generateBootstrapVariables())
      .map(([name, color]) => ({ name, color, jDistance: Math.abs(jValue - color.J)}))
      .filter(o => o.jDistance < tolerance);
    bsVariables.sort((a,b) => a.jDistance - b.jDistance);

    return (bsVariables[0]) ? `var(${bsVariables[0].name})` : exactJ;
  }

  parseBootstrapVariable(bsVariable) {
    if (bsVariable instanceof Color) return bsVariable;

    let varMatch = /var\(([^\)]*)\)/gi.exec(bsVariable);
    if (varMatch) bsVariable = varMatch[1];
    let isValid = /^(--)?(white|black|gray-[\d]+)$/gi.test(bsVariable);
    if (!isValid) return;

    let last = bsVariable.split("-").slice(-1)[0];
    if (last == "white") return this.bs(0);
    if (last == "black") return this.bs(1000);
    return this.bs(parseInt(last));
  }

  generateBootstrapVariables() {
    let result = {};
    for (let bsValue of d3.range(0, 1001, 100)) {
      let name = "--gray-" + bsValue;
      if (bsValue == 0) name = "--white";
      if (bsValue == 1000) name = "--black";      
      result[name] = this.bs(bsValue);
    }
    return result;
  }
}

np = NeutralPalette;

export default NeutralPalette;