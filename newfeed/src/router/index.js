import { createRouter, createWebHistory } from 'vue-router'
import Feed from '../components/Feed.vue'

const routes = [
  {
    path: '/233',
    name: 'Feed',
    component: Feed
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 