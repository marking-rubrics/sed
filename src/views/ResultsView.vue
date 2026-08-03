<script setup lang="ts">
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { ref, onMounted } from 'vue'
import { getRubricsLookup } from '@/services/rubricService'
import { getAllTeams } from '@/services/teamService'
import type { RubricLookup, Team } from '@/types'
import { ResultMatrix } from '@/components/result'

const rubricsLookup = ref<RubricLookup[]>([])
const teams = ref<Team[]>([])
const selectedRubricIds = ref<string[]>([])
onMounted(async () => {
  rubricsLookup.value = await getRubricsLookup()
  teams.value = await getAllTeams()
})
</script>

<template>
<div class="flex flex-col gap-5 mt-2">
  <div class="flex flex-row flex-wrap items-center gap-2">
    <Select v-model="selectedRubricIds" v-if="rubricsLookup.length > 0" multiple>
      <SelectTrigger class="w-full sm:w-2xs" :class="selectedRubricIds.length > 0 ? 'bg-teal-100' : 'bg-red-100'">
        <SelectValue placeholder="Select a rubric" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem v-for="rubric in rubricsLookup" :value="rubric.id">{{ rubric.title }}</SelectItem>
      </SelectContent>
    </Select>
  </div>

  <template v-for="rubricId in selectedRubricIds">
    <ResultMatrix :rubricId="rubricId" :teams="teams" />
  </template>

</div>
</template>
