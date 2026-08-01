import { type Team } from '@/types'

export const createEmptyTeam = (): Team => ({
  id: '',
  name: '',
  members: [],
})
