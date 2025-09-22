import { createApp } from 'vue'
import { createPinia } from "pinia";
import store from './store'
import router from './router'
import App from './App.vue'
import Maska from 'maska'
import {
  Dataset,
  DatasetItem,
  DatasetInfo,
  DatasetPager,
  DatasetSearch,
  DatasetShow,
} from "vue-dataset";


// Template components
import BaseBlock from "@/components/BaseBlock.vue";
import BaseBackground from "@/components/BaseBackground.vue";
import BasePageHeading from "@/components/BasePageHeading.vue";

// Template directives
import clickRipple from "@/directives/clickRipple";

// directiva para manejar decimales
import zeroDecimals from "@/directives/zeroDecimals";
// Bootstrap framework
import * as bootstrap from "bootstrap";
window.bootstrap = bootstrap;

// Craft new application
const app = createApp(App);

app.component('Dataset', Dataset);
app.component('DatasetItem', DatasetItem);
app.component('DatasetInfo', DatasetInfo);
app.component('DatasetPager', DatasetPager);
app.component('DatasetSearch', DatasetSearch);
app.component('DatasetShow', DatasetShow);

// Register global components
app.component("BaseBlock", BaseBlock);
app.component("BaseBackground", BaseBackground);
app.component("BasePageHeading", BasePageHeading);

// Register global directives
app.directive("click-ripple", clickRipple);
app.directive("zero-decimals", zeroDecimals);
// Use Pinia and Vue Router
app.use(createPinia());
app.use(store);
app.use(Maska);
app.use(router);

// ..and finally mount it!
app.mount("#app");