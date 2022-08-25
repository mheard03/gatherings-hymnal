<template>
  <div id="tocContainer" ref="tocContainer">
    <div class="bg-white border-bottom">
      <div class="dropdown">
        <div id="tocCurrent" data-bs-toggle="dropdown" data-bs-offset="0, -10" aria-expanded="false" ref="toggler" class="container">
          <div id="tocHeadClosed">
            <div class="d-flex align-items-center">
              <svg class="flex-shrink-0 me-2"><use href="#toc" /></svg>
              <h5 class="mb-0 flex-grow-1">
                <span class="d-chonk-none d-none d-md-inline">{{ parentLabel }}</span>{{ label }}
              </h5>
            </div>
          </div>
          <div id="tocHeadOpen">
            <div class="d-flex align-items-center">
              <svg class="flex-shrink-0 me-2"><use href="#toc" /></svg>
              <h5 class="mb-0 flex-grow-1">Contents</h5>
              <svg class="flex-shrink-0"><use href="#close" /></svg>
            </div>
          </div>
        </div>
        <ul class="dropdown-menu container w-100 scaled" area-labelledby="tocCurrent">
          <template v-for="section of sections">
            <li>
              <a class="dropdown-item" 
                @click.prevent="$emit('input', section.htmlId)"
                :href="`#${section.htmlId}`" 
                :class="(section.htmlId == activeSectionId) ? 'active' : ''">{{ section.name }}</a>
            </li>
            <template v-for="child of section.children">
              <li class="child" v-if="child.name">
                <a class="dropdown-item" 
                  @click.prevent="$emit('input', child.htmlId)"
                  :href="`#${child.htmlId}`" 
                  :class="(child.htmlId == activeSectionId) ? 'active' : ''">{{ child.name }}</a>
              </li>
            </template>
          </template>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { nextTick } from 'vue';
import * as bootstrap from 'bootstrap';
import maxSize from 'popper-max-size-modifier';
window.bootstrap = bootstrap;

export default {
  props: {
    sections: { default: [] },
    activeSectionId: undefined
  },
  data() {
    return {
      bsDropdown: undefined
    }
  },
  computed: {
    activeSection() {
      let allSections = this.sections.flatMap(s => [s, ...(s.children || [])]);
      let activeSection = allSections.find(s => s.htmlId == this.activeSectionId);
      if (activeSection && !activeSection.name) activeSection = activeSection.parent;
      return activeSection;
    },
    label() {
      return (this.activeSection) ? this.activeSection.name : "Contents";
    },
    parentLabel() {
      let parentSection = (this.activeSection) ? this.activeSection.parent : undefined;
      if (parentSection && parentSection.name) return parentSection.name + ": ";
    }
  },
  async mounted() {
    const applyMaxSize = {
      name: 'applyMaxSize',
      enabled: true,
      phase: 'beforeWrite',
      requires: ['maxSize'],
      fn({state}) {
        state.styles.popper = {
          ...state.styles.popper,
          maxHeight: `${state.modifiersData.maxSize.height}px`
        };
      }
    };
    let config = {
      popperConfig(defaultBsPopperConfig) {
        let cfg = JSON.parse(JSON.stringify(defaultBsPopperConfig));
        cfg.strategy = 'fixed';
        cfg.tether = false;
        
        cfg.modifiers.push(maxSize);
        cfg.modifiers.push(applyMaxSize);
        
        let flip = cfg.modifiers.find(m => m.name == "flip");
        if (!flip) {
          flip = { name: 'flip', options: {} };
          cfg.modifiers.push(flip);
        }
        flip.enabled = false;

        return cfg;
      }
    }

    this.tocDropdown = new bootstrap.Dropdown(this.$refs.toggler, config);
    document.addEventListener('shown.bs.dropdown', this.updateTocScrollPosition);
  },
  unmounted() {
    if (this.bsDropdown) this.bsDropdown.dispose();
    document.removeEventListener('shown.bs.dropdown', this.updateTocScrollPosition);
  },
  methods: {
    getHeight() {
      return this.$refs.tocContainer.offsetHeight;
    },
    async updateTocScrollPosition() {
      await nextTick();
      let activeItem = document.querySelector("#tocContainer a.active");
      if (activeItem) {
        activeItem.scrollIntoView({ block: "center" });
      }
    }
  }
}
</script>


<style type="text/css">
  main .dropdown-menu a.dropdown-item {
    padding-left: var(--bs-gutter-x, 0.75rem);
  }
  main .dropdown-menu .child a.dropdown-item {
    padding-left: calc(var(--bs-gutter-x, 0.75rem) * 2);
  }
  #tocContainer {
    position: sticky;
    top: -1px;
    user-select: none;
  }
  #tocContainer svg {
    width: calc(var(--scaled-font-size) * 1.5);
    height: calc(var(--scaled-font-size) * 1.5);
  }
  #tocHeadClosed,
  .show #tocHeadOpen {
    display: block;
  }
  .show #tocHeadClosed,
  #tocHeadOpen {
    display: none;
  }


  #tocCurrent {
    cursor: pointer;
  }

  #tocCurrent,
  #tocCurrent h5 {
    line-height: var(--input-height);
  }
  #tocContainer .dropdown-menu {
    overflow-y: auto;
  }
  
</style>
