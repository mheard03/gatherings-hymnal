import {ticks} from "d3-array";
import continuous from "./continuous.js";
import {initRange} from "@/../node_modules/d3-scale/src/init.js";

export function linearish(scale) {
  var domain = scale.domain;

  scale.ticks = function(count) {
    var d = domain();
    return ticks(d[0], d[d.length - 1], count == null ? 10 : count);
  };

  return scale;
}

export default function linear() {
  var scale = continuous();

  initRange.apply(scale, arguments);

  return linearish(scale);
}
