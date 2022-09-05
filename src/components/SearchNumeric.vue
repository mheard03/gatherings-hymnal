<script>
// TODO: Fix inputs like 144 generating multiple focused links on cursor down
export default {
  data() {
    return {
      hideLabel: this.$parent.$props.hideLabel,
      label: "Go to song...",
      value: '',
      // TODO: Get defaultFocusedHymnalId from router
      defaultFocusedHymnalId: this.$root.routeHymnalId,
      userFocusedHymnalId: '',
      hymnsProgress: this.$hymnsDb.progress["hymns"],
      results: []
    }
  },
  computed: {
    valueasnumber() {
      return parseInt(this.value);
    },
    hymnsState() {
      const STATES = this.$hymnsDb.STATES;
      if (this.hymnsProgress.status === STATES.ERROR) return 'error';
      if (this.hymnsProgress.status === STATES.READY) return 'ready';
      return 'loading';
    },
    resultState() {
      if (!this.valueasnumber) return 'blank';
      if (this.results.length) return 'visible';
      return 'no-results';
    },
    focusedHymnalId() {
      if (this.results.length == 0) return '';
      if (this.results.find(h => h.hymnalId == this.userFocusedHymnalId)) return this.userFocusedHymnalId;
      if (this.results.find(h => h.hymnalId == this.defaultFocusedHymnalId)) return this.defaultFocusedHymnalId;
      return this.results[0].hymnalId
    }
  },
  watch: {
    async valueasnumber(newValue) {
      let hymnNo = newValue;
      if (!hymnNo || hymnNo < 0) {
        this.results = [];
      }
      else {
        this.results = await this.$hymnsDb.getHymns(hymnNo);
      }
    },
    results(newValue, oldValue) {
      if (this.focusedHymnalId != this.userFocusedHymnalId) this.userFocusedHymnalId = '';
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
        let selectedHymn = this.results.find(h => h.hymnalId== this.focusedHymnalId);
        if (selectedHymn) {
          this.$router.push(selectedHymn.url);
        }
        return;
      }

      if (resultCount == 1) {
        this.userFocusedHymnalId = this.results[0].hymnal
        return;
      }
      let resultIndex = this.results.findIndex(r => r.hymnalId== this.focusedHymnalId);
      resultIndex += (e.key == "ArrowUp") ? -1 : 1;
      while (resultIndex < 0) { resultIndex += resultCount; }
      resultIndex = resultIndex % resultCount;

      this.userFocusedHymnalId = this.results[resultIndex].hymnalId
    },
    getHymnClasses(hymn) {
      console.log('getHymnClasses', this.focusedHymnalId);
      let classList = [`theme-${hymn.hymnalId}`];
      if (hymn.hymnalId== this.focusedHymnalId) classList.push("focus");
      return classList;
    },
  }
}

</script>

<template>
  <div class="form-group">
    <label v-if="!hideLabel" for="txtSongNumber" class="form-label" :class="this.$parent.$props.labelClass">{{ label }}</label>
    <div style="position: relative; min-height: var(--input-height)">
      <div id="songLookup" class="form-control d-flex flex-column flex-fill" style="position:absolute;" ref="songLookup" @keydown="onKeyDown">
        <input id="txtSongNumber" class="form-control" type="text" autocomplete="off" placeholder="Song number" inputmode="decimal" ref="txtSongNumber" v-model="value" @input="onInput">
        <div id="songLookupResults" class="dropdown-menu force-show" ref="songLookupResults">
          <a class="dropdown-item disabled" v-show="hymnsState === 'loading' && value != ''">
            <div class="spinner-border spinner-border-sm me-2"></div>
            <span class="message" role="status">Loading hymns</span>
          </a>
          <a class="dropdown-item disabled" v-show="hymnsState === 'error'">Couldn't load hymns</a>
          <template v-if="hymnsState == 'ready'">
            <a class="dropdown-item disabled" v-show="resultState == 'no-results'">No hymns found</a>
            <template v-for="hymn in results">
              <router-link :to="hymn.url" :class="['dropdown-item', ...getHymnClasses(hymn)]">
                <!-- TODO: Actual hymnal name -->
                <div class="hymnal-label scaled"><span>{{ hymn.hymnalId }}</span></div>
                {{ hymn.hymnNoTxt }} - {{ hymn.title }}
              </router-link>
            </template>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>


<style scoped lang="scss">
/* --- SearchNumeric.vue --- */
// TODO: Switch from '@import bootstrap-base' to '@forward/@use hymnal.scss'
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

  overflow: hidden;
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
    .hymnalIdlabel {
      color: var(--ui-color);
      text-transform: uppercase;
      font-size: $font-size-sm;
      letter-spacing: 0.05em;
      font-weight: 500;
    }
    &:active .hymnalIdlabel {
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
