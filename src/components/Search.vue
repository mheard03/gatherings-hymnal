  <script>
import { nextTick } from 'vue';
import { hymnCompare } from '../assets/hymns-db';

export default {
  inject: ['hymns'],
  data() {
    return {
      mode: 'hymnNo',
      isInputFocused: false,
      hymnNo: undefined,
      keywords: undefined,
    }
  },
  computed: {
    input() {
      if (this.mode == "keyword") return this.$refs.keywordInput;
      return this.$refs.hymnNoInput;
    },
    value() {
      if (this.mode == "keyword") {
        if (this.keywords && this.keywords.trim) {
          return this.keywords.trim();
        }
        return "";
      }
      return parseInt(this.hymnNo);
    },
    filteredHymns() {
      if (this.mode != "hymnNo" || this.value <= 0) return [];
      let filtered = Object.values(this.hymns).filter(h => h.hymnNo == this.value);
      filtered.sort(hymnCompare);
      return filtered;
    },
    isListVisible() {
      return this.isInputFocused && this.filteredHymns.length;
    },
  },
  methods: {
    onInput() {
      this.value = this.input.value
    },
    async onFocusChange() {
      await nextTick();
      this.isInputFocused = this.input && this.input.matches(":focus");
    },
    async setMode(value) {
      if (value != "keyword") value = "hymnNo";
      this.mode = value;
      
      await nextTick();
      if (this.input) {
        this.input.focus();
        this.value = this.input.value;
      }
    },
    toggleMode() {
      if (this.mode == "hymnNo") {
        this.setMode("keyword");
      } else {
        this.setMode("hymnNo");
      }
    }
  },
  mounted() {
    // window.hymns = this.hymns;
  }
}

</script>

<template>
  <div v-show="mode == 'hymnNo'">
    <label for="hymnNoInput">Go to hymn number</label><br>
    <input id="hymnNoInput" ref="hymnNoInput" type="text" autocomplete="off" v-model="hymnNo" @focus="onFocusChange" @blur="onFocusChange"><br>
    <ul v-show="isListVisible">
      <li v-for="hymn in filteredHymns" :class="hymn.hymnal">
        {{ hymn.hymnal }} {{ hymn.hymnNoTxt }} - {{ hymn.title }}
      </li>
    </ul>
    or <a href="#" @click.stop.prevent="toggleMode">search by keyword</a>
  </div>
  <div v-show="mode == 'keyword'">
    <label for="hymnNoInput">Search by keyword</label><br>
    <input ref="keywordInput" type="text" autocomplete="off" v-model="keywords" @focus="onFocusChange" @blur="onFocusChange"><br>
    or <a href="#" @click.stop.prevent="toggleMode">go to hymn number</a>
  </div>
  <div>value: {{ value }}</div>
  <div>focused: {{ isInputFocused }}</div>
  <div>filteredHymns: {{ filteredHymns.length }}</div>
</template>


<style scoped>
a {
  color: #42b983;
}
</style>
