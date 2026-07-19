import { PhClipboardText, PhExam, PhTable, PhUserList, PhUsersThree } from '@phosphor-icons/vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Assessment',
      component: () => import('../views/AssessmentView.vue'),
      meta: {
        icon: PhClipboardText
      }
    },
    {
      path: '/results',
      name: 'Results',
      component: () => import('../views/ResultsView.vue'),
      meta: {
        icon: PhExam
      }
    },
    {
      path: '/rubrics',
      name: 'Rubrics',
      component: () => import('../views/RubricsView.vue'),
      meta: {
        icon: PhTable
      }
    },
    {
      path: '/teams',
      name: 'Teams',
      component: () => import('../views/TeamsView.vue'),
      meta: {
        icon: PhUsersThree
      }
    },
    {
      path: '/users',
      name: 'Users',
      component: () => import('../views/UsersView.vue'),
      meta: {
        icon: PhUserList
      }
    },
  ],
})

export default router
