/*
import NeutralPalette from "./neutral-palette";

class NeutralPaletteLight extends NeutralPalette {
  constructor(hex) {
    super(hex, 100, 0);
    console.log('npl constructor');
  
    let maxGrayChroma = 0.6 * this.sourceChroma;
    if (maxGrayChroma <= 3) maxGrayChroma = 0;
    if (NeutralPalette.defaultMaxChroma > maxGrayChroma) {
      this.compressScale(this.chromaScale, undefined, maxGrayChroma);
    }
  }
}

export default NeutralPaletteLight;
*/