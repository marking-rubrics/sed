<script setup lang="ts">
import type { Rubric, AssessedComponent } from "@/types"
import RubricComponentMobile from "./RubricComponentMobile.vue"

defineProps<{
  rubric: Rubric
  assessedComponents: AssessedComponent[]
}>()
</script>

<template>
<div v-if="rubric" class="w-full flex flex-col gap-2">
  <template v-for="(component, index) in rubric.components" :key="component.id">
    <RubricComponentMobile :component="component" :maxScore="rubric.maxScore" :levels="rubric.levels" :indices="[index]" />
  </template>
</div>
</template>
