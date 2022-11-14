import Color from "./jch/jch-color";
import Palette from "./palette";
import NeutralPalette from "./neutral-palette";
import { css_beautify } from "js-beautify";
import * as d3_array from "d3-array";
import * as d3_scale from "d3-scale";
const d3 = { ...d3_array, ...d3_scale };


function cssColor(color) {
  if (!color) return;
  if (typeof(color) == "string") {
    if (color.startsWith("--")) return `var(${color})`;
    return color;
  } 
  return color.to("srgb").toGamut().toString({ format: "rgb" });
}
function rgbCoords(color) {
  let coords = color.to("srgb").toGamut().coords;
  return coords.map(c => parseFloat((100 * c).toFixed(3)) + "%").join(", ");
}


function getDark(color, J = 30) {
  color = color.to("jch");
  color.J = J;
  color.C = Math.min(color.C, Palette.findMaxC(color).C);
  return color.toGamut("srgb");
}
function getHcLight(hue, targetJ = 30) {
  let result = Palette.findPeak(new Color("jch", [0, 0, hue]));
  if (result.J > targetJ) result = Palette.findMaxC(new Color("jch", [targetJ, 0, hue]));
  return result;
}
function getHcDark(hue, targetJ = 70) {
  let result = Palette.findPeak(new Color("jch", [0, 0, hue]));
  if (result.J < targetJ) result = Palette.findMaxC(new Color("jch", [targetJ, 0, hue]));
  return result;
}


function generateRootCssProps(themeId, corePalette) {
  let props = {};
  props[`--${themeId}`] = cssColor(corePalette.apex);
  props[`--${themeId}-rgb`] = rgbCoords(corePalette.apex);
  return props;
}

function generateThemeCssProps(theme) {
  let { corePalette, neutralPalette, variables } = theme;
  for (let [key, value] of Object.entries(variables)) {
    variables[key] = Palette.readColor(value) ?? value;
  }


  let bodyBgColor = variables["bs-body-bg"] ?? neutralPalette.parseBootstrapVariable("--gray-100");
  let uiColor = variables["ui-color"] ?? corePalette.apex;
  let bodyTextColors = getTextColors(bodyBgColor, neutralPalette, { targetJ: "--gray-900", minDistance: 85 })
  let uiTextColors = getTextColors(uiColor, neutralPalette, { minDistance: 60 });
  variables["ui-color"] ??= uiColor;
  variables["ui-color-rgb"] ??= rgbCoords(uiColor);
  variables["ui-outline-color"] ??= `rgba(${variables["ui-color-rgb"]}, 0.4)`,
  variables["ui-text-color"] ??= uiTextColors.normal;
  variables["ui-text-color-inactive"] ??= uiTextColors.lessContrast;
  variables["bs-body-bg"] ??= bodyBgColor;
  variables["bs-body-color"] ??= bodyTextColors.normal;
  variables["panel-bg"] ??= "--white";
  variables["panel-text-color"] ??= bodyTextColors.moreContrast;
  variables["panel-border-color"] ??= "var(--gray-300)";
  variables["border-width"] ??= "1px";

  let props = {};
  for (let [key, value] of Object.entries(variables)) {
    let cssValue = cssColor(value);
    if (cssValue) props[`--${key}`] = cssValue;
  }
  corePalette.getTints().forEach((tint, i) => {
    props[`--light-${i+1}`] = cssColor(tint);
  });
  corePalette.getShades().forEach((shade, i) => {
    props[`--dark-${i+1}`] = cssColor(shade);
  });
  for (let bsValue of d3.range(0, 1001, 100)) {
    let name = "--gray-" + bsValue;
    if (bsValue == 0) name = "--white";
    if (bsValue == 1000) name = "--black";      
    props[name] = neutralPalette.bs(bsValue);
  }
  
  return props;
}

function getTextColors(bgColor, neutralPalette, options) {
  bgColor = neutralPalette.parseBootstrapVariable(bgColor);
  let { targetJ, minDistance } = options;  
  if (typeof(targetJ) == "string") {
    targetJ = neutralPalette.parseBootstrapVariable(targetJ) ?? Palette.readColor(targetJ);
  }
  if (targetJ instanceof Color) {
    targetJ = targetJ.to("jch").J;
  }

  if (targetJ === undefined) {
    let jRange = neutralPalette.jScale.range();
    let rangeBounds = [Math.max(...jRange), Math.min(...jRange)];
    let deltas = rangeBounds.map(j => Math.abs(bgColor.J - j));
    targetJ = (deltas[0] > deltas[1]) ? rangeBounds[0] : rangeBounds[1];
  }
  if (minDistance === undefined) {
    let jRange = neutralPalette.jScale.range();
    let rangePct = (Math.max(...jRange) - Math.min(...jRange)) / 100;
    minDistance = Math.max(30, 50 * rangePct)
  }

  let jOptions = [targetJ, bgColor.J + minDistance, bgColor.J - minDistance]
    .map(j => Math.max(0, Math.min(100, j)));
  jOptions.sort((a,b) => {
    let [aContrast, bContrast] = [a, b].map(j => Math.min(minDistance, Math.abs(bgColor.j - j)));
    let contrastResult = bContrast - aContrast;
    if (contrastResult != 0) return contrastResult;

    let [aPreference, bPreference] = [a, b].map(j => Math.abs(j - targetJ));
    return aPreference - bPreference;
  });

  let normalTextColor = neutralPalette.parseBootstrapVariable(neutralPalette.jOrVariable(jOptions[0]));
  let contrastDirection = (normalTextColor.J > bgColor.J) ? 1 : -1;
  let textColors = {
    normal: normalTextColor.J,
    moreContrast: normalTextColor.J + (7 * contrastDirection),
    lessContrast: normalTextColor.J - (7 * contrastDirection)
  };
  Object.entries(textColors).forEach(([key, j]) => {
    j = Math.max(0, Math.min(j, 100));
    textColors[key] = neutralPalette.jOrVariable(j);
  });
  return textColors;
}

function propsToCss(props) {
  return Object.entries(props).map(([key, value]) => {
    if (value instanceof Color) value = value.to("srgb");
    return `${key}: ${value};`;
  }).join("\n");
}

class ModeBuilder {
  constructor(modeDefinitions) {
    modeDefinitions = Object.assign({
      light: {
        primary: { hex: "#006E70" },
        redbook: { hex: "#A03E3F" },
        missions: { hex: "#076387" }
      },
      hcLight: { 
        primary: { hex: "#000000" },
        redbook: { hue: 0 },
        supplement: { hue: 300 },
        missions: { hue: 240 }
      },
      dark: {
        primary: { hue: 147 }
      },
      hcDark: { 
        primary: { hex: "#ffffff" },
        redbook: { hue: 20 },
        supplement: { hue: 290 },
        missions: { hue: 180 }
      }
    }, modeDefinitions);

    let rbLight = Palette.readColor(modeDefinitions.light.redbook);
    modeDefinitions.light.supplement = new Color("jch", [ rbLight.J * 0.75, 5, rbLight.h ]);
  
    for (let [themeId, colorOptions] of Object.entries(modeDefinitions.hcLight)) {
      if (colorOptions.hue !== undefined) modeDefinitions.hcLight[themeId] = getHcLight(Palette.getJchHue(colorOptions.hue));
    }

    for (let [themeId, colorOptions] of Object.entries(modeDefinitions.dark)) {
      if (colorOptions.hue !== undefined) modeDefinitions.dark[themeId] = getDark(new Color("jch", [30, 30, colorOptions.hue]));
    }

    for (let [themeId, colorOptions] of Object.entries(modeDefinitions.hcDark)) {
      if (colorOptions.hue !== undefined) modeDefinitions.hcDark[themeId] = getHcDark(Palette.getJchHue(colorOptions.hue));
    }

    this.themeIds = [];
    for (let themeId of Object.keys(modeDefinitions.light)) {
      this.themeIds.push(themeId);
      let lightApex = Palette.readColor(modeDefinitions.light[themeId]);
      modeDefinitions.hcLight[themeId] ??= getHcLight(lightApex);
      modeDefinitions.dark[themeId] ??= getDark(lightApex);
      modeDefinitions.hcDark[themeId] ??= getHcDark(lightApex);
    }

    this.modes = { light: {}, hcLight: {}, dark: {}, hcDark: {} };
    for (let themeId of this.themeIds) {
      let apex, tintTarget, shadeTarget;

      // light
      apex = Palette.readColor(modeDefinitions.light[themeId]);
      let lightTheme = this.modes.light[themeId] = {};
      lightTheme.neutralPalette = new NeutralPalette(apex);
      lightTheme.corePalette = new Palette(apex);
      lightTheme.variables = {
        "bs-body-bg": "#f8f6f2"
      };

      // dark
      apex = Palette.readColor(modeDefinitions.dark[themeId]);
      tintTarget = Palette.findMaxC(new Color("jch", [80, 0, apex.h]));
      shadeTarget = Palette.findMaxC(new Color("jch", [10, 0, apex.h]));
      [tintTarget, shadeTarget].forEach(t => t.C = Math.min(tintTarget.C, shadeTarget.C));
      let darkTheme = this.modes.dark[themeId] = {};
      darkTheme.corePalette = new Palette(apex, { tintTarget, shadeTarget });
      darkTheme.neutralPalette = new NeutralPalette(apex, { jRange: [80, 10] });
      let uiTextColors = getTextColors(darkTheme.corePalette.apex, darkTheme.neutralPalette, { targetJ: 90 });
      darkTheme.variables = {
        "panel-bg": "--gray-300",
        "panel-border-color": "--gray-500",
        "ui-text-color": uiTextColors.normal,
        "ui-text-color-inactive": uiTextColors.lessContrast,
        "link-color": Palette.findMaxC(new Color("jch", [86, 0, apex.h])),
        "link-hover-color": Palette.findMaxC(new Color("jch", [93, 0, apex.h])),
        "link-active-color": Palette.findMaxC(new Color("jch", [100, 0, apex.h]))
      };
      ["link-color", "link-hover-color", "link-active-color"].forEach(key => {
        let value = darkTheme.variables[key];
        value.C = Math.min(darkTheme.corePalette.apex.C, value.C * .66);
      })
      
    }
  }
  
  generateRootCss() {
    let cssText = [];
    let cssProps = {};
    for (let [modeId, themes] of Object.entries(this.modes)) {
      let modeProps = cssProps[modeId] = {};
      for (let [themeId, theme] of Object.entries(themes)) {
        Object.assign(modeProps, generateRootCssProps(themeId, theme.corePalette));
      }
      cssText.push(`
        html.mode-${modeId} {
          ${propsToCss(modeProps)}
        }`);
    }

    cssText.unshift(`
      html:not([class*="mode-"]) {
        ${propsToCss(cssProps.light)}
      }
      @media (prefers-color-scheme: dark) {
        html:not([class*="mode-"]) {
          ${propsToCss(cssProps.dark)}
        }
      }`);
    
    cssText = cssText.join("\n");
    return css_beautify(cssText, { indent_size: 2 })
  }

  generateThemeCss() {
    let cssText = [];
    for (let [modeId, themes] of Object.entries(this.modes)) {
      for (let [themeId, theme] of Object.entries(themes)) {
        let modeSelectors = [`html.mode-${modeId}`]
        if (modeId == "light") modeSelectors.unshift('html:not([class*="mode-"])');
        let classSelectors = [`.theme-${themeId}`]
        if (themeId == "primary") classSelectors.unshift('');
        let allCombinations = d3.cross(modeSelectors, classSelectors);
        let selectors = [
          ...allCombinations.map(s => s.join("")),
          ...allCombinations.map(s => s.join(" "))
        ].map(s => s.trim());
        selectors = [...new Set(selectors)];
        selectors.sort((a,b) => {
          let aNoSpaces = a.replaceAll(" ", "");
          let bNoSpaces = b.replaceAll(" ", "");
          return (aNoSpaces.length - bNoSpaces.length) || (a.length - b.length) || a.localeCompare(b);
        });

        let themeProps = generateThemeCssProps(theme);
        cssText.push(`
          ${selectors.join(",\n")} {
            ${propsToCss(themeProps)}
          }`);
      }

      let darkPrimaryProps = generateThemeCssProps(this.modes.dark.primary);
      cssText.unshift(`
        @media (prefers-color-scheme: dark) {
          html:not([class*="mode-"]) {
            ${propsToCss(darkPrimaryProps)}
          }
        }`);
    }
    
    cssText = cssText.join("\n");
    return css_beautify(cssText, { indent_size: 2 })
  }
}

export default ModeBuilder;




/*
const optionsOverrideNames = [ "light", "dark", "neutral" ];

function getOverriddenOptions(options, name) {
  if (!options) return undefined;
  
  let overriddenOptions = JSON.parse(JSON.stringify(options));
  optionsOverrideNames.forEach(n => delete overriddenOptions[n]);

  if (!name) 
  if (name && options[name]) {
    let overrides = JSON.parse(JSON.stringify(options[name]));
    Object.assign(overriddenOptions, overrides);
  }
  return overriddenOptions;
}
*/


