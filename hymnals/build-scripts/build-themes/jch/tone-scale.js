import Color from "./cam16";
import * as d3 from "d3-scale";
import * as material from "./material-color-utilities";

let clamp = n => Math.min(Math.max(n, 0), 100);
let jchFromHct = hct => {
  let hex = material.hexFromArgb(hct.argb);
  return new Color(hex).to('jch');
}

let graySamples = [];
let toneList = [...Array(21)].map((m,i) => i * 5).concat([2.5, 97.5]);
toneList.sort((a,b) => a - b);

// Round 1: grays
graySamples = toneList.map(t => {
  let hct = material.Hct.from(0, 0, t);
  return jchFromHct(hct).j;
});

// Round 2: full-chroma, half-chroma, and zero-chroma for multiple hues
let colorSamples = [];
for (let hue = 0; hue < 360; hue += 5) {
  let jchList = [];
  let jchHalfList = [];
  for (let t of toneList) {
    let hctFull = material.Hct.from(hue, 120, t);
    jchList.push(jchFromHct(hctFull).j);

    let hctHalf = material.Hct.from(hue, hctFull.chroma / 2, t);
    jchHalfList.push(jchFromHct(hctHalf).j);
  };
  colorSamples = colorSamples.concat([jchList, jchHalfList, graySamples]);
}

// Average colorSamples
let averageJs = []
for (let i = 0; i < toneList.length; i++) {
  averageJs[i] = colorSamples.map(c => c[i]).reduce((a,b) => a + clamp(b), 0) / colorSamples.length;
}

// Return scale
let scale = d3.scaleLinear().domain(toneList).range(averageJs).clamp(true);

export default scale;
