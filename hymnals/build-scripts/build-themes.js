// const fs = require('fs');
// const { readFile } = require('./read-file');
// import * as material from "./build-themes/material-extensions";
/*
import * as material from '../../src/utils/material-color-utilities'
import * as d3 from "d3-scale";

function buildToneToJScale() {
  let clamp = n => Math.min(Math.max(n, 0), 100);

  let graySamples = [];
  let toneList = [...Array(21)].map((m,i) => i * 5).concat([2.5, 97.5]);
  toneList.sort((a,b) => a - b);

  // Round 1: grays
  graySamples = toneList.map(t => {
    let hct = material.Hct.from(0, 0, t);
    let jch = material.Cam16.fromInt(hct.toInt());
    return jch.j;
  });

  // Round 2: full-chroma, half-chroma, and zero-chroma for multiple hues
  let colorSamples = [];
  let hueList = [...Array(36)].map((m,i) => i * 10);
  for (let hue of hueList) {
    let jchList = [];
    let jchHalfList = [];
    for (let t of toneList) {
      let hctFull = material.Hct.from(hue, 120, t);
      let jchFull = material.Cam16.fromInt(hctFull.toInt());
  
      let hctHalf = material.Hct.from(hue, hct.chroma / 2, t);
      let jchHalf = material.Cam16.fromInt(hctHalf.toInt());
      jchList.push(jchFull.j);
      jchHalfList.push(jchHalf.j);
    };
    colorSamples = colorSamples.concat([jchList, jchHalfList, graySamples]);
  }

  // Average colorSamples
  let averageTones = []
  for (let i = 0; i < toneList.length; i++) {
    averageTones[i] = colorSamples.map(c => c[i]).reduce((a,b) => a + clamp(b), 0) / colorSamples.length;
  }

  // Return scale
  return d3.scaleLinear().domain(toneList).range(averageTones).clamp(true);
}


class NeutralPalette {
  static {
    const grays = {
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
    
    // White
    let domain = [0];
    let chromaRange = [0];
    let toneRange = [100];

    // Grays
    let grayEntries = Object.entries(grays).slice(1, -1);
    for (let i = 0; i < grayEntries.length; i++) {
      let [key, hex] = grayEntries[i];
      let suffixValue = parseInt(key.replace("gray-", ""));
      domain.push(suffixValue / 10);
      let argb = material.argbFromHex(hex);
      let hct = material.Hct.fromInt(argb);
      chromaRange.push(hct.chroma);
      toneRange.push(hct.tone);
    }

    // Black
    domain.push(100);
    chromaRange.push(0);
    toneRange.push(0);

    NeutralPalette.domainValues = domain;
    NeutralPalette.chromaRangeValues = chromaRange;
    NeutralPalette.chromaRangeMax = Math.max(...chromaRange);
    NeutralPalette.toneRangeValues = toneRange;
  }

  static getCssVariableName(tone) {
    tone = Math.round(tone);
    if (tone < 1) return "--white";
    if (tone > 99) return "--black";
    return "--gray-" + (tone * 10).toString().padStart(3, "0");
  }

  constructor(hex) {
    whiteTone ||= 100;
    blackTone ||= 0;
    this.isDarkMode = whiteTone < blackTone;

    let np = NeutralPalette;
    let hct = material.Hct.fromInt(source);

    this.source = material.argbFromHex(hex);
    this.hue = hct.hue;
    this.white = material.Cam16.fromInt(Hct.from(hct.hue, hct.chroma, whiteTone));
    this.black = material.Hct.from(hct.hue, hct.chroma, blackTone);
    this.white.chroma /= 3;
    this.black.chroma /= 3;

    this.chromaScale = d3.scaleLinear().domain(np.domainValues).range(np.chromaRangeValues).clamp(true);
    this.toneScale = d3.scaleLinear().domain(np.domainValues).range(np.toneRangeValues).clamp(true);
    this.cache = new Map();

    let chromaScaleMax = Math.min(0.7 * hct.chroma, np.chromaScaleMax);
    if (chromaScaleMax != np.chromaScaleMax) {
      let chromaCompressor = d3.scaleLinear().domain([0, np.chromaScaleMax]).range([0, chromaScaleMax])
      let chromaRangeValues = np.chromaRange.map(r => chromaCompressor(r));
      this.chromaScale = d3.scaleLinear().domain(np.domainValues).range(chromaRangeValues).clamp(true);
    }

    if (this.isDarkMode) {
      let domainInverter = d3.scaleLinear().domain([0, 60, 100]).range([90, 40, 10]);
      let invertedDomainValues = domain.map(d => domainInverter(d));
      this.chromaScale.domain(invertedDomainValues);
      this.toneScale.domain(invertedDomainValues);
    }
  }

  tone(toneValue) {
    let argb = this.cache.get(toneValue);
    if (argb === undefined) {
      let chromaValue = this.chromaScale(toneValue);
      toneValue = this.toneScale(toneValue);
      argb = Hct.from(this.hue, chromaValue, toneValue).toInt();
      this.cache.set(toneValue, argb);
    }
    return argb;
  }

  bootstrapTones() {
    let result = {};
    for (let tone of np.domainValues) {
      let name = getCssVariableName(tone);
      result[name] = this.tone(tone);
    }
    return result;
  }
}

const getHex = (argb) => {
  if (argb instanceof Material.Hct) argb = argb.toInt();
  material.hexFromArgb(argb)
};
const getRgb = (argb) => {
  if (argb instanceof Material.Hct) argb = argb.toInt();
  [material.redFromArgb(argb), material.greenFromArgb(argb), material.blueFromArgb(argb)].join(", ");
}

class HymnalTheme {
  constructor(argb, name) {
    this.source = argb;
    this.name = name;

    const hct = material.Hct.fromInt(argb);
    this.light = {
      color: hct,
      whiteTone: 0,
      blackTone: 100,
      palette: material.TonalPalette.fromHueAndChroma(hct.hue, hct.chroma),
      neutral: NeutralPalette.fromHueAndChroma(hct.hue, hct.chroma),
    };
    this.light.globalCssProps[`--${this.name}`] = getHex(this.light.color);
    this.light.globalCssProps[`--${this.name}-rgb`] = getRgb(this.light.color);
    this.light.cssProps = getCss(this.light);
    this.light.cssClass = renderCss(this.light.cssProps);

    const darkHct = material.Hct.from(hct.hue, hct.chroma, Math.max(80, hct.tone));
    this.dark = {
      color: darkHct,
      whiteTone: 90,
      blackTone: 10,
      palette: material.TonalPalette.fromHueAndChroma(darkHct.hue, darkHct.chroma),
      neutral: NeutralPalette.fromHueAndChroma(darkHct.hue, darkHct.chroma)
    };
    this.dark.globalCssPropsDark = {};
    this.dark.globalCssProps[`--${this.name}`] = getHex(this.dark.color);
    this.dark.globalCssProps[`--${this.name}-rgb`] = getRgb(this.dark.color);
    this.dark.cssProps = getCss(this.light);
    this.dark.cssClass = renderCss(this.dark.cssProps);
  }

  renderCss(cssProps) {
    let lines = [`.${this.name} {`];
    for (let entry of Object.entries(cssProps)) {
      lines.push(`  ${entry[0]}: ${entry[1]}`);
    }
    lines.push("}");
    return lines.join("\n");
  }

  getCssProps(scheme) {
    const { color, whiteTone, blackTone, palette, neutral } = scheme;
    let white = material.Hct.from(color.hue, color.chroma, whiteTone);
    let black = material.Hct.from(color.hue, color.chroma, blackTone);

    let blendStepSize = 7;
    let blendStepCount = 5;
    let minTone = Math.min(whiteTone, blackTone);
    let maxTone = Math.max(whiteTone, blackTone);
    let blendScale = d3.scaleLinear().domain([0, blendStepCount + 1]).range([0, 1]).clamp(true);
    let getBlend = (to, stepNo) => {
      let pct = blendScale(stepNo);
      return material.Blend.cam16Ucs(color, to, pct);
    }

    let tintDelta = (whiteTone < 50 ? -1 : 1) * (blendStepSize * (blendStepCount + 1));
    let tintTargetTone = material.clampDouble(minTone, maxTone, color.tone + tintDelta);
    let tintTarget = material.Hct.from(color.hue, color.chroma, tintTargetTone);

    let shadeDelta = -1 * tintDelta;
    let shadeTargetTone = material.clampDouble(minTone, maxTone, color.tone + shadeDelta);
    let shadeTarget = material.Hct.from(color.hue, color.chroma, shadeTargetTone);


    let css = {};
    css["--ui-color"] = getHex(color);
    css["--ui-color-rgb"] = getRgb(color);
    css["--ui-text-color"] = (color.tone > 50) ? "#ffffff" : "#000000";
    css["--ui-outline-color"] = `rgba(${getRgb(color)}, 0.4)`;
    for (let i = 5; i > 0; i--) {
      css[`--light-${i}`] = getHex(getBlend(tintTarget, i));
    }
    for (let i = 1; i <= blendStepCount; i++) {
      css[`--dark-${i}`] = getHex(getBlend(shadeTarget, i));
    }
    Object.assign(css, neutral.bootstrapTones(white, black));

    return css;
  }
}
*/
run();
async function run() {
  // console.log('materialColor', materialColor);
  return;
  console.log('Loading hymns from HTML files and JSON cache...');
  let html = await hymnFileReader.readAllHymnFiles(hymnalRoot);

  let json = [];
  if (fs.existsSync(cachePath)) {
    try {
      let jsonFile = await readFile(cachePath);
      json = JSON.parse(jsonFile.textContent);
      for (let hymn of json) {
        hymn.modifiedDate = new Date(hymn.modifiedDate);
      }
    } catch (e) {
      console.log("Couldn't load existing JSON cache.");
    }
  }

  console.log('Comparing versions...');
  let cache = await buildUpdatedCache(html, json);
  if (cache) {
    let newJson = JSON.stringify(cache, null, ' ');
    await fs.promises.writeFile(cachePath, newJson);
  }
  if (cache || !fs.existsSync(versionPath)) {
    let ts = new Date();
    await fs.promises.writeFile(versionPath, ts.getTime().toString());
  }
}
  


export default run;