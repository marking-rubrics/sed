import { PhClipboardText, PhExam, PhTable, PhUserList, PhUsersThree } from '@phosphor-icons/vue'
import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/users' // Adjust path to your store

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Assessment',
      component: () => import('../views/AssessmentView.vue'),
      meta: {
        icon: PhClipboardText,
        requiresAuth: true,
        allowedRoles: ['assessor', 'lecturer', 'admin']
      }
    },
    {
      path: '/results',
      name: 'Results',
      component: () => import('../views/ResultsView.vue'),
      meta: {
        icon: PhExam,
        requiresAuth: true,
        allowedRoles: ['lecturer', 'admin']
      }
    },
    {
      path: '/rubrics',
      name: 'Rubrics',
      component: () => import('../views/RubricsView.vue'),
      meta: {
        icon: PhTable,
        requiresAuth: true,
        allowedRoles: ['lecturer', 'admin']
      }
    },
    {
      path: '/teams',
      name: 'Teams',
      component: () => import('../views/TeamsView.vue'),
      meta: {
        icon: PhUsersThree,
        requiresAuth: true,
        allowedRoles: ['lecturer', 'admin']
      }
    },
    {
      path: '/users',
      name: 'Users',
      component: () => import('../views/UsersView.vue'),
      meta: {
        icon: PhUserList,
        requiresAuth: true,
        allowedRoles: ['admin']
      }
    },
  ],
})

router.beforeEach(async (to, from) => {
  const userStore = useUserStore()

  // Await your local storage/session validation sequence
  await userStore.waitForAuthInit()

  const isAuthenticated = !!userStore.currentUser
  const userRoles = userStore.currentUser?.roles || []
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  // 1. Not signed in? Handle external redirect using window location
  if (requiresAuth && !isAuthenticated) {
    const targetPath = encodeURIComponent(to.fullPath)
    window.location.assign(`/login.html?redirect=${targetPath}`)
    return false
  }

  // 2. Role validation for signed-in users
  if (requiresAuth && isAuthenticated) {
    const allowedRoles = to.matched.flatMap(record => record.meta.allowedRoles || []) as string[]

    if (allowedRoles.length > 0) {
      const hasPermission = userRoles.some(role => allowedRoles.includes(role))
      if (!hasPermission) {
        return { name: 'Unauthorized' }
      }
    }
  }
})

export default router
