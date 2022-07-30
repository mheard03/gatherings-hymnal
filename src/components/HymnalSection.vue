<template>
  <section :id="sectionModel.htmlId" class="hymnalSection" :class="className" ref="section">
    <component v-if="headingText" :is="headingTag">{{ headingText }}</component>
    <template v-if="renderMode == 'children'">
      <template v-for="child of sectionModel.children" v-bind:key="child.htmlId">
        <HymnalSection :sectionModel="child"></HymnalSection>
      </template>
    </template>
    <template v-if="renderMode == 'hymns'">
      <ul class="markerWidth" ref="ul" :style="`--marker-width: ${markerWidth}`">
        <template v-for="hymn of hymnInfos">
          <li :style="`--hymnNo: '${hymn.hymnNo}'`" ref="lis"><span>{{ hymn.hymnNo2 }}</span><a :href="hymn.url">{{ hymn.title }}</a></li>
        </template>
      </ul>     
    </template>
  </section>
</template>
<script>
import { nextTick } from 'vue';
import fontSizeMixin from '../fontSizeMixin.js'

const baseHeadingLevel = 2;
export default {
  mixins: [ fontSizeMixin ],
  props: {
    sectionModel: { required: true }
  },
  data() {
    return {
      markerWidth: '0.75rem',
      oldSections: []
    }
  },
  computed: {
    className() {
      let isOutdent = this.sectionModel.isVirtual && this.sectionModel.index > 0;
      return (isOutdent) ? "border-top" : "";
    },
    headingTag() {
      return "h" + (this.sectionModel.level + baseHeadingLevel);
    },
    headingText() {
      if (!this.sectionModel.name) return "";
      return this.sectionModel.ancestorsAndSelf
        .map(a => a.name)
        .filter(a => a)
        .join(": ");
    },
    renderMode() {
      if (this.sectionModel.children.length > 0) return "children";
      if (this.sectionModel.hymns.length > 0) return "hymns";
      return "";
    },
    hymnInfos() {
      if (this.renderMode == "hymns") {
        return this.sectionModel.hymns.map(h => { 
          let result = {
            hymnNo: `${h.hymnNo}. `,
            hymnNo2: "",
            url: h.url,
            title: h.title
          };

          if (h.hymnNoTxt.indexOf('/') >= 0) {
            let split = h.hymnNoTxt.split("/");
            result.hymnNo = `${split[0]}, `;
            result.hymnNo2 = `${split[1]}. `;
          }
          return result;
        });
      }
    }
  },
  watch: {
    fontSize: {
      handler: async function () {
        if (this.renderMode == "children") return;

        await nextTick();
        if (!this.$refs.lis) return;

        let markerWidths = this.$refs.lis
          .filter(li => !li.matches(".exempt"))
          .map(li => parseFloat(window.getComputedStyle(li, "::marker").width))
          .filter(i => !isNaN(i));
        markerWidths.push(0);
        let markerWidthPx = Math.max(...markerWidths);
        markerWidthPx = Math.ceil(4 * markerWidthPx) / 4;
        this.markerWidth = `${markerWidthPx / this.fontSize}rem`;
      },
      immediate: true
    }
  }
}
</script>