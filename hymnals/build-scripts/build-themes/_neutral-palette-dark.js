/*
import * as material from "../../../src/utils/material-color-utilities.js";
import NeutralPalette from "./neutral-palette";

class NeutralPaletteDark extends NeutralPalette {
  constructor(hex) {
    const jch = material.Cam16.fromInt(material.argbFromHex(hex));
    material.argbFromLstar()
    jch.j = 22;
    // const hct = material.Hct.fromInt

    super(hex, 0, 100);
    console.log('npd constructor');
  
    let maxGrayChroma = (this.sourceChroma > 5) ? 0.6 * this.sourceChroma : 0;
    if (maxGrayChroma <= 3) maxGrayChroma = 0;
    if (NeutralPalette.defaultMaxChroma > maxChroma) {
      this.compressScale(this.chromaScale, undefined, maxChroma);
    }
  }
}

export default NeutralPaletteDark;
*/