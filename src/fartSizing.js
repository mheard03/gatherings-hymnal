import { scaleLinear } from 'd3-scale';

const h1FontWeightScale = scaleLinear().domain([1.2, 1.067]).range([400, 600]).clamp(true);
const fontSizeScale = scaleLinear().domain([16,64]).range([1, 0.5]).clamp(true);
const h1MaxSize = 90;


function applyFontSizing(fontSize) {
  let doc = document.documentElement;
  doc.style.setProperty("--font-size", `${fontSize}px`);
  doc.style.setProperty("--font-size-scale", fontSizeScale(fontSize));

  // size of h1 = fontSize * fontSizePower⁵, therefore fontSizePower = fifth root of h1/fontSize
  let headingSizeIncrease = Math.pow(h1MaxSize/fontSize, 0.2);
  headingSizeIncrease = Math.min(headingSizeIncrease, 1.2);
  headingSizeIncrease = Math.max(headingSizeIncrease, 1.067);
  doc.style.setProperty("--heading-size-increase", headingSizeIncrease);

  let h1Size = fontSize * Math.pow(headingSizeIncrease, 5);
  let h1Weight = h1FontWeightScale(headingSizeIncrease);
  let fontWeightScale = scaleLinear().domain([6, 1]).range([400, h1Weight]).clamp(true);
  for (let i = 1; i < 6; i++) {
    doc.style.setProperty(`--h${i}-font-weight`, fontWeightScale(i));
  }
}

export default applyFontSizing;