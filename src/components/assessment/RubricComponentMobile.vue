<script setup lang="ts">
import type { RubricComponent, RubricLevel } from '@/types'
import RubricComponentCard from './RubricComponentCard.vue';

defineProps<{
  levels: RubricLevel[]
  component: RubricComponent
  maxScore: number
  indices: number[]
}>()
</script>

<template>
<template v-if="component.subcomponents && component.subcomponents.length > 0">
  <div class="font-black text-sm">{{ indices.map(i => i + 1).join('.') }} {{ component.name }}</div>
  <RubricComponentMobile
    v-for="(subcomp, index) in component.subcomponents"
    :component="subcomp"
    :maxScore="maxScore"
    :levels="levels"
    :indices="indices.concat(index)"
  />
</template>
<template v-else>
  <RubricComponentCard
    :component="component"
    :maxScore="maxScore"
    :levels="levels"
    :indices="indices"
  />
</template>
</template>
