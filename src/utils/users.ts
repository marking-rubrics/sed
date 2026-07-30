import type { User , UserRole } from '@/types'

export const createEmptyUser = (): User => ({
  uid: '',
  displayName: '',
  role: 'Admin' as UserRole,
  rubricIds: [],
  teamIds: []
})
