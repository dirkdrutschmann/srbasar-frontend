import { createRouter, createWebHistory } from 'vue-router'
import DesignMvpView from '../views/DesignMvpView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: DesignMvpView,
    meta: { layout: 'design-mvp' }
  },
  {
    path: '/basar',
    name: 'basar',
    component: DesignMvpView,
    meta: { layout: 'design-mvp' }
  },
  {
    path: '/design-mvp',
    name: 'design-mvp',
    redirect: { name: 'home' }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
