import Color from "./jch/jch-color";
import { scaleLinear } from "d3-scale";
import { regressionPoly } from "d3-regression";
import { range } from "d3-array";
import linear from "@/utils/scaleLinear/scaleLinear";
const d3 = Object.assign({}, { range, scaleLinear, regressionPoly });

const bsGrays = (function() {
  let hexValues = [
    "#f8f9fa",
    "#e9ecef",
    "#dee2e6",
    "#ced4da",
    "#adb5bd",
    "#6c757d",
    "#495057",
    "#343a40",
    "#212529"
  ];
  let jchValues = hexValues.map(hex => new Color(hex).to("jch"));
  let avgHue = jchValues.map(c => c.h).reduce((a,b) => a + b) / hexValues.length;
  jchValues.unshift(new Color("jch", [100, 0, 0]));
  jchValues.push(new Color("jch", [0, 0, 0]));  
  jchValues.forEach(c => c.h = avgHue);

  let jValues = jchValues.map((c,i) => [i * 100, c.J]);
  let cValues = jchValues.map((c,i) => [i * 100, c.C]);
  return {
    jchValues,
    jLight: jValues.slice(0, 6),
    jDark: jValues.slice(7),
    cLight: cValues.slice(0, 7),
    cDark: cValues.slice(6)
  }
})();

const bsGray600 = bsGrays.jchValues[6];
const regressions = buildRegressions();

function getBsGray(bsLevel, hue = NaN) {
  if (bsLevel == 600) {
    // Neutral gray always returns an exact value
    let result = bsGray600.clone();
    result.h = hue;
    return result;
  }
  else {
    let result = new Color("jch", [0, 0, hue]);
    let jScale = (bsLevel < 600) ? regressions.jLight : regressions.jDark;
    result.J = jScale(bsLevel);
    let cScale = (bsLevel < 600) ? regressions.cLight : regressions.cDark;
    result.C = cScale(bsLevel);  
    return result;
  }
}

function getJ(targetJ, hue = NaN) {
  if (Math.abs(targetJ - bsGray600.J) < 0.5) {
    let result = bsGray600.clone();
    result.h = hue;
    return result;
  }
  else {
    let result = new Color("jch", [targetJ, 0, hue]);
    let bsScale = (targetJ > bsGray600.J) ? regressions.jLight : regressions.jDark;
    let bsLevel = bsScale.invert(targetJ);
    let cScale = (targetJ > bsGray600.J) ? regressions.cLight : regressions.cDark;
    result.C = cScale(bsLevel);  
    return result;
  }
}

window.regressions = regressions;
window.getBsGray = getBsGray;
window.getJ = getJ;


export { getBsGray, getJ };


function buildRegressions() {
  let result = {};
  Object.entries(bsGrays).slice(1).forEach(([key, points]) => {
    let centralized = getCentralized(points);
    let xTransform = centralized.xTransform;
    let regression = getBestFitRegression(centralized);
    
    let predict = function(bsValue) {
      let x = xTransform(bsValue);
      return regression.predict(x);
    }
    
    let linearScales = [];
    for (let bsValue of [0, 600, 1000]) {
      let p = points.find(p => p[0] == bsValue);
      if (!p) continue;

      let linearPoints = [[bsValue, p[1]]];
      if (bsValue > 0) linearPoints.unshift([bsValue - 25, predict(bsValue - 25)]);
      if (bsValue < 1000) linearPoints.push([bsValue + 25, predict(bsValue + 25)]);
      
      linearScales.push(d3.scaleLinear().domain(linearPoints.map(p => p[0])).range(linearPoints.map(p => p[1])));
    }

    result[key] = function(bsValue) {
      let linearScale = linearScales.find(s => {
        let domain = s.domain();
        return (bsValue >= domain[0] && bsValue <= domain[domain.length - 1]);
      });
      let fnPredictor = linearScale ?? predict;
      return fnPredictor(bsValue);
    }

    result[key].invert = function(jValue) {
      let range = (jValue >= bsGray600.J) ? [0, 600] : [600, 1000];      
      return findInverse(result[key], jValue, range);
    }

  });
  return result;
}

function getCentralized(array) {
  let firstPoint = array[0];
  let lastPoint = array[array.length - 1];
  
  let xTransform = d3.scaleLinear()
    .domain([firstPoint[0], lastPoint[0]])
    .range([0, array.length - 1]);
  if (firstPoint[0] != 0 && lastPoint[0] == 1000) {
    xTransform.range([array.length - 1, 0]);
  }

  let result = doRegression(array, xTransform);
  if (result.slopeSign != result.concavitySign) {
    xTransform.range([0, array.length - 1]);
    result = doRegression(array, xTransform);
  }

  return {
    points: result.points,
    xTransform
  };
}

function doRegression(array, xTransform) {
  let points = array.map(e => [xTransform(e[0]), e[1]]);
  points.sort((a,b) => a[0] - b[0]);

  let linear = d3.regressionPoly().order(1)(points);
  let slopeSign = Math.sign(linear.coefficients[1]);

  let quadratic = d3.regressionPoly().order(2)(points);
  let concavitySign = Math.sign(quadratic.coefficients[2]);
  return { points, slopeSign, concavitySign, linear, quadratic };
}

function getBestFitRegression(centralized) {
  let centralizedPoints = JSON.parse(JSON.stringify(centralized.points));
  centralizedPoints.sort((a,b) => a[0] - b[0]);
  let xTransform = centralized.xTransform;
  let results = [];

  let hotspots = [];
  let hotPoints = [centralizedPoints[0], centralizedPoints[centralizedPoints.length - 1]].filter(p => [0, 600, 1000].includes(xTransform.invert(p[0])));
  if (hotPoints.length) {
    let hotCount = Math.max(3, Math.ceil((centralizedPoints.length) / 3)) - 1;
    hotspots = d3.range(hotCount).flatMap(p => hotPoints);
  }
  centralizedPoints = [...centralizedPoints, ...hotspots];
  centralizedPoints.sort((a,b) => a[0] - b[0]);
  // console.log('centralizedPoints', centralizedPoints);

  let linear = d3.regressionPoly().order(1)([...centralizedPoints, ...hotspots]); 
  results.push(linear);
  
  function doRegressionWithOffset(offsetAmount) {
    let points = [...centralizedPoints, ...hotspots].map(p => [p[0] + offsetAmount, p[1]]);
    points = [...points, ...points.map(p => [-1 * p[0], p[1]])];
    return d3.regressionPoly().order(2)(points);
  }

  let leftBsValue = centralized.xTransform.invert(0);
  let leftStart = ([0, 600, 1000].includes(leftBsValue)) ? 0 : 1;
  let rightStart = 11 - centralizedPoints.length;
  let leftRSquared, rightRSquared;

  function getBestQuadraticRecursive(left, right) {
    leftRSquared ??= doRegressionWithOffset(left).rSquared;
    rightRSquared ??= doRegressionWithOffset(right).rSquared;

    let mid = left + (right - left) / 2;
    let midRegression = doRegressionWithOffset(mid);
    let midRSquared = midRegression.rSquared;

    // console.log('getBestQuadraticRecursive', {left, leftRSquared, mid, midRSquared, right, rightRSquared});
    if (midRSquared < Math.min(leftRSquared, rightRSquared)) {
      // console.log('getBestQuadraticRecursive', 'getting worse somehow. abort!');
      let bestSurvivor = (leftRSquared > rightRSquared) ? left : right;
      let result = doRegressionWithOffset(bestSurvivor);
      result.offset = bestSurvivor;
      return result;
    }
    if (right - left < 0.01) {
      // console.log('getBestQuadraticRecursive', 'done');
      midRegression.offset = mid;
      return midRegression;
    }
    if (leftRSquared < rightRSquared) {
      leftRSquared = midRSquared;
      return getBestQuadraticRecursive(mid, right);
    }
    else {
      rightRSquared = midRSquared;
      return getBestQuadraticRecursive(left, mid);
    }
  }
  
  let bestQuadratic = getBestQuadraticRecursive(leftStart, rightStart);
  let rawPredict = bestQuadratic.predict;
  let offset = bestQuadratic.offset;
  bestQuadratic.predict = function(x) {
    return rawPredict(x + offset);
  }
  
  let best = (linear.rSquared >= bestQuadratic.rSquared) ? linear : bestQuadratic;
  return best;
}

function findInverse(predict, targetValue, range) {
  range ??= [0, 1000];

  let leftDistance, rightDistance;
  function doSearch(left, right) {
    leftDistance ??= Math.abs(predict(left) - targetValue);
    if (leftDistance == 0) return left;

    rightDistance ??= Math.abs(predict(right) - targetValue);
    if (rightDistance == 0) return right;

    let mid = (left + right) / 2;
    let midDistance = Math.abs(predict(mid) - targetValue);
    if (midDistance == 0) return mid;

    if (right - left < 0.01) {
      return mid;
    }
    if (leftDistance > rightDistance) {
      leftDistance = midDistance;
      return doSearch(mid, right);
    }
    else {
      rightDistance = midDistance;
      return doSearch(left, mid);
    }
  }
  return doSearch(...range);
}