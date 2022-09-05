export default {
  computed: {
    fontSize() {
      let fontSizeVar = window.getComputedStyle(this.$el || document.body).getPropertyValue("--font-size");
      return parseFloat(fontSizeVar) || 16;
    }
  }
};