<script setup lang="ts">
import type { Rubric, AssessedRubric } from "@/types"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import RubricComponentMobile from "./RubricComponentMobile.vue"

defineProps<{
  rubric: Rubric | undefined
  assessedRubric: AssessedRubric | undefined
}>()
</script>

<template>
<div v-if="rubric" class="w-full flex flex-col gap-2">
  <template v-for="component in rubric.components" :key="component.id">
    <RubricComponentMobile :component="component" :maxScore="rubric.maxScore" :levels="rubric.levels" />
  </template>
</div>
</template>
