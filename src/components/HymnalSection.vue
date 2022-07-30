<template>
  <section :id="sectionModel.htmlId" :class="className">
    <component v-if="headingText" :is="headingTag">{{ headingText }}</component>
    <template v-if="renderMode == 'children'">
      <template v-for="child of sectionModel.children" v-bind:key="child.htmlId">
        <HymnalSection :sectionModel="child"></HymnalSection>
      </template>
    </template>
    <template v-if="renderMode == 'hymns'">
      <ul>
        <template v-for="hymn of sectionModel.hymns">
          <li :style="`--hymnNo: '${hymn.hymnNoTxt}. '`" class="pb-1">
            <a :href="hymn.url">{{ hymn.title }}</a>
          </li>
        </template>
      </ul>     
    </template>
  </section>
</template>
<script>
const baseHeadingLevel = 2;
export default {
  props: {
    sectionModel: { required: true }
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
    }
  },
  watch: {
    sectionModel(newValue) {
      console.log('sectionModelChange', newValue);
    }
  }
}
</script>

<style type="text/css">
  li::marker {
    content: var(--hymnNo);
  }
</style>