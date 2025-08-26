import {createRouter, createWebHistory} from 'vue-router'
import BasarView from '../views/BasarView.vue'
import LoginView from '../views/LoginView.vue'
import ProfileView from '../views/ProfileView.vue'
import ResetView from '../views/ResetView.vue'
import ResetPasswordView from '../views/ResetPasswordView.vue'
import VereineView from '../views/VereineView.vue'
import AdminUsersView from '../views/AdminUsersView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: BasarView
  },
  {
    path: '/basar',
    name: 'basar',
    component: BasarView
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },
  {
    path: '/reset',
    name: 'reset',
    component: ResetView
  },
  {
    path: '/reset-password',
    name: 'reset-password',
    component: ResetPasswordView
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfileView,
    meta: { requiresAuth: true }
  },
  {
    path: '/vereine',
    name: 'vereine',
    component: VereineView,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/users',
    name: 'admin-users',
    component: AdminUsersView,
    meta: { requiresAuth: true, requiresAdmin: true }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Navigation Guard für geschützte Routen
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (!user.accessToken) {
      next('/login')
      return
    }
    
    // Admin-Berechtigung überprüfen
    if (to.meta.requiresAdmin && user.role !== 'admin') {
      next('/') // Redirect zur Startseite wenn keine Admin-Berechtigung
      return
    }
  }
  next()
})

export default router
