<script>
import { computed, nextTick } from 'vue';
import userSettingsMixin from './utils/userSettings.js'
import FontSizing from './components/FontSizing.vue';

export default {
  mixins: [userSettingsMixin],
  data() {
    return {
      routeHymnalId: undefined
    }
  },
  provide() {
    return {
      userSettings: this.userSettings,
      fontSizing: computed(() => this.$refs.fontSizing)
    };
  },
  mounted() {
    this.userSettings.mode = "light";
    window.$hymnsDb = this.$hymnsDb;
    window.$router = this.$router;
  },
  methods: {
    async setTheme(newHymnalId) {
      let oldTheme = [...document.body.classList].find(c => c.startsWith("theme-")) || "";
      let newTheme = newHymnalId ? `theme-${newHymnalId}` : "";
      if (oldTheme == newTheme) return;

      document.body.classList.add("no-transitions");        
      await this.$nextTick();

      let classNames = [...document.body.classList].filter(c => !c.startsWith("theme-"));
      if (newTheme) classNames.push(newTheme);
      document.body.className = classNames.join(" ");
      
      await this.$nextTick();
      document.body.classList.remove("no-transitions");
    }
  },
  watch: {
    $route: {
      handler(value) {
        this.routeHymnalId = this.$route.query.hymnal;
        this.setTheme(this.routeHymnalId);
      },
      immediate: true
    },
    'userSettings.mode': {
      handler(value, oldValue) {
        let html = document.querySelector("html");
        html.classList.remove(`mode-${oldValue}`);
        if (value) {
          html.classList.add(`mode-${value}`);
        }
      },
      immediate: true
    }
  },
  components: { FontSizing }
};
</script>

<template>
  <FontSizing ref="fontSizing"></FontSizing>
  <svg xmlns="http://www.w3.org/2000/svg" style="display: none;">
    <symbol viewBox="0 0 24 24" id="back">
      <title>Back</title>
      <path d="M18.7912 11.005H7.62124L12.5012 6.12501C12.8912 5.73501 12.8912 5.09501 12.5012 4.70501C12.1112 4.31501 11.4812 4.31501 11.0912 4.70501L4.50124 11.295C4.11124 11.685 4.11124 12.315 4.50124 12.705L11.0912 19.295C11.4812 19.685 12.1112 19.685 12.5012 19.295C12.8912 18.905 12.8912 18.275 12.5012 17.885L7.62124 13.005H18.7912C19.3412 13.005 19.7912 12.555 19.7912 12.005C19.7912 11.455 19.3412 11.005 18.7912 11.005Z" />
    </symbol>
    <symbol viewBox="0 0 24 24" id="close">
      <title>Close</title>
      <path d="M18.3 5.71C17.91 5.32 17.28 5.32 16.89 5.71L12 10.59L7.10997 5.7C6.71997 5.31 6.08997 5.31 5.69997 5.7C5.30997 6.09 5.30997 6.72 5.69997 7.11L10.59 12L5.69997 16.89C5.30997 17.28 5.30997 17.91 5.69997 18.3C6.08997 18.69 6.71997 18.69 7.10997 18.3L12 13.41L16.89 18.3C17.28 18.69 17.91 18.69 18.3 18.3C18.69 17.91 18.69 17.28 18.3 16.89L13.41 12L18.3 7.11C18.68 6.73 18.68 6.09 18.3 5.71Z" />
    </symbol>
    <symbol viewBox="0 0 24 24" id="hymnal">
      <title>Find a hymn</title>
      <path d="M14.15 6.74731L18.15 2.74731C18.46 2.43731 19 2.65731 19 3.10731V11.6773C19 11.8173 18.94 11.9573 18.83 12.0473L14.83 15.6473C14.51 15.9373 14 15.7073 14 15.2773V7.10731C14 6.96731 14.05 6.84731 14.15 6.74731Z" />
      <path fill-rule="evenodd" clip-rule="evenodd" d="M21 5.98731C21.51 6.15731 22 6.35731 22.47 6.59731C22.8 6.75731 23 7.10731 23 7.47731V19.5673C23 20.3273 22.19 20.7973 21.52 20.4373C20.31 19.7973 18.95 19.3973 17.5 19.3973C15.43 19.3973 13.52 20.2173 12 21.3973C10.48 20.2173 8.57 19.3973 6.5 19.3973C5.05 19.3973 3.69 19.7973 2.48 20.4273C1.81 20.7873 1 20.3173 1 19.5573V7.47731C1 7.10731 1.2 6.75731 1.53 6.59731C3.02 5.83731 4.71 5.39731 6.5 5.39731C8.51 5.39731 10.38 5.94731 12 6.87731V18.9773C13.72 17.9373 15.6 17.3973 17.5 17.3973C18.69 17.3973 19.86 17.6073 21 18.0173V5.98731ZM10 17.87C8.86 17.46 7.69 17.25 6.5 17.25C5.31 17.25 4.14 17.46 3 17.87V7.96C4.11 7.49 5.28 7.25 6.5 7.25C7.7 7.25 8.89 7.5 10 7.97V17.87Z" />
    </symbol>
    <symbol viewBox="0 0 24 24" id="menu">
      <title>Menu</title>
      <path d="M4 18H20C20.55 18 21 17.55 21 17C21 16.45 20.55 16 20 16H4C3.45 16 3 16.45 3 17C3 17.55 3.45 18 4 18ZM4 13H20C20.55 13 21 12.55 21 12C21 11.45 20.55 11 20 11H4C3.45 11 3 11.45 3 12C3 12.55 3.45 13 4 13ZM3 7C3 7.55 3.45 8 4 8H20C20.55 8 21 7.55 21 7C21 6.45 20.55 6 20 6H4C3.45 6 3 6.45 3 7Z" />
    </symbol>
    <symbol viewBox="0 0 24 24" id="text-options">
      <path d="M5 20V19H5.54887C5.82487 19 6.0702 18.9693 6.28487 18.908C6.49953 18.8313 6.6682 18.6857 6.79087 18.471C6.92887 18.2563 6.99787 17.9267 6.99787 17.482L6.99795 5.311H4.45C3.99 5.311 3.62967 5.38767 3.369 5.541C3.10833 5.679 2.91667 5.87833 2.794 6.139C2.67133 6.39967 2.587 6.69867 2.541 7.036L2.403 8.301H1L1.115 4H15.885L16 8.301H14.597L14.436 7.036C14.4053 6.69867 14.321 6.39967 14.183 6.139C14.0603 5.87833 13.8687 5.679 13.608 5.541C13.3473 5.38767 12.987 5.311 12.527 5.311H10.1489L10.1489 17.459C10.1489 17.9037 10.2102 18.241 10.3329 18.471C10.4555 18.6857 10.6319 18.8313 10.8619 18.908C11.0919 18.9693 11.3372 19 11.5979 19H12V20H5Z" />
      <path d="M22.747 11.26C22.9157 11.398 23 11.651 23 12.019C23 12.6937 22.747 13.031 22.241 13.031H22.149C21.919 13.0463 21.6507 13.0693 21.344 13.1C21.0373 13.1153 20.6923 13.146 20.309 13.192C20.2783 13.4373 20.2477 13.767 20.217 14.181C20.1863 14.5797 20.171 15.0627 20.171 15.63C20.171 15.676 20.171 15.722 20.171 15.768C20.1863 15.814 20.194 15.8677 20.194 15.929V16.987C20.194 17.2323 20.2323 17.4317 20.309 17.585C20.401 17.723 20.5083 17.8227 20.631 17.884L21.275 18.091C21.781 18.2597 22.034 18.5663 22.034 19.011C22.034 19.2717 21.9267 19.5017 21.712 19.701C21.5127 19.9003 21.252 20 20.93 20C20.838 20 20.677 19.977 20.447 19.931C20.2323 19.8697 20.0023 19.793 19.757 19.701C19.527 19.609 19.3047 19.494 19.09 19.356C18.8907 19.218 18.7527 19.0647 18.676 18.896C18.5073 18.5433 18.3693 18.1753 18.262 17.792C18.1547 17.3933 18.101 16.9793 18.101 16.55C18.101 16.0747 18.1087 15.7373 18.124 15.538C18.1393 15.3387 18.1547 15.1623 18.17 15.009C18.1853 14.8557 18.2007 14.6717 18.216 14.457C18.2313 14.2423 18.239 13.8897 18.239 13.399C17.9477 13.4297 17.5183 13.5217 16.951 13.675C16.6137 13.675 16.3223 13.5907 16.077 13.422C15.847 13.238 15.732 13.0003 15.732 12.709C15.732 12.4943 15.7933 12.295 15.916 12.111C16.054 11.927 16.33 11.766 16.744 11.628C16.882 11.582 17.0047 11.5513 17.112 11.536C17.2347 11.5207 17.3497 11.5053 17.457 11.49C17.5797 11.4747 17.71 11.467 17.848 11.467C17.986 11.4517 18.1547 11.4287 18.354 11.398C18.3693 11.0147 18.3923 10.5853 18.423 10.11C18.469 9.61933 18.538 9.167 18.63 8.753C18.7373 8.339 18.883 7.994 19.067 7.718C19.2663 7.42667 19.527 7.281 19.849 7.281C20.401 7.281 20.7383 7.534 20.861 8.04C20.861 8.05533 20.838 8.16267 20.792 8.362C20.7613 8.546 20.723 8.753 20.677 8.983C20.631 9.213 20.585 9.43533 20.539 9.65C20.5083 9.86467 20.493 10.0027 20.493 10.064L20.424 11.191C20.5313 11.1757 20.631 11.168 20.723 11.168C20.815 11.1527 20.9147 11.145 21.022 11.145H21.229C21.3363 11.145 21.436 11.145 21.528 11.145C21.62 11.1297 21.7043 11.122 21.781 11.122C22.241 11.122 22.563 11.168 22.747 11.26Z" />
    </symbol>
    <symbol viewBox="0 0 24 24" id="toc">
      <path d="M4 9H16C16.55 9 17 8.55 17 8C17 7.45 16.55 7 16 7H4C3.45 7 3 7.45 3 8C3 8.55 3.45 9 4 9ZM4 13H16C16.55 13 17 12.55 17 12C17 11.45 16.55 11 16 11H4C3.45 11 3 11.45 3 12C3 12.55 3.45 13 4 13ZM4 17H16C16.55 17 17 16.55 17 16C17 15.45 16.55 15 16 15H4C3.45 15 3 15.45 3 16C3 16.55 3.45 17 4 17ZM19 17H21V15H19V17ZM19 7V9H21V7H19ZM19 13H21V11H19V13Z" />
    </symbol>
    <symbol width="9" height="9" viewBox="0 0 9 9" id="double-border">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M9 0H0V9H9V0ZM8 1H1V8H8V1Z" />
      <path fill-rule="evenodd" clip-rule="evenodd" d="M7 2H2V7H7V2ZM6 3H3V6H6V3Z" />
    </symbol>
  </svg>
  <router-view />
  <!-- 
  <div class="scaled" style="position: fixed; bottom: 0; z-index: 2000; font-size: 16px; --font-size: 16px; --font-size-scale: 1">
    <input type="range" min="14" max="64" step="0.25" v-model="userSettings.fontSize"><br />
    <select class="form-select" v-model="userSettings.mode">
      <option v-for="mode in ['', 'light', 'hcDark']" :value="mode" >{{mode}}</option>
    </select>
  </div>
  -->
</template>
<!--
<template>
  <nav>
    <router-link to="/">Home</router-link> |
    <router-link to="/hymnal">Hymnal</router-link>
  </nav>
  <main>
    <router-view />
  </main>
</template>
-->

<style id="appDotVue" lang="scss">
/* --- App.vue --- */
@import "./scss/hymnal.scss"; 
</style>

