<script setup lang="ts">
import { PhPlus } from '@phosphor-icons/vue'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from '@/components/ui/table'
import { onMounted, ref } from 'vue'
import { createTeam, getAllTeams, updateTeamDetails, deleteTeamComplete } from '@/services/teamService'
import { type Team } from '@/types'
import TeamEditor from '@/components/TeamEditor.vue'
import { createEmptyTeam } from '@/utils/teams'
import { Badge } from '@/components/ui/badge'

const teams = ref<Team[]>([])
const refreshTeams = async () => {
  teams.value = await getAllTeams()
}
onMounted(async () => {
  await refreshTeams()
})

const createNewTeam = async () => {
  await createTeam('New Team', [])
  await refreshTeams()
}

const showEditor = ref(false)
const openEditor = () => { showEditor.value = true }
const closeEditor = () => { showEditor.value = false }
const teamInEditor = ref<Team>(createEmptyTeam())
const sendToEditor = (team: Team) => {
  if (teamInEditor.value.id == team.id && showEditor.value) {
    closeEditor()
  } else {
    teamInEditor.value = team
    openEditor()
  }
}
const updateTeam = async (team: Team) => {
  teamInEditor.value = team
  await updateTeamDetails(team.id, team)
  await refreshTeams()
  closeEditor()
}
const deleteTeam = async (team: Team) => {
  await deleteTeamComplete(team.id)
  await refreshTeams()
  closeEditor()
}
</script>

<template>
<div class="flex flex-col gap-2 mt-2">
  <div class="flex flex-row items-center">
    <Button variant="secondary" @click="createNewTeam"><PhPlus /> New Team</Button>
  </div>

  <div class="flex flex-row items-start h-full w-full">
    <div class="flex-1 overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="w-auto whitespace-nowrap px-4">Team</TableHead>
            <TableHead class="w-full">Members</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="team in teams" :key="team.id" @click="sendToEditor(team)">
            <TableCell class="w-auto whitespace-nowrap px-4">{{ team.name }}</TableCell>
            <TableCell class="w-full flex flex-row flex-wrap gap-1">
              <Badge v-for="member in team.members" :key="member">{{ member }}</Badge>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <aside class="sticky top-24 flex flex-row items-stretch self-start h-auto ml-5"
      :class="{ 'hidden': !showEditor }"
    >
       <TeamEditor class="w-150"
        :team="teamInEditor"
        @close="closeEditor" @update="updateTeam" @delete="deleteTeam"
      />
    </aside>
  </div>
</div>
</template>
