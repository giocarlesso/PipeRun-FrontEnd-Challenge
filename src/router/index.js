import Vue from 'vue';
import VueRouter from 'vue-router';
import Login from '../views/Login.vue';
import Main from '../views/Main.vue';
// import store from '../store/store';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login
  },
  {
    path: '/main',
    name: 'Main',
    component: Main
    // meta: { guest: false }
  }
];

const router = new VueRouter({
  routes
});

export default router;
