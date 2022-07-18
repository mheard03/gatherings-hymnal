<script>
import { scaleLinear } from 'd3-scale';
import userSettings from '../userSettings';
import PinchManager from './Pinch.js';
import { nextTick } from 'vue';

const minFontSize = 14;
const maxFontSize = 64;
const h1FontWeightScale = scaleLinear().domain([1.2, 1.067]).range([400, 600]).clamp(true);
const fontSizeScale = scaleLinear().domain([16, 64, 128]).range([1, 0.5, 0.25]).clamp(true);
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
      let h1Size = this.fontSize * Math.pow(this.headingSizeIncrease, 5);
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
      let passivePinchEvents = false; // !(this.enableBrowserZoom && this.enableFontZoom);
      this.pinchManager.addOrUpdateListeners({ passive: passivePinchEvents });

      let obj = {
        viewportScale: this.viewportScale, 
        fontSize: this.fontSize,
        enableBrowserZoom: this.enableBrowserZoom,
        enableFontZoom: this.enableFontZoom,
        passive: passivePinchEvents
      };
      console.log('zoomProps', JSON.stringify(obj));

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
      console.log('onPinchStart');

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
          // Looks like a zoom out; prevent the browser from handling it
          pinch.preventDefault();          
          this.enableBrowserZoom = false;
          console.log('preventDefault');
        }
      }

      let tempScale = scaleLinear()
        .domain([0, pinch.initialDistance])
        .range([this.fontSize, this.fontSize * 2]);
      let domainMin = tempScale.invert(minFontSize);
      let domainMax = tempScale.invert(maxFontSize);
      this.zoomScale = scaleLinear().domain([domainMin, domainMax]).range([minFontSize, maxFontSize]).clamp(true);
    },
    onPinch(e) {
      this.onResize();
      let pinch = e.detail;
      if (pinch.isIgnored || !this.enableFontZoom) return;

      
      this.userSettings.fontSize = this.zoomScale(pinch.delta);
    },
    onPinchEnd(e) {
      console.log('onPinchEnd');
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
          document.body.classList.remove("browserPinchDisabled");
        }
        else {
          document.body.classList.add("browserPinchDisabled");
        }

        /*
        let maxScale = value ? "10.0" : "1.0";
        let userScalable = value ? "yes" : "no";
        let metaContent = `width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=${maxScale}, user-scalable=${userScalable}`;

        let existingMeta = document.querySelector("meta[name=viewport]");
        if (existingMeta && existingMeta.getAttribute("content") == metaContent) return;

        let newMeta = document.createElement("meta");
        newMeta.setAttribute("name", "viewport");
        newMeta.setAttribute("content", metaContent);
        document.head.append(newMeta);
        if (existingMeta) existingMeta.remove();
        */
      },
      immediate: true
    }
  }
}
</script>

<template>
  <Teleport to="head">
    <component :is="'style'" id="fontSizing" type="text/css">
      html, body {
        touch-action: pan-x pan-y pinch-zoom
      }
      .browserPinchDisabled {
        touch-action: pan-x pan-y !important;
      }
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