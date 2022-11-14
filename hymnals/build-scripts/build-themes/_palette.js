import Color from "./jch/jch-color";
import PaletteBase from "./palette";

class Palette extends PaletteBase {
  constructor(colorOrHex, options) {
    super(colorOrHex, options);
  }

  getTints(stepCount = 5, maxStepSize = 7) {
    return this.getTintsOrShades(100, stepCount, maxStepSize);
  }
  getShades(stepCount = 5, maxStepSize = 7) {
    return this.getTintsOrShades(0, stepCount, maxStepSize);
  }
}

export default Palette;
