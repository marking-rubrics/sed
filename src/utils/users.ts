import type { User , UserRole } from '@/types'

export const createEmptyUser = (): User => ({
  id: '',
  email: '',
  displayName: '',
  roles: ['Admin' as UserRole],
  rubricIds: [],
  teamIds: []
})

export const formatUserFromServer = (firebaseUser: any): User => ({
  id: firebaseUser.uid,
  email: firebaseUser.email || '',
  displayName: firebaseUser.displayName || 'User',
  roles: ['' as UserRole],
  rubricIds: [],
  teamIds: []
})

export const getUsername = (email: string | undefined): string => email ? email.split("@")[0] || "" : ""
