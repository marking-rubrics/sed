<script setup lang="ts">
import { PhPlus } from '@phosphor-icons/vue'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ref, computed } from 'vue'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { mockPresentationRubric } from '@/examples/mockPresentationRubric'
import { mockEngineeringRubric } from '@/examples/mockEngineeringRubric'
import type { Rubric } from '@/types'
import RubricDesktop from '@/components/RubricDesktop.vue'

const teams = ref([
  { name: 'Team 1' },
  { name: 'Team 2' },
  { name: 'Team 3' },
])
const rubrics = ref<Rubric[]>([
  mockPresentationRubric,
  mockEngineeringRubric,
])

const selectedRubric = ref<string | undefined>(undefined)
const selectedRubricData = computed(() => rubrics.value.find((r: Rubric) => r.id === selectedRubric.value))
</script>

<template>
<div class="flex flex-col gap-2 mt-2">
  <div class="flex flex-row flex-wrap items-center gap-2">
    <Select>
      <SelectTrigger class="w-full max-w-2xs">
        <SelectValue placeholder="Select a team" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem v-for="team in teams" :value="team.name">{{ team.name }}</SelectItem>
      </SelectContent>
    </Select>
    <Select v-model="selectedRubric">
      <SelectTrigger class="w-full max-w-2xs">
        <SelectValue placeholder="Select a rubric" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem v-for="rubric in rubrics" :value="rubric.id">{{ rubric.title }}</SelectItem>
      </SelectContent>
    </Select>
  </div>

  <div class="flex flex-row items-start h-full w-full">
    <div class="flex-1 overflow-x-auto">
      <RubricDesktop :rubric="selectedRubricData" />
    </div>
  </div>
</div>
</template>
