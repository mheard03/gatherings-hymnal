  <script>
import { nextTick } from 'vue';
import { hymnCompare } from '../assets/hymns-db';

// TODO: Fix inputs like 144 generating multiple focused links
// TODO: Remove double heading for inputs like 144

export default {
  inject: ['hymnsDB'],
  props: {
    hideLabel: { type: Boolean, required: false, default: false }
  },
  data() {
    return {
      input: undefined,
      value: '',
      // TODO: Get defaultFocusedHymnal from router
      defaultFocusedHymnal: 'missions',
      userFocusedHymnal: ''
    }
  },
  computed: {
    valueasnumber() {
      return parseInt(this.value);
    },
    results() {
      let hymnNo = this.valueasnumber;
      if (!hymnNo || hymnNo < 0) return [];
      let filtered = this.hymnsDB.getHymns(hymnNo);
      return filtered;
    },
    resultState() {
      if (!this.valueasnumber) return 'blank';
      if (this.results.length) return 'visible';
      if (!this.hymnsDB || Object.values(this.hymnsDB).length == 0) return 'loading';
      return 'no-results';
    },
    focusedHymnal() {
      if (this.results.length == 0) return '';
      if (this.results.find(h => h.hymnal == this.userFocusedHymnal)) return this.userFocusedHymnal;
      if (this.results.find(h => h.hymnal == this.defaultFocusedHymnal)) return this.defaultFocusedHymnal;
      return this.results[0].hymnal;
    }
  },
  watch: {
    results(newValue, oldValue) {
      if (this.focusedHymnal != this.userFocusedHymnal) this.userFocusedHymnal = '';
    }
  },
  methods: {
    onInput() {
      this.value = this.value.replaceAll(/[^\d]+/gi, "");
    },
    onKeyDown(e) {
      if (["Enter", "ArrowUp", "ArrowDown"].indexOf(e.key) < 0) return;
      e.preventDefault();
      e.stopPropagation();
      
      let resultCount = this.results.length;
      if (resultCount == 0) return;

      if (e.key == "Enter") {
        let selectedHymn = this.results.find(h => h.hymnal == this.focusedHymnal);
        if (selectedHymn) {
          // TODO: Navigate
          console.log('Navigating', selectedHymn.hymnId);
        }
        return;
      }

      if (resultCount == 1) {
        this.userFocusedHymnal = this.results[0].hymnal
        return;
      }
      let resultIndex = this.results.findIndex(r => r.hymnal == this.focusedHymnal);
      resultIndex += (e.key == "ArrowUp") ? -1 : 1;
      while (resultIndex < 0) { resultIndex += resultCount; }
      resultIndex = resultIndex % resultCount;

      this.userFocusedHymnal = this.results[resultIndex].hymnal;
    },
    getHymnClasses(hymn) {
      console.log('getHymnClasses', this.focusedHymnal);
      let classList = [`theme-${hymn.hymnal}`];
      if (hymn.hymnal == this.focusedHymnal) classList.push("focus");
      return classList;
    },
  },
  mounted() {
    this.input = this.$refs.txtSongNumber;
  }
}

</script>

<template>
  <div class="form-group">
    <label v-if="showLabel" for="txtSongNumber" class="form-label">Go to song...</label>
    <div style="position: relative; min-height: var(--input-height)">
      <div id="songLookup" class="form-control d-flex flex-column flex-fill" style="position:absolute;" ref="songLookup" @keydown="onKeyDown">
        <input id="txtSongNumber" class="form-control" type="text" autocomplete="off" placeholder="Song number" inputmode="decimal" ref="txtSongNumber" v-model="value" @input="onInput">
        <div id="songLookupResults" class="dropdown-menu force-show" ref="songLookupResults">
          <a class="dropdown-item disabled" v-show="resultState == 'loading'">Hymn database still loading...</a>
          <a class="dropdown-item disabled" v-show="resultState == 'no-results'">No hymns found</a>
          <template v-for="hymn in results">
            <router-link :to="{ name: 'hymn', query: { hymnal: hymn.hymnal, hymnNo: hymn.hymnNo }, hash: ((hymn.suffix && hymn.suffix != 'A') ? `#${hymn.suffix}` : '')  }" :class="['dropdown-item', ...getHymnClasses(hymn)]">
              <!-- TODO: Actual hymnal name -->
              <div class="hymnal-label">{{ hymn.hymnal }}</div>
              {{ hymn.hymnNoTxt }} - {{ hymn.title }}
            </router-link>
          </template>
        </div>
      </div>
    </div>
  </div>
  <p class="mt-3">or <a href="#" @click.stop.prevent="toggleMode">search by keyword</a></p>
</template>


<style scoped lang="scss">
/* --- Search.vue --- */
@import "../scss/bootstrap-base";


#songLookup {
  padding: 0;
  &:focus-within {
    box-shadow: $input-focus-box-shadow;
  }
  &:not(:focus-within) {
    #songLookupResults {
      display: none;
    }
  }
}

#txtSongNumber {
  border: none;
  
  &:focus {
    box-shadow: none;
  }
  -webkit-appearance: none !important;
  -moz-appearance: none !important;
  appearance: textfield;
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    display: none;
    margin: 0;
  }
}

#songLookupResults {
  position: static !important;
  transform: none !important;
  padding: 0;
  border: none;
  border-radius: 0;
  background-color: transparent;
  &.force-show {
    display: block;
  }
  & > .dropdown-item {
    padding: $input-padding-y $input-padding-x;
    .hymnal-label {
      color: var(--ui-color);
      text-transform: uppercase;
      font-size: $font-size-sm;
      letter-spacing: 0.05em;
      font-weight: 500;
    }
    &:active .hymnal-label {
      color: white;
    }
    &:last-child {
      margin-bottom: var(--ui-border-radius);
    }
    &.focus:not(.active, :active) {
      color: $dropdown-link-hover-color;
      text-decoration: if($link-hover-decoration == underline, none, null);
      @include gradient-bg($dropdown-link-hover-bg);
    }
  }
  & > * {
    box-shadow: none;
    font-size: var(--ui-font-size);
  }
}
</style>
