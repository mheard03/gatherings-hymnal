<script>
import Fab from '@/components/Fab.vue';
import Search from '@/components/Search.vue';
import Modal from 'bootstrap/js/src/modal';

export default {
  components: { Fab, Search },
  data() {
    return {
      bsModal: undefined,
      heading: "Go to...",
      isModalVisible: false
    }
  },
  mounted() {
    this.bsModal = new Modal(this.$refs.goToModal);
    this.$refs.goToModal.addEventListener("shown.bs.modal", this.onModalShown);
    this.$refs.goToModal.addEventListener("hidden.bs.modal", this.onModalHidden);
    console.log('root', this.$root);
  },
  unmounted() {
    if (this.$refs.goToModal) {
      this.$refs.goToModal.removeEventListener("shown.bs.modal", this.onModalShown);
      this.$refs.goToModal.removeEventListener("hidden.bs.modal", this.onModalHidden);
    }
  },
  methods: {
    onFabClick() {
      this.bsModal.show();
    },
    onLabelChange(newLabel) {
      this.heading = newLabel;
    },
    async onModalShown() {
      this.$refs.search.value = "";
      this.isModalVisible = true;
      await this.$nextTick();
      this.$refs.search.focus();
    },
    onModalHidden() {
      this.isModalVisible = false;
    }
  },
  watch: {
    $route() {
      this.bsModal.hide();
    }
  }
}

</script>

<template>
  <Fab @click="onFabClick" :style="{ opacity: (isModalVisible ? 0 : 1) }"></Fab>
  <div class="modal fade" id="goToModal" ref="goToModal" tabindex="-1" aria-labelledby="goToModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-fullscreen-md-down">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="goToModalLabel">{{ heading }}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body pt-2">
          <Search ref="search" @labelChange="onLabelChange" @heightChange="console.log('heightChange')" :hide-label="true"></Search>
        </div>
      </div>
    </div>
  </div>
</template>


<style scoped lang="scss">
/* --- GoTo.vue --- */
#goToModal {
  .modal-header {
    border-bottom: none;
    padding-bottom: 0;
  }
  .modal-body {
    padding-top: 0;
    min-height: calc(var(--input-height) * 6);
  }
}
</style>


