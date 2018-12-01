import Vue from 'vue';
import App from './App.vue';
import router from './router';

/* eslint linebreak-style: ["error", "unix"] */

Vue.config.productionTip = false;

new Vue({
  router,
  render: h => h(App),
}).$mount('#app');
