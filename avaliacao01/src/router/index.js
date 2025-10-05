import { createRouter, createWebHistory } from 'vue-router'
import HomeCatalog from '@/pages/HomeCatalog.vue'
import RecipeCrud from '@/pages/RecipeCrud.vue'
import About from '@/pages/About.vue'
import Login from '@/pages/Login.vue'
import { useAuthStore } from '@/stores/auth'

const routes = [
  { path: '/login', name: 'login', component: Login },
  { path: '/', name: 'home', component: HomeCatalog, meta: { requiresAuth: true } },
  { path: '/receitas', name: 'receitas', component: RecipeCrud, meta: { requiresAuth: true } },
  { path: '/sobre', name: 'sobre', component: About, meta: { requiresAuth: true } },
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  if (!auth.ready) {
    await auth.init()
  }
  if (to.meta.requiresAuth && !auth.user) return { name: 'login' }
  if (to.name === 'login' && auth.user)    return { name: 'home' }
  return true
})

export default router
