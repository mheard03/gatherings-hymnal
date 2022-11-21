<script>
import ModeBuilder from '@/../hymnals/build-scripts/build-themes/mode-builder';
const modeList = [ "light", "hcLight", "dark", "hcDark" ];

export default {
  inject: ['userSettings'],
  data() {
    return {
      tmpModeCss: ""
    }
  },
  computed: {
    mode() {
      let result = this.userSettings.mode;
      if (!result) result = undefined;
      return result;
    },
    cssClass() {
      if (this.mode) {
        return `mode-${this.mode}`;
      }
    }
  },
  mounted() {
    document.head.append(document.querySelector("#tmpModes"));
    if (this.mode) {
      document.querySelector("html").classList.add(`mode-${this.mode}`);
    }
    this.generateThemeCss();
  },
  methods: {
    async generateThemeCss() {
      let mb = new ModeBuilder();
      this.tmpModeCss = mb.generateThemeCss();
    }
  },
  watch: {
    cssClass: {
      handler(newValue, oldValue) {
        if (newValue === oldValue) return;
        let classList = document.querySelector("html").classList;
        if (newValue && oldValue) {
          classList.replace(oldValue, newValue) || classList.add(newValue);
        }
        else if (newValue) {
          classList.add(newValue);
        }
        let badClasses = modeList.map(m => `mode-${m}`).filter(m => m != newValue);
        classList.remove(...badClasses);
      },
      immediate: true
    }
  }
}
</script>


<template>
  <Teleport to="#tmpModes">
    {{ tmpModeCss }}
  </Teleport>
</template>