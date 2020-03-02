import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store/store';
import session from 'vue-session';

Vue.use(session);

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');
