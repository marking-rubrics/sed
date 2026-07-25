<script setup lang="ts">
import { PhPlus } from '@phosphor-icons/vue'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ref, computed } from 'vue'
import type { Rubric } from '@/types'
import { mockPresentationRubric } from '@/examples/mockPresentationRubric'
import { mockEngineeringRubric } from '@/examples/mockEngineeringRubric'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RubricEdit } from '@/components/rubric-edit'

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
    <Button variant="secondary" class="w-full sm:w-auto"><PhPlus /> New Rubrics</Button>
    <Select v-model="selectedRubric">
      <SelectTrigger class="w-full sm:w-2xs" :class="selectedRubric ? 'bg-teal-100' : 'bg-red-100'">
        <SelectValue placeholder="Select a rubric" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem v-for="rubric in rubrics" :value="rubric.id">{{ rubric.title }}</SelectItem>
      </SelectContent>
    </Select>
  </div>

  <div class="flex flex-row items-start h-full w-full">
    <div class="flex-1 overflow-x-auto">
      <RubricEdit :rubric="selectedRubricData" />
    </div>
  </div>
</div>
</template>
