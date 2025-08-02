import {createRouter, createWebHistory} from 'vue-router'
import HomeView from '../views/BasarView.vue'
import LoginView from '../views/LoginView.vue'
import ProfileView from '../views/ProfileView.vue'
import UserView from '../views/UserView.vue'
import ResetView from '../views/ResetView.vue'
import ResetPasswordView from '../views/ResetPasswordView.vue'
import LinkView from '../views/LinkView.vue'
import ExternalView from '../views/ExternalView.vue'
import AnswerView from '../views/AnswerView.vue'
import AllView from '../views/AllView.vue'

const expired = async (to, from, next) => {
  next()
}

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/basar',
    name: 'basar',
    beforeEnter: expired,
    component: () => import('../views/BasarView.vue')
  },
  {
    path: '/games',
    name: 'games',
    beforeEnter: expired,
    component: () => import('../views/GamesView.vue')
  },
  {
    path: '/history',
    name: 'history',
    beforeEnter: expired,
    component: () => import('../views/HistoryView.vue'),
    props: {allGames: true}
  },
  {
    path: '/ansetzungen',
    name: 'ansetzungen',
    beforeEnter: expired,
    component: () => import('../views/GamesView.vue')
  },
  {
    path: '/historie',
    name: 'historie',
    beforeEnter: expired,
    component: () => import('../views/HistoryView.vue'),
    props: {allGames: true}
  }, {
    path: '/login',
    name: 'login',
    component: LoginView
  }, {
    path: '/reset',
    name: 'reset',
    component: ResetView
  }, {
    path: '/reset-password',
    name: 'reset-password',
    component: ResetPasswordView
  },{
    path: '/links',
    name: 'links',
    component: LinkView
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfileView,
    beforeEnter: expired
  }
  , {
    path: '/user',
    name: 'user',
    component: UserView,
    beforeEnter: expired
  },
  {
    path: '/users',
    name: 'users',
    component: UserView,
    beforeEnter: expired
  },{
  path: '/link/:link?',
    name: 'link',
    component: ExternalView,
  },
  {
    path: '/answer/:link?',
    name: 'answer',
    component: AnswerView,
  },
  {
    path: '/all',
      name: 'all',
      component: AllView,
    }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
