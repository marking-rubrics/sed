<script setup lang="ts">
import type { Rubric, AssessedRubric, AssessedComponent } from "@/types"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import RubricComponentDesktop from "./RubricComponentDesktop.vue"

defineProps<{
  rubric: Rubric
  assessedComponents: AssessedComponent[]
}>()

import { useAssessmentStore } from '@/stores/assessments'
const assessmentStore = useAssessmentStore()
</script>

<template>
<Table v-if="rubric" class="w-full">
  <TableHeader>
    <TableRow>
      <TableHead class="w-0 px-4"></TableHead>
      <TableHead class="w-0 px-4">Criteria</TableHead>
      <TableHead class="w-0 whitespace-nowrap px-4 text-center">Weightage</TableHead>
      <TableHead v-for="level in rubric.levels" :key="level.descriptor"
        class="text-center px-4"
      >
        {{ level.descriptor }}<br/>{{ level.range }}
      </TableHead>
      <TableHead class="w-0 whitespace-nowrap text-center">Score</TableHead>
      <TableHead class="w-0 whitespace-nowrap text-center">Feedback</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <template v-for="(component, index) in rubric.components" :key="component.id">
      <RubricComponentDesktop :component="component" :maxScore="rubric.maxScore" :indices="[index]" />
    </template>
    <TableRow>
      <TableCell class="text-right font-bold" :colspan="rubric.levels.length + 3">
        Total Score
      </TableCell>
      <TableCell class="text-center font-black">
        {{ assessmentStore.totalScore }} %
      </TableCell>
    </TableRow>
  </TableBody>
</Table>
</template>
