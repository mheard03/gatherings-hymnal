<script>
import { scaleLinear } from 'd3-scale';
import userSettings from '../userSettings';

const h1FontWeightScale = scaleLinear().domain([1.2, 1.067]).range([400, 600]).clamp(true);
const fontSizeScale = scaleLinear().domain([16, 64, 128]).range([1, 0.5, 0.25]).clamp(true);
const h1MaxSize = 90;

export default {
  inject: ['userSettings'],
  computed: {
    fontSize() {
      let result = this.userSettings.fontSize;
      if (!result || isNaN(result)) result = 16;
      result = Math.max(result, 14);
      result = Math.min(result, 90);
      return result;
    },
    fontSizeScale() {
      /*
      let scaledFontSizeLimit = fontSizeScale.domain()[1];
      if (this.fontSize > scaledFontSizeLimit) {
        // return whatever value results in a 32px scaled font size
        let maxScaledFontSize = fontSizeScale.range()[1] * fontSizeScale.domain()[1];
        return this.fontSize / maxScaledFontSize;
      }
      */
      return fontSizeScale(this.fontSize);
    },
    headingSizeIncrease() {
      // size of h1 = fontSize * fontSizePower⁵, therefore fontSizePower = fifth root of h1/fontSize
      let result = Math.pow(h1MaxSize/this.fontSize, 0.2);
      result = Math.min(result, 1.2);
      result = Math.max(result, 1.067);
      return result;
    },
    headingWeights() {
      let h1Size = this.fontSize * Math.pow(this.headingSizeIncrease, 5);
      let h1Weight = h1FontWeightScale(this.headingSizeIncrease);
      let fontWeightScale = scaleLinear().domain([6, 1]).range([400, h1Weight]).clamp(true);
      let result = [];
      for (let i = 1; i < 6; i++) {
        result.push({ varName: `--h${i}-font-weight`, value: fontWeightScale(i) });
      }
      return result;
    }
  }
}
</script>

<template>
  <Teleport to="head">
    <component :is="'style'" id="fontSizing" type="text/css">
      :root {
        --font-size: {{ fontSize }}px;
        --font-size-scale: 1;
        --scaled-font-size: calc(var(--font-size) * var(--font-size-scale));
        --heading-size-increase: {{ headingSizeIncrease }};
        <template v-for="item in headingWeights">
          {{ item.varName }}: {{ item.value }};
        </template>
      }

      .fullSize {
        --font-size-scale: 1;
        <template v-for="item in headingWeights">
          {{ item.varName }}: 400;
        </template>
      }
      .scaled {
        --scaled-font-size: calc(var(--font-size) * var(--font-size-scale));
        --font-size-scale: {{ fontSizeScale }};
        <template v-for="item in headingWeights">
          {{ item.varName }}: 400;
        </template>
      }
    </component>
  </Teleport>
</template>