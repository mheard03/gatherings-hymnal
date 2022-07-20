<script>
import { scaleLinear } from 'd3-scale';
import userSettings from '../userSettings';
import PinchManager from './Pinch.js';
import { nextTick } from 'vue';

const minFontSize = 14;
const maxFontSize = 64;
const h1FontWeightScale = scaleLinear().domain([1.2, 1.067]).range([400, 600]).clamp(true);
const fontSizeScale = scaleLinear().domain([24, 64]).range([1, 0.5]).clamp(true);
const h1MaxSize = 90;

export default {
  inject: ['userSettings', 'appContainer'],
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
      if (!result || isNaN(result)) result = 16;
      result = Math.max(result, minFontSize);
      result = Math.min(result, maxFontSize);
      return result;
    },
    fontSizeScale() {
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
  },
  unmounted() {
    window.removeEventListener("resize", this.onResize);
    window.visualViewport.removeEventListener("resize", this.onResize);
    this.removePinchListeners();
    this.pinchManager.destroy();
  },
  methods: {
    async updateZoomProps() {
      this.viewportScale = window.visualViewport.scale;
      this.enableBrowserZoom = (this.viewportScale != 1 || this.fontSize >= maxFontSize);
      this.enableFontZoom = (this.viewportScale == 1);

      await nextTick();
      this.pinchManager.addOrUpdateListeners({ passive: !this.enableFontZoom });
    },
    onResize() {
      this.viewportScale = window.visualViewport.scale;
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

      await nextTick();
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
    /*
    onPinchStart(state) {
      this.viewportScale = window.visualViewport.scale;
      this.isFontZoomActive = false;
      if (this.isViewportScaled) {
        console.log('ignoring pinchStart', state);
        return "po-tae-toe";
      };

      console.log('pinchStart', state);

      // zoomTarget
      let origin = { x: state.origin[0], y: state.origin[1] };
      let elements = document.elementsFromPoint(origin.x, origin.y);
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

      const getPct = (el, y) => {
        let bbox = el.getBoundingClientRect();
        return scaleLinear().domain([bbox.top, bbox.bottom]).range([0,1])(y);
      }

      let targetElement = elements[0];
      let targetElementPct = getPct(targetElement, origin.y);
      let viewportPct = getPct(document.scrollingElement, origin.y);
      this.zoomTarget = { element: targetElement, elementPct: targetElementPct, viewportPct };

      // zoomScale
      let pointerDistance = state.da[0];
      let distanceTo64 = maxFontSize - this.fontSize;
      let distanceTo14 = this.fontSize - minFontSize;
      distanceTo64 *= 4;
      distanceTo14 *= 4;
      this.zoomScale = scaleLinear().domain([pointerDistance - distanceTo14, pointerDistance + distanceTo64]).range([minFontSize, maxFontSize]).clamp(true);

      return 'potato';
    },
    onPinch(state) {
      this.viewportScale = window.visualViewport.scale;
      if (this.isViewportScaled) return;

      if (!this.isFontZoomActive) {
        let scale = state.movement[0];
        if (scale > 1 && this.fontSize < maxFontSize) {
          this.isFontZoomActive = true;
        }
        if (scale < 1 && this.fontSize > minFontSize) {
          this.isFontZoomActive = true;
        }
      }

      if (this.isFontZoomActive) {
        let pointerDistance = state.da[0];
        this.userSettings.fontSize = Math.round(this.zoomScale(pointerDistance));
      }
    },
    onPinchEnd(state) {
      this.viewportScale = window.visualViewport.scale;
      console.log('pinchEnd', state);
      this.isFontZoomActive = false;
      this.zoomScale = undefined;
      this.zoomTarget = undefined;
    },
    logPointerLocation(e) {
      if (e.pointerType != "touch") return;
      if (window.visualViewport.scale > 1) return;

      let oldLength = Object.values(this.pointerEventCache).length;
      this.pointerEventCache[e.pointerId] = e;
      console.log(Object.keys(this.pointerEventCache));
      let pointers = Object.values(this.pointerEventCache);
      if (pointers.length != 2) return;
      pointers.forEach(p => {
        p.preventDefault();
      });

      let a = pointers[0].clientX - pointers[1].clientX;
      let b = pointers[0].clientY - pointers[1].clientY;
      let pointerDistance = Math.sqrt(a * a + b * b);

      if (this.zoomScale) {
        console.log(pointerDistance, this.zoomScale(400), this.zoomScale(pointerDistance));
      }
      if (oldLength == 2) return;

      // Set this.zoomScale

      
      let distanceTo64 = maxFontSize - this.fontSize;
      let distanceTo14 = this.fontSize - minFontSize;
      this.zoomScale = scaleLinear().domain([pointerDistance - distanceTo14, pointerDistance + distanceTo64]).range([minFontSize, maxFontSize]).clamp(true);
      window.zoomScale = this.zoomScale;

      // Set this.zoomTarget and metrics
      let zoomCenter = { 
        x: (pointers[0].clientX + pointers[1].clientX) / 2,
        y: (pointers[0].clientY + pointers[1].clientY) / 2
      };
      let elements = document.elementsFromPoint(zoomCenter.x, zoomCenter.y);
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

      const getPct = (el, y) => {
        let bbox = el.getBoundingClientRect();
        return scaleLinear().domain([bbox.top, bbox.bottom]).range([0,1])(y);
      }

      let targetElement = elements[0];
      let targetElementPct = getPct(targetElement, zoomCenter.y);
      let viewportPct = getPct(document.scrollingElement, zoomCenter.y);
      this.zoomTarget = { element: targetElement, elementPct: targetElementPct, viewportPct };
      console.log(this.zoomTarget);
    }
    */
  },
  watch: {
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
  <Teleport to="head">
    <component :is="'style'" id="fontSizing" type="text/css">
      /* Font sizing */
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
    </component>
  </Teleport>
</template>