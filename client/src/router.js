import Vue from 'vue';
import Router from 'vue-router';
import Home from './views/Home.vue';
import Signup from './views/Signup.vue';
import Login from './views/Login.vue';
/* eslint-disable-next-line */
import Dashboard from './views/Dashboard.vue';

Vue.use(Router);

function redirectIfLoggedIn(to, from, next) {
  if (localStorage.token) {
    next('/dashboard');
  } else {
    next();
  }
}

function redirectIfNotLoggedIn(to, from, next) {
  if (localStorage.token) {
    next();
  } else {
    next('/login');
  }
}


export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/signup',
      name: 'signup',
      component: Signup,
      beforeEnter: redirectIfLoggedIn,
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
      beforeEnter: redirectIfLoggedIn,
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: Dashboard,
      beforeEnter: redirectIfNotLoggedIn,
    },
  ],
});
