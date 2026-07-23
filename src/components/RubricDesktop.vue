<script setup lang="ts">
import type { Rubric, AssessedRubric } from "@/types"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import RubricComponentDesktop from "./RubricComponentDesktop.vue"

defineProps<{
  rubric: Rubric | undefined
  assessedRubric: AssessedRubric | undefined
}>()
</script>

<template>
<Table v-if="rubric" class="w-full table-fixed">
  <TableHeader>
    <TableRow>
      <TableHead class="w-auto whitespace-nowrap px-4">Criteria</TableHead>
      <TableHead class="w-auto whitespace-nowrap px-4 text-center">Weightage</TableHead>
      <TableHead v-for="level in rubric.levels" :key="level.descriptor"
        class="text-center"
      >
        {{ level.descriptor }}<br/>{{ level.range }}
      </TableHead>
      <TableHead class="w-auto whitespace-nowrap text-center">Score</TableHead>
      <TableHead class="w-auto whitespace-nowrap text-center">Feedback</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <template v-for="component in rubric.components" :key="component.id">
      <RubricComponentDesktop :component="component" :maxScore="rubric.maxScore" />
    </template>
  </TableBody>
</Table>
</template>
