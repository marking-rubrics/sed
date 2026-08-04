<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { mockPresentationRubric } from '@/examples/mockPresentationRubric'
import { mockEngineeringRubric } from '@/examples/mockEngineeringRubric'
import type { Team, RubricLookup, Rubric, AssessedRubric } from '@/types'
import { RubricDesktop, RubricMobile } from '@/components/assessment'
import { getAllTeams } from '@/services/teamService'
import { getRubricsLookup } from '@/services/rubricService'
import { useUserStore } from '@/stores/users'
const userStore = useUserStore()

const teams = ref<Team[]>([])
const rubrics = ref<RubricLookup[]>([])
onMounted(async () => {
  teams.value = await getAllTeams()
  rubrics.value = await getRubricsLookup()
})

import { useAssessmentStore } from '@/stores/assessments'
import { Alert } from '@/components/ui/alert'
import { PhCheckCircle, PhFloppyDisk } from '@phosphor-icons/vue'
import { Button } from '@/components/ui/button'
const assessmentStore = useAssessmentStore()

const prepareAssessment = async () => {
  if (userStore.currentUser?.id && selectedRubricId.value && selectedTeamId.value) {
    try {
      await assessmentStore.prepareEvaluationCanvas(
        userStore.currentUser?.id,
        selectedTeamId.value,
        selectedRubricId.value
      )
      assessmentStore.initializeAutosaveWatcher(
        userStore.currentUser.id,
        selectedTeamId.value
      )
    } catch (error) {
      console.error('Failed to prepare assessment canvas:', error)
    }
  }
}

const saveAssessment = async () => {
  await assessmentStore.executeSave(userStore.currentUser!.id, selectedTeamId.value!)
}

const allowedRubrics = computed(() => {
  if (userStore.currentUser?.rubricIds) {
    return rubrics.value.filter((r: RubricLookup) => userStore.currentUser?.rubricIds!.includes(r.id))
  }
  return []
})
const allowedTeams = computed(() => {
  if (userStore.currentUser?.teamIds) {
    return teams.value.filter((t: Team) => userStore.currentUser?.teamIds!.includes(t.id))
  }
  return []
})


const selectedRubricId = ref<string | undefined>(undefined)
const selectedTeamId = ref<string | undefined>(undefined)
watch(
  [() => selectedRubricId.value, () => selectedTeamId.value],
  async ([newRubricId, newTeamId], [oldRubricId, oldTeamId]) => {

    // 🧼 1. ALWAYS wipe the canvas immediately if an active selection changes
    assessmentStore.resetWorkspace()

    // 2. Fetch the new configuration if BOTH parameters are present
    if (newRubricId && newTeamId) {
      try {
        // Only load the rubric into memory if it actually changed
        if (newRubricId !== oldRubricId) {
          await assessmentStore.fetchAndSetActiveRubric(newRubricId)
        }

        // Prepare canvas and spin up the autosaver thread
        await prepareAssessment()
      } catch (error) {
        console.error('Failed to swap evaluation workspace context:', error)
      }
    }
  }
)
// const assessedRubric = ref<AssessedRubric | undefined>(undefined)
</script>

<template>
<div class="flex flex-col gap-2 mt-2">
  <!-- {{ userStore.currentUser }} -->
  <div class="flex flex-row flex-wrap items-center gap-2">
    <Select v-model="selectedTeamId">
      <SelectTrigger class="w-full sm:flex-1" :class="selectedTeamId ? 'bg-teal-100' : 'bg-red-100'">
        <SelectValue placeholder="Select a team" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem v-for="team in allowedTeams" :value="team.id">{{ team.name }}</SelectItem>
      </SelectContent>
    </Select>
    <Select v-model="selectedRubricId">
      <SelectTrigger class="w-full sm:flex-1" :class="selectedRubricId ? 'bg-teal-100' : 'bg-red-100'">
        <SelectValue placeholder="Select a rubric" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem v-for="rubric in allowedRubrics" :value="rubric.id">{{ rubric.title }}</SelectItem>
      </SelectContent>
    </Select>
  </div>

  <!-- <div>
    {{ assessmentStore.activeRubric }}
  </div>

  <div>
    {{ assessmentStore.gradingComponents }}
  </div> -->

  <div class="flex flex-row gap-1 items-stretch">
    <Alert v-if="assessmentStore.activeRubric" :variant="assessmentStore.isSaving ? 'destructive' : assessmentStore.isDirty ? 'destructive' : 'default'">
      <div class="flex flex-row gap-1 items-center">
        <PhCheckCircle v-if="!assessmentStore.isDirty" />
        <PhFloppyDisk v-else />
        <span class="flex-1">{{ assessmentStore.isSaving ? 'Saving...' : assessmentStore.isDirty ? 'Unsaved changes' : 'Changes saved' }}</span>
        <Button @click="saveAssessment"
          class="bg-destructive"
          v-if="assessmentStore.activeRubric"
          :disabled="!assessmentStore.isDirty"
        ><PhFloppyDisk /></Button>
      </div>
    </Alert>
  </div>

  <div class="flex flex-row items-start h-full w-full" v-if="selectedRubricId && selectedTeamId && assessmentStore.activeRubric">
    <div class="flex-1 overflow-x-auto hidden md:block">
      <RubricDesktop :rubric="assessmentStore.activeRubric as Rubric" :assessedComponents="assessmentStore.gradingComponents" />
    </div>
    <div class="flex-1 overflow-x-auto block md:hidden">
      <RubricMobile :rubric="assessmentStore.activeRubric as Rubric" :assessedComponents="assessmentStore.gradingComponents" />
    </div>
  </div>
</div>
</template>
