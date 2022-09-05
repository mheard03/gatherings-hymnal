  <script>
import SearchNumeric from './SearchNumeric.vue';
import SearchKeyword from './SearchKeyword.vue';

export default {
  emits: ['input', 'labelChange', 'heightChange'],
  props: {
    hideLabel: { type: Boolean, required: false, default: false },
    labelClass: { type: String, required: false, default: "" },
    initialMode: { type: String, required: false, default: "numeric" }
  },
  data() {
    return {
      mode: this.initialMode,
      activeField: {},
      label: undefined
    };
  },
  mounted() {
    this.setMode(this.mode);
  },
  methods: {
    setMode(mode) {
      if (mode != "numeric" && mode != "keyword") mode = "";
      mode = mode || "numeric";
      this.activeField = (mode == "keyword") ? this.$refs.searchKeyword : this.$refs.searchNumeric;
      this.mode = mode;
      this.$emit('labelChange', this.activeField.label);
    },
    focus() {
      this.activeField.$el.querySelector("input").focus();
    }
  },
  computed: {
    value: {
      get() {
        return this.activeField.value;
      },
      set(newValue) {
        this.activeField.value = newValue;
      }
    }
  },
  components: {
    SearchNumeric,
    SearchKeyword
  },
  watch: {
    value(newValue) {
      this.$emit("input", { mode: this.mode, value: newValue });
    },
    async mode() {
      await this.$nextTick();
      this.focus();
    }
  }
}

</script>

<template>
  <div v-show="mode == 'numeric'">
    <SearchNumeric ref="searchNumeric"></SearchNumeric>
    <p class="mt-2">or <a href="#" @click.stop.prevent="setMode('keyword')">search by keyword</a></p>
  </div>
  <div v-show="mode == 'keyword'">
    <SearchKeyword ref="searchKeyword"></SearchKeyword>
    <p class="mt-2">or <a href="#" @click.stop.prevent="setMode('numeric')">enter a song number</a></p>
  </div>
</template>