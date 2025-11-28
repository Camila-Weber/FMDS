import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

import DashboardView from '../views/DashboardView.vue'
import BookListView from '../views/BooksListView.vue'
import BookFormView from '../views/BookFormView.vue'
import ReservationsView from '../views/ReservationsView.vue'
import LoginView from '../views/LoginView.vue'
import ReviewsListView from '../views/ReviewsListView.vue'
import ReviewFormView from '../views/ReviewFormView.vue'
import MyReviewsView from '../views/MyReviewsView.vue'

const routes = [
  {
    path: '/',
    name: 'dashboard',
    component: DashboardView,
    meta: { public: true },
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { public: true },
  },
  {
    path: '/books',
    name: 'books-list',
    component: BookListView,
    meta: { requiresAuth: true },
  },
  {
    path: '/books/new',
    name: 'book-new',
    component: BookFormView,
    meta: { requiresAuth: true },
  },
  {
    path: '/books/:id/edit',
    name: 'book-edit',
    component: BookFormView,
    meta: { requiresAuth: true },
    props: true,
  },
  {
    path: '/reservations',
    name: 'reservations',
    component: ReservationsView,
    meta: { requiresAuth: true },
  },
  {
    path: '/reviews',
    name: 'reviews',
    component: ReviewsListView,
    meta: { requiresAuth: true },
  },
  {
    path: '/my-reviews',
    name: 'my-reviews',
    component: MyReviewsView,
    meta: { requiresAuth: true },
  },
  {
    path: '/reviews/new',
    name: 'review-new',
    component: ReviewFormView,
    meta: { requiresAuth: true },
  },
  {
    path: '/reviews/:id/edit',
    name: 'review-edit',
    component: ReviewFormView,
    meta: { requiresAuth: true },
    props: true,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const isAuth = authStore.isAuthenticated

  if (to.meta.requiresAuth && !isAuth) {
    return next({ name: 'dashboard' })
  }

  next()
})

export default router
