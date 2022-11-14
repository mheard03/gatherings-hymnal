import Color from "./jch/jch-color";
import * as d3 from "d3-scale";

function getJch(colorOrHex) {
  if (colorOrHex === undefined) return;
  return ((typeof(colorOrHex) == "string") ? new Color(colorOrHex) : colorOrHex).clone().to("jch");
}
function getJchHue(hslHueOrHex) {
  let hslHue = hslHueOrHex;
  if (typeof(hslHueOrHex) == "string") {
    hslHue = new Color(hslHueOrHex).to("hsl").h;
  }

  let hslColor = new Color("hsl", [hslHue, 100, 50]);
  return hslColor.to("jch").h;
}

function findPeak(colorOrHex, min, max) {
  let jch = getJch(colorOrHex);
  if (isNaN(jch.h)) return jch;

  min = min || new Color("jch", [0, 0, jch.h]);
  max = max || new Color("jch", [100, 0, jch.h]);
  const ε = 0.01;
  const mid = findMaxC(new Color("jch", [((min.J + max.J) / 2), 0, jch.h]));
  
  if (max.J - min.J < ε) return mid;
  if (max.C < mid.C && min.C < mid.C) {
    [ max, min ] = [ max, min ].map(c => findMaxC(c));
    const peak1 = findPeak(jch, min, mid);
    const peak2 = findPeak(jch, mid, max);
    return (peak1.C > peak2.C) ? peak1 : peak2;
  }
  else if (max.C < mid.C) {
    return findPeak(jch, min, mid);
  }
  else {
    return findPeak(jch, mid, max);
  }
}

function findMaxC(colorOrHex, leftC, rightC) {
  let jch = getJch(colorOrHex);
  if (isNaN(jch.h)) return jch;
  if (!rightC) {
    let space = Color.spaces.jch.coords.C;
    let [ leftC, rightC ] = (space.range || space.refRange);
    return findMaxC(jch, leftC, rightC).toGamut("srgb");
  }
  
  let mid = new Color("jch", [jch.J, ((leftC + rightC) / 2), jch.h]);
  
  if (Math.abs(rightC - leftC) < 0.01) {
    return mid.toGamut("srgb");
  }
  else if (mid.inGamut("jab") && mid.inGamut("srgb")) {
    return findMaxC(jch, mid.C, rightC);
  }
  else {
    return findMaxC(jch, leftC, mid.C);
  }
}

class Palette {
  constructor(colorDefinition, paletteOptions) {
    this.apex = Palette.readColor(colorDefinition);
    paletteOptions = paletteOptions ?? {};

    this.tintTarget = Palette.readColor(paletteOptions.tintTarget) ?? new Color("jch", [100, 0, this.apex.h]);
    this.shadeTarget = Palette.readColor(paletteOptions.shadeTarget) ?? new Color("jch", [0, 0, this.apex.h]);
    this.tintOrShadeStepCount = 5;
    this.tintOrShadeStepSize = 7;
  }

  /* colorDefinition can be...
      - A Color object
      - A string that colorjs.io can parse (including a hex value)
      - An object specifying a hex value { hex: "#000000" }
      - An object specifying an hsl hue { hue: 120 }  */
  static readColor(colorDefinition) {
    if (!colorDefinition) return;
    if (colorDefinition instanceof Color) return colorDefinition.to("jch");
    if (typeof(colorDefinition) == "string") {
      try {
        return new Color(colorDefinition).to("jch");
      }
      catch { 
        return;
      }
    }
    if (colorDefinition.hex !== undefined) return new Color(colorDefinition.hex).to("jch");
    if (colorDefinition.hue !== undefined) return findPeak(new Color("jch", [0, 0, getJchHue(colorDefinition.hue)]));
  }

  getTints(stepCount = this.tintOrShadeStepCount, maxStepSize = this.tintOrShadeStepSize) {
    let target = this.getFirstLegalTintOrShadeTarget([this.tintTarget, this.shadeTarget], stepCount, maxStepSize);
    return this.getTintsOrShades(target, stepCount, maxStepSize);
  }
  getShades(stepCount = this.tintOrShadeStepCount, maxStepSize = this.tintOrShadeStepSize) {
    let target = this.getFirstLegalTintOrShadeTarget([this.shadeTarget, this.tintTarget], stepCount, maxStepSize);
    return this.getTintsOrShades(target, stepCount, maxStepSize);
  }
  getFirstLegalTintOrShadeTarget(targets, stepCount, maxStepSize) {
    let minStepSize = Math.max(1.5, (maxStepSize / 3));
    let minRequiredDistance = Math.abs((stepCount + 2) * minStepSize);
    minRequiredDistance = Math.min(minRequiredDistance, 30);

    let availableDistances = [];
    for (let target of targets) {
      let availableDistance = Math.abs(this.apex.J - target.J);
      if (availableDistance > minRequiredDistance) return target;
      availableDistances.push(availableDistance);
    }

    let maxAvailableDistance = Math.max(...availableDistances);
    let i = availableDistances.findIndex(d => d == maxAvailableDistance);
    return targets[i];
  }

  getTintOrShade(j) {
    let cScale = d3.scaleLinear().domain([0, this.apex.J, 100]).range([0, this.apex.C, 0]);
    let result = new Color("jch", [j, cScale(j), this.apex.h]);
    return result.toGamut("srgb");
  }

  getTintsOrShades(target, stepCount = this.tintOrShadeStepCount, maxStepSize = this.tintOrShadeStepSize) {
    target = getJch(target);
    if (isNaN(target.h)) target.h = this.apex.h;
    
    // Commence to stepping
    let deltaJ = target.J - this.apex.J;
    maxStepSize = Math.abs(maxStepSize);
    let derivedStepSize = Math.abs(deltaJ) / (stepCount + 1);
    let finalStepSize = Math.min(maxStepSize, derivedStepSize) * Math.sign(deltaJ);
    let finalTargetJ = this.apex.J + finalStepSize * (stepCount + 1);

    let jToTargetDomain = [this.apex.J, target.J];
    let jToTargetCScale = d3.scaleLinear().domain(jToTargetDomain).range([this.apex.C, target.C]);
    let jToTargetHScale = (isNaN(this.apex.h)) ? x => NaN : d3.scaleLinear().domain(jToTargetDomain).range([this.apex.h, target.h]);

    let stepToJScale = d3.scaleLinear().domain([0, stepCount + 1]).range([this.apex.J, finalTargetJ]);
    // console.log('apexJ', apexJ, 'targetJ', target.J, 'deltaJ', deltaJ, 'finalTargetJ', finalTargetJ, 'finalStepSize', finalStepSize)
    let results = [];
    for (let step = 1; step <= stepCount; step++) {
      let jAtStep = stepToJScale(step);
      results.push(new Color("jch", [ jAtStep, jToTargetCScale(jAtStep), jToTargetHScale(jAtStep) ]));
    }
    return results;
  }

    
  static getJch(colorOrHex) {
    return getJch(colorOrHex);
  }
  static getJchHue(hslHueOrHex) {
    return getJchHue(hslHueOrHex);
  }
  static findPeak(colorOrHex) {
    return findPeak(colorOrHex);
  }
  static findMaxC(colorOrHex) {
    return findMaxC(colorOrHex);
  }
}

export default Palette;