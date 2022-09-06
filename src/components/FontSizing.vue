<script>
import scaleLinear from '@/utils/scaleLinear/scaleLinear.js';
import PinchManager from './Pinch.js';

const minFontSize = 14;
const defaultFontSize = 16;
const maxFontSize = 64;

/* 
This used to be just
  const fontSizeScale = scaleLinear().domain([24, 64]).range([1, 0.5]).clamp(true);
but since fontSizeScale is multiplied by the current font size, the result turned out to be a parabola and scaled values were getting too big and then shrinking towards the right side of the domain.
*/
const fontSizeScaleScale = scaleLinear()
  .domain([minFontSize, 24, maxFontSize])
  .range([defaultFontSize, defaultFontSize, (maxFontSize / 2)])
  .clamp(true);

const h1MaxSize = 90;
const h1FontWeightScale = scaleLinear().domain([1.2, 1.067]).range([400, 600]).clamp(true);


export default {
  inject: ['userSettings'],
  data() {
    return {
      viewportScale: window.visualViewport.scale,
      enableBrowserZoom: true,
      enableFontZoom: true,
      pinchManager: undefined,
      zoomTarget: undefined,
      zoomScale: undefined
    }
  },
  computed: {
    fontSize() {
      let result = this.userSettings.fontSize;
      if (!result || isNaN(result)) result = defaultFontSize;
      result = Math.max(result, minFontSize);
      result = Math.min(result, maxFontSize);
      return result;
    },
    fontSizeScale() {
      return fontSizeScaleScale(this.fontSize) / this.fontSize;
    },
    headingSizeIncrease() {
      // size of h1 = fontSize * fontSizePower⁵, therefore fontSizePower = fifth root of h1/fontSize
      let result = Math.pow(h1MaxSize/this.fontSize, 0.2);
      result = Math.min(result, 1.2);
      result = Math.max(result, 1.067);
      return result;
    },
    headingWeights() {
      let h1Weight = h1FontWeightScale(this.headingSizeIncrease);
      let fontWeightScale = scaleLinear().domain([6, 1]).range([400, h1Weight]).clamp(true);
      let result = [];
      for (let i = 1; i < 6; i++) {
        result.push({ varName: `--h${i}-font-weight`, value: fontWeightScale(i) });
      }
      return result;
    }
  },
  mounted() {
    window.addEventListener("resize", this.onResize);
    window.visualViewport.addEventListener("resize", this.onResize);
    this.pinchManager = new PinchManager(document.scrollingElement);
    this.updateZoomProps();
    this.addPinchListeners();
    document.addEventListener('keydown', this.onKeydown);
  },
  unmounted() {
    window.removeEventListener("resize", this.onResize);
    window.visualViewport.removeEventListener("resize", this.onResize);
    this.removePinchListeners();
    this.pinchManager.destroy();
    document.removeEventListener('keydown', this.onKeydown);
  },
  methods: {
    setChonkClass() {
      if (this.fontSize / window.visualViewport.width > 0.05) {
        document.body.classList.add("chonk");
      }
      else {
        document.body.classList.remove("chonk");
      }
    },
    async updateZoomProps() {
      this.viewportScale = window.visualViewport.scale;
      this.enableBrowserZoom = (this.viewportScale != 1 || this.fontSize >= maxFontSize);
      this.enableFontZoom = (this.viewportScale == 1);
      this.setChonkClass();

      await this.$nextTick();
      this.pinchManager.addOrUpdateListeners({ passive: !this.enableFontZoom });
    },
    onResize() {
      this.viewportScale = window.visualViewport.scale;
      this.setChonkClass();
    },
    addPinchListeners() {
      this.pinchManager.element.addEventListener('pinchstart', this.onPinchStart);
      this.pinchManager.element.addEventListener('pinchmove', this.onPinch);
      this.pinchManager.element.addEventListener('pinchend', this.onPinchEnd);
    },
    removePinchListeners() {
      this.pinchManager.element.removeEventListener('pinchstart', this.onPinchStart);
      this.pinchManager.element.removeEventListener('pinchmove', this.onPinch);
      this.pinchManager.element.removeEventListener('pinchend', this.onPinchEnd);
    },  
    onPinchStart(e) {
      this.onResize();
      let pinch = e.detail;

      if (!this.enableFontZoom) {
        pinch.ignore();
        return;
      }

      if (this.enableBrowserZoom && this.enableFontZoom) {
        if (pinch.initialDirection > 0) {
          // Looks like a zoom in; ignore it and let the browser handle it
          pinch.ignore();
          this.enableFontZoom = false;
          return;
        }
        else {
          // Looks like a zoom out; preventDefault and handle it here
          pinch.preventDefault();          
          this.enableBrowserZoom = false;
        }
      }

      // Pause animations
      document.scrollingElement.classList.add("pinching");
      
      // Establish zoomScale (pinch delta -> font size)
      let tempScale = scaleLinear()
        .domain([0, pinch.initialDistance])
        .range([this.fontSize, this.fontSize * 2]);
      let domainMin = tempScale.invert(minFontSize);
      let domainMax = tempScale.invert(maxFontSize);
      this.zoomScale = scaleLinear().domain([domainMin, domainMax]).range([minFontSize, maxFontSize]).clamp(true);

      // Find zoomTarget
      let center = { x: pinch.center[0], y: pinch.center[1] };

      let elements = document.elementsFromPoint(center.x, center.y);
      elements = elements.filter(el => {
        if (!el.closest("main")) return false;
        if (el.closest("nav")) return false;
        let styles = window.getComputedStyle(el);
        if (styles.display == "none") return false;
        if (styles.visibility != "visible") return false;
        if (styles.position != "static" && styles.position != "relative") return false;
        return true;
      });
      elements.push(document.scrollingElement);

      let targetElement = elements[0];
      let bbox = targetElement.getBoundingClientRect();
      let elementPct = scaleLinear().domain([bbox.top, bbox.bottom]).range([0,1])(center.y);
      this.zoomTarget = { element: targetElement, elementPct };
      console.log('zoomTarget', this.zoomTarget);
    },
    async onPinch(e) {
      this.onResize();
      let pinch = e.detail;
      if (pinch.isIgnored || !this.enableFontZoom) return;

      let newFontSize = this.zoomScale(pinch.delta);
      newFontSize = Math.round(newFontSize * 4) / 4;
      this.userSettings.fontSize = newFontSize;

      await this.$nextTick();
      if (this.zoomTarget) {
        let offset = getOffset(this.zoomTarget.element);
        let currentY = offset.top + offset.height * this.zoomTarget.elementPct;
        document.scrollingElement.scrollTo(0, currentY - pinch.center[1]);
      }
    },
    onPinchEnd(e) {
      document.scrollingElement.classList.remove("pinching");
      this.updateZoomProps();
      this.zoomScale = undefined;
      this.zoomTarget = undefined;
    },
    onKeydown(e) {
      if (e.key != "0") return;
      if (e.metaKey || e.ctrlKey) {
        this.userSettings.fontSize = defaultFontSize;
      }
    },
  },
  watch: {
    fontSize: {
      handler() {
        this.setChonkClass();
      },
      immediate: true
    },
    viewportScale: {
      handler() {
        this.updateZoomProps;
      },
      immediate: true
    },
    enableBrowserZoom: {
      handler(value) {
        if (value) {
          document.scrollingElement.classList.remove("browserPinchDisabled");
        }
        else {
          document.scrollingElement.classList.add("browserPinchDisabled");
        }
      },
      immediate: true
    }
  }
}

function getOffset(el) {
  let offset = {
    height: el.offsetHeight,
    top: el.offsetTop
  };
  let parent = el.offsetParent;
  while (parent) {
    offset.top += parent.offsetTop;
    parent = parent.offsetParent;
  }
  return offset;
}
</script>

<template>
  <Teleport to="#fontSizing">
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
      --scaled-font-size: calc(var(--font-size) * var(--font-size-scale));
      <template v-for="item in headingWeights">
        {{ item.varName }}: 400;
      </template>
    }
    .scaled {
      --font-size-scale: {{ fontSizeScale }};
      --scaled-font-size: calc(var(--font-size) * var(--font-size-scale));
      <template v-for="item in headingWeights">
        {{ item.varName }}: 400;
      </template>
    }
    html, body  {
      overflow-wrap: {{ (fontSize > 32) ? "anywhere" : "normal" }};
    }

    /* Pinch events */
    html, body {
      touch-action: auto;
    }
    .browserPinchDisabled {
      touch-action: pan-x pan-y !important;
    }
    .pinching, 
    .pinching * {
      transition-property: none !important;
      scroll-behavior: auto !important;
    }

    body.chonk .d-chonk-none {
      display: none !important;
    }
  </Teleport>
</template>