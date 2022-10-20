import * as material from './material-color-utilities';
import * as d3 from 'd3-scale';


let theme = material.themeFromSourceColor(material.argbFromHex('#a03e3f'));

function renderTheme(theme) {
  let table = document.createElement("table");
  let tr = document.createElement("tr");
  table.append(tr);
  for (let key of Object.keys(theme.schemes)) {
    let td = document.createElement("td");
    td.append(...renderScheme(theme.schemes[key], key));
    tr.append(td);
  }
  return table;
}

function renderScheme(scheme, name) {
  let result = [];

  let h2 = document.createElement("h2");
  h2.innerHTML = name;
  result.push(h2);

  let ul = document.createElement("ul");
  for (let pair of getPropertyPairs(scheme)) {
    let li = document.createElement("li");
    li.style.paddingBottom = "0.25rem";
    let hex = material.hexFromArgb(scheme.props[pair.color]);
    if (pair.textColor) {
      let textHex = material.hexFromArgb(scheme.props[pair.textColor]);
      li.innerHTML = `<span style="border: 1px solid white; outline: 1px solid black; padding: 0 0.25rem; color: ${textHex}; background-color: ${hex}">${pair.color}</span>`;
    }
    else {
      li.innerHTML = `<span style="width: 1rem; height: 1rem; display: inline-block; border: 1px solid white; outline: 1px solid black; background-color: ${hex}"></span> ${pair.color}`;
    }
    ul.append(li);
  }
  result.push(ul);
  return result;
}

function getPropertyPairs(scheme) {
  let propNames = Object.keys(scheme.props);
  let pairs = [];
  propNames.forEach(p => pairs.push(getColorNamePair(p, propNames)));
  let textColors = pairs.map(p => p.textColor).filter(p => p);
  pairs = pairs.filter(p => !p.color.startsWith("inverse") && !textColors.includes(p.color));
  return pairs;
}

function getColorNamePair(colorName, list) {
  let result = { color: colorName };
  
  let textColor = "on" + colorName[0].toUpperCase() + colorName.slice(1);
  if (colorName == "inverseSurface") textColor = "inverseOnSurface";
  if (list.includes(textColor)) result.textColor = textColor;

  return result;
}

function restorePrimary(theme) {
  let source = material.Cam16.fromInt(theme.sourceColor);
  let primary = material.Cam16.fromInt(theme.schemes.light.primary);
  let chromaScale = d3.scalePow(1).domain([source.chroma, primary.chroma])
}

function desaturatePercent(colorInt, percent) {
  let cam16 = material.Cam16.fromInt(material.argbFromHex("#4e4646"));
  let desaturated = material.Cam16.fromJch(cam16.j, cam16.chroma * percent, cam16.hue);

  let initialC = cam16.m / material.ViewingConditions.DEFAULT.fLRoot;
  let initialC
}

class {
  constructor(props) {
    this.props = props;
  }
  get primary() {
    return this.props.primary;
  }
  get onPrimary() {
    return this.props.onPrimary;
  }
  get primaryContainer() {
    return this.props.primaryContainer;
  }
  get onPrimaryContainer() {
    return this.props.onPrimaryContainer;
  }
  get secondary() {
    return this.props.secondary;
  }
  get onSecondary() {
    return this.props.onSecondary;
  }
  get secondaryContainer() {
    return this.props.secondaryContainer;
  }
  get onSecondaryContainer() {
    return this.props.onSecondaryContainer;
  }
  get tertiary() {
    return this.props.tertiary;
  }
  get onTertiary() {
    return this.props.onTertiary;
  }
  get tertiaryContainer() {
    return this.props.tertiaryContainer;
  }
  get onTertiaryContainer() {
    return this.props.onTertiaryContainer;
  }
  get error() {
    return this.props.error;
  }
  get onError() {
    return this.props.onError;
  }
  get errorContainer() {
    return this.props.errorContainer;
  }
  get onErrorContainer() {
    return this.props.onErrorContainer;
  }
  get background() {
    return this.props.background;
  }
  get onBackground() {
    return this.props.onBackground;
  }
  get surface() {
    return this.props.surface;
  }
  get onSurface() {
    return this.props.onSurface;
  }
  get surfaceVariant() {
    return this.props.surfaceVariant;
  }
  get onSurfaceVariant() {
    return this.props.onSurfaceVariant;
  }
  get outline() {
    return this.props.outline;
  }
  get outlineVariant() {
    return this.props.outlineVariant;
  }
  get shadow() {
    return this.props.shadow;
  }
  get scrim() {
    return this.props.scrim;
  }
  get inverseSurface() {
    return this.props.inverseSurface;
  }
  get inverseOnSurface() {
    return this.props.inverseOnSurface;
  }
  get inversePrimary() {
    return this.props.inversePrimary;
  }
  static light(argb) {
    return Scheme.lightFromCorePalette(CorePalette.of(argb));
  }
  static dark(argb) {
    return Scheme.darkFromCorePalette(CorePalette.of(argb));
  }
  static lightContent(argb) {
    return Scheme.lightFromCorePalette(CorePalette.contentOf(argb));
  }
  static darkContent(argb) {
    return Scheme.darkFromCorePalette(CorePalette.contentOf(argb));
  }
  static lightFromCorePalette(core) {
    return new Scheme({
      primary: core.a1.tone(40),
      onPrimary: core.a1.tone(100),
      primaryContainer: core.a1.tone(90),
      onPrimaryContainer: core.a1.tone(10),
      secondary: core.a2.tone(40),
      onSecondary: core.a2.tone(100),
      secondaryContainer: core.a2.tone(90),
      onSecondaryContainer: core.a2.tone(10),
      tertiary: core.a3.tone(40),
      onTertiary: core.a3.tone(100),
      tertiaryContainer: core.a3.tone(90),
      onTertiaryContainer: core.a3.tone(10),
      error: core.error.tone(40),
      onError: core.error.tone(100),
      errorContainer: core.error.tone(90),
      onErrorContainer: core.error.tone(10),
      background: core.n1.tone(99),
      onBackground: core.n1.tone(10),
      surface: core.n1.tone(99),
      onSurface: core.n1.tone(10),
      surfaceVariant: core.n2.tone(90),
      onSurfaceVariant: core.n2.tone(30),
      outline: core.n2.tone(50),
      outlineVariant: core.n2.tone(80),
      shadow: core.n1.tone(0),
      scrim: core.n1.tone(0),
      inverseSurface: core.n1.tone(20),
      inverseOnSurface: core.n1.tone(95),
      inversePrimary: core.a1.tone(80)
    });
  }
  static darkFromCorePalette(core) {
    return new Scheme({
      primary: core.a1.tone(80),
      onPrimary: core.a1.tone(20),
      primaryContainer: core.a1.tone(30),
      onPrimaryContainer: core.a1.tone(90),
      secondary: core.a2.tone(80),
      onSecondary: core.a2.tone(20),
      secondaryContainer: core.a2.tone(30),
      onSecondaryContainer: core.a2.tone(90),
      tertiary: core.a3.tone(80),
      onTertiary: core.a3.tone(20),
      tertiaryContainer: core.a3.tone(30),
      onTertiaryContainer: core.a3.tone(90),
      error: core.error.tone(80),
      onError: core.error.tone(20),
      errorContainer: core.error.tone(30),
      onErrorContainer: core.error.tone(80),
      background: core.n1.tone(10),
      onBackground: core.n1.tone(90),
      surface: core.n1.tone(10),
      onSurface: core.n1.tone(90),
      surfaceVariant: core.n2.tone(30),
      onSurfaceVariant: core.n2.tone(80),
      outline: core.n2.tone(60),
      outlineVariant: core.n2.tone(30),
      shadow: core.n1.tone(0),
      scrim: core.n1.tone(0),
      inverseSurface: core.n1.tone(90),
      inverseOnSurface: core.n1.tone(20),
      inversePrimary: core.a1.tone(40)
    });
  }
  toJSON() {
    return Object.assign({}, this.props);
  }
}