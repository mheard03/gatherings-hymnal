<script>
import HymnsDbClient from '@/hymnsDb/hymns-db-client.js';
let STATES = HymnsDbClient.STATES;

export default {
  props: {
    progressProp: { required: true },
    content: { type: String, default (props) { return props.progressProp } },
    loading: { type: String, default (props) { return `Loading ${props.content}...` } },
    error: { type: String, default (props) { return `Error loading ${props.content}.` } },
  },
  data() {
    return {
      STATES
    }
  },
  computed: {
    className() {
      return (this.progressPropObj.status == STATES.ERROR) ? "error" : "loading";
    },
    progressPropObj() {
      if (typeof(this.progressProp) == "string") {
        return HymnsDbClient.progress[this.progressProp];
      }
      else {
        return this.progressProp;
      }
    }
  }
}
</script>

<template>
  <div v-bind="$attrs" v-if="!progressPropObj.status">
    <div class="hymns-db-status-block" :class="className">
      <div class="hymns-db-status-content">
        <template v-if="className == 'error'">
          <span class="message">{{ error }}</span>
          <span class="message-details" v-if="progressPropObj.errorMesage">{{ progressPropObj.errorMesage }}</span>
        </template>  
        <template v-else>
          <div class="spinner-border mb-2"></div>
          <span class="message fs-5" role="status">{{ loading }}</span>
        </template> 
      </div>
    </div>
  </div>
  <template v-else>
    <slot></slot>
  </template>
</template>


<style scoped lang="scss">
/* --- HymnsDbProgress.vue --- */
@import "../scss/bootstrap-base";

.hymns-db-status-block {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(var(--font-size) * 12);

  .hymns-db-status-content {
    text-align: center;
    .message {
      color: var(--gray-800);
    }
    > * {
      margin-left: auto;
      margin-right: auto;
    }
    .spinner-border {
      display: block;
    }
  }
}
</style>

