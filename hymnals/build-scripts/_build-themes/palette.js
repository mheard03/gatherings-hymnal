import Color from "./jch/jch-color";
import PaletteBase from "./palette-base";

class Palette extends PaletteBase {
  constructor(hexOrColor, options) {
    super(hexOrColor, options);
  }

  getTints(stepCount = 5, maxStepSize = 7) {
    return this.getTintsOrShades(100, stepCount, maxStepSize);
  }
  getShades(stepCount = 5, maxStepSize = 7) {
    return this.getTintsOrShades(0, stepCount, maxStepSize);
  }
  getTintsOrShades(targetLightJ, stepCount = 5, maxStepSize = 7) {
    // All J values absolute unless otherwise specified
    let apexJ = this.apex.j;
    let targetJ = this.lightJToAbsJScale(targetLightJ);

    // If there's not enough room to generate as many distinguishable colors as needed, flip targetLightJ.
    let minStepSize = Math.max(1.5, (maxStepSize / 3));
    let minDistance = Math.abs((stepCount + 2) * minStepSize);
    minDistance = Math.min(minDistance, 30);
    if (Math.abs(apexJ - targetJ) < minDistance) {
      let inverseTargetJ = this.getInvertedLightJ(targetLightJ);
      if (Math.abs(apexLightJ - inverseTargetJ) > Math.abs(apexLightJ - targetJ)) {
        console.log('flipping...')
        return getTintsOrShades(inverseTargetJ, stepCount, maxStepSize);
      }
    }
    
    // Commence to stepping
    let deltaJ = targetJ - apexJ;
    maxStepSize = Math.abs(maxStepSize);
    let derivedStepSize = Math.abs(deltaJ) / (stepCount + 1);
    let finalStepSize = Math.min(maxStepSize, derivedStepSize) * Math.sign(deltaJ);
    let finalTargetJ = apexJ + finalStepSize * (stepCount + 1);

    let stepToJScale = d3.scaleLinear().domain([0, stepCount + 1]).range([apexJ, finalTargetJ]);
    console.log('apexJ', apexJ, 'targetJ', targetJ, 'deltaJ', deltaJ, 'finalTargetJ', finalTargetJ, 'finalStepSize', finalStepSize)
    let results = [];
    for (let step = 1; step <= stepCount; step++) {
      let jAtStep = stepToJScale(step);
      results.push(this.getTintOrShadeAtAbsJ(jAtStep));
    }
    return results;
  }

  /*
  getTints(stepCount = 5, maxStepSize = 7) {
    let targetJ = this.bgJ;
    let minDistance = Math.abs(stepCount * maxStepSize / 3);
    if (Math.abs(this.apex.j - targetJ) < minDistance) targetJ = this.fgJ;
    return this.getTintsOrShades(targetJ, stepCount, maxStepSize);
  }
  getShades(stepCount = 5, maxStepSize = 7) {
    let targetJ = this.fgJ;
    let minDistance = Math.abs(stepCount * maxStepSize / 3);
    if (Math.abs(this.apex.j - targetJ) < minDistance) targetJ = this.bgJ;
    return this.getTintsOrShades(targetJ, stepCount, maxStepSize);
  }
  getTintsOrShades(targetJ, stepCount = 5, maxStepSize = 7) {
    let targetColor = new Color("jch", [targetJ, this.minChroma, this.apex.h]);
    let deltaJ = targetColor.j - this.apex.j;
    if (deltaJ == 0) return [...new Array(stepCount)].map(c => this.apex.clone());

    maxStepSize = Math.abs(maxStepSize);    
    let derivedStepSize = Math.abs(deltaJ) / (stepCount + 1);
    let stepSize = Math.min(maxStepSize, derivedStepSize) * Math.sign(deltaJ);
    targetColor.j = this.apex.j + stepSize * (stepCount + 1);

    let stepsInclusive = Color.steps(this.apex, targetColor, { steps: (stepCount + 2) })
    return stepsInclusive.slice(1, -1);
  }
  */
}

export default Palette;
