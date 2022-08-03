  <script>
import { nextTick } from 'vue';
import { hymnCompare } from '../assets/hymns-db';

export default {
  props: {
    hideButton: { type: Boolean, required: false, default: false },
  },
  data() {
    return {
      input: undefined,
      hideLabel: this.$parent.$props.hideLabel,
      value: ""
    }
  },
  computed: {
    hasValue() {
      return !!this.value.trim();
    }
  },
  methods: {
    onSubmit(e) {
      let nextRoute = { name: 'search', query: { keywords: this.value }};
      if (this.$route.name == "search") {
        this.$router.replace(nextRoute);
      }
      else {
        if (!this.value || !this.value.trim()) return;
        this.$router.push(nextRoute);
      }
    }
  }
}

</script>

<template>
  <div class="form-group">
    <label v-if="!hideLabel" for="txtKeywords" class="form-label" :class="this.$parent.$props.labelClass">Keyword search</label>
    <form class="input-group" @submit.stop.prevent="onSubmit">
      <input id="txtKeywords" class="form-control" type="text" placeholder="Song name or lyrics" v-model="value">
      <input type="submit" class="btn btn-fill" :class="hasValue ? '' : 'disabled'" v-if="!hideButton" value="Go">
    </form>
  </div>
</template>