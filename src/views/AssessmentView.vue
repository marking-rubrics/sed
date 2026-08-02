<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { mockPresentationRubric } from '@/examples/mockPresentationRubric'
import { mockEngineeringRubric } from '@/examples/mockEngineeringRubric'
import type { Team, RubricLookup, Rubric, AssessedRubric } from '@/types'
import { RubricDesktop, RubricMobile } from '@/components/assessment'
import { getAllTeams } from '@/services/teamService'
import { getRubricsLookup } from '@/services/rubricService'

const teams = ref<Team[]>([])
const rubrics = ref<RubricLookup[]>([])
onMounted(async () => {
  teams.value = await getAllTeams()
  rubrics.value = await getRubricsLookup()
})

import { useAssessmentStore } from '@/stores/assessments'
const assessmentStore = useAssessmentStore()

const selectedRubricId = ref<string | undefined>(undefined)
watch(
  () => selectedRubricId.value,
  async (newId) => {
    if (newId) {
      try {
        await assessmentStore.fetchAndSetActiveRubric(newId)
      } catch (error) {
        console.error('Failed to swap active rubric view matrix:', error)
      }
    } else {
      assessmentStore.activeRubric = null
    }
  }
)
// const selectedRubricData = computed(() => rubrics.value.find((r: Rubric) => r.id === selectedRubric.value))
const selectedTeamId = ref<string | undefined>(undefined)

// const assessedRubric = ref<AssessedRubric | undefined>(undefined)
</script>

<template>
<div class="flex flex-col gap-2 mt-2">
  <div class="flex flex-row flex-wrap items-center gap-2">
    <Select v-model="selectedTeamId">
      <SelectTrigger class="w-full sm:w-2xs" :class="selectedTeamId ? 'bg-teal-100' : 'bg-red-100'">
        <SelectValue placeholder="Select a team" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem v-for="team in teams" :value="team.id">{{ team.name }}</SelectItem>
      </SelectContent>
    </Select>
    <Select v-model="selectedRubricId">
      <SelectTrigger class="w-full sm:w-2xs" :class="selectedRubricId ? 'bg-teal-100' : 'bg-red-100'">
        <SelectValue placeholder="Select a rubric" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem v-for="rubric in rubrics" :value="rubric.id">{{ rubric.title }}</SelectItem>
      </SelectContent>
    </Select>
  </div>

  <div class="flex flex-row items-start h-full w-full" v-if="selectedRubricId && selectedTeamId">
    <div class="flex-1 overflow-x-auto hidden md:block">
      <RubricDesktop :rubric="selectedRubricData" :assessedRubric="assessedRubric" />
    </div>
    <div class="flex-1 overflow-x-auto block md:hidden">
      <RubricMobile :rubric="selectedRubricData" :assessedRubric="assessedRubric" />
    </div>
  </div>
</div>
</template>
