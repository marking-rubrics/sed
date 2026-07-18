import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Assessment',
      component: () => import('../views/AssessmentView.vue'),
      meta: {
        icon: ''
      }
    },
    {
      path: '/results',
      name: 'Results',
      component: () => import('../views/ResultsView.vue'),
      meta: {
        icon: ''
      }
    },
    {
      path: '/rubrics',
      name: 'Rubrics',
      component: () => import('../views/RubricsView.vue'),
      meta: {
        icon: ''
      }
    },
    {
      path: '/teams',
      name: 'Teams',
      component: () => import('../views/TeamsView.vue'),
      meta: {
        icon: ''
      }
    },
    {
      path: '/users',
      name: 'Users',
      component: () => import('../views/UsersView.vue'),
      meta: {
        icon: ''
      }
    },
  ],
})

export default router
