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
import { Input } from '@/components/ui/input'

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

// team import
import * as XLSX from 'xlsx'
import type { TeamImportData } from '@/types'
import { saveTeamsToFirestore } from '@/services/teamService'
const importedTeams = ref<TeamImportData[]>([])
const isUploading = ref(false)
const importTeams = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  isUploading.value = true
  const reader = new FileReader()

  reader.onload = async (e) => {
    try {
      const data = new Uint8Array(e.target?.result as ArrayBuffer)
      const workbook = XLSX.read(data, { type: 'array' })

      // Read the first worksheet
      const firstSheetName = workbook.SheetNames[0]!
      const worksheet = workbook.Sheets[firstSheetName]!

      // Convert sheet to a 2D array matrix
      const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]

      processTeamAndMemberRows(rows)
      const totalSaved = await saveTeamsToFirestore(importedTeams.value)
      alert(`Successfully saved ${totalSaved} teams to Firestore!`)
      await refreshTeams()

    } catch (error) {
      console.error('Error parsing file:', error)
      alert('Failed to read file. Please ensure it is a valid Excel or CSV file.')
    } finally {
      isUploading.value = false
      // Reset input value so the same file can be re-uploaded if needed
      target.value = ''
    }
  }

  reader.readAsArrayBuffer(file)
}

const processTeamAndMemberRows = (rows: any[][]) => {
  if (!rows || rows.length === 0) {
    alert('The uploaded file is empty.')
    return
  }

  // 1. Identify Headers
  const headerRow = rows[0]!.map((h) => String(h || '').toLowerCase().trim())

  let teamColIdx = headerRow.findIndex((h) => h.includes('team') || h.includes('group'))
  let memberColIdx = headerRow.findIndex((h) => h.includes('member') || h.includes('student') || h.includes('name'))

  // Defaults if no explicit headers found
  if (teamColIdx === -1) teamColIdx = 0
  if (memberColIdx === -1) memberColIdx = 1

  const teamMap = new Map<string, Set<string>>()

  // 2. Iterate Data Rows (Skip Header at index 0)
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    if (!row || row[teamColIdx] === undefined) continue

    const rawTeamName = String(row[teamColIdx]).trim()
    if (!rawTeamName) continue

    if (!teamMap.has(rawTeamName)) {
      teamMap.set(rawTeamName, new Set<string>())
    }

    const currentMemberSet = teamMap.get(rawTeamName)!

    // Collect members from member column onwards (Handles single-column strings or multi-column entries)
    for (let c = memberColIdx; c < row.length; c++) {
      if (row[c] !== undefined && row[c] !== null) {
        const memberVal = String(row[c]).trim()

        if (memberVal) {
          // Handles comma, semicolon, or newline separated values in a single cell
          const splitMembers = memberVal.split(/[,;\n]+/).map((m) => m.trim()).filter(Boolean)
          splitMembers.forEach((m) => currentMemberSet.add(m))
        }
      }
    }
  }

  // 3. Format into structured array
  const result: TeamImportData[] = Array.from(teamMap.entries()).map(([teamName, memberSet]) => ({
    teamName,
    members: Array.from(memberSet)
  }))

  if (result.length === 0) {
    alert('No valid team and member data found in the spreadsheet.')
    return
  }

  importedTeams.value = result
  console.log('Successfully imported teams with members:', importedTeams.value)

  // TODO: Save `importedTeams.value` to your Firestore collection or application store
}

</script>

<template>
<div class="flex flex-col gap-2 mt-2">
  <div class="flex flex-row items-center gap-1">
    <Button variant="secondary" @click="createNewTeam"><PhPlus /> New Team</Button>
    <Input id="teamImportFile" type="file" @change="importTeams" />
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
