<script setup lang="ts">
import type { RubricComponent, RubricLevel } from '@/types'
import RubricComponentCard from './RubricComponentCard.vue';

defineProps<{
  levels: RubricLevel[]
  component: RubricComponent
  maxScore: number
}>()
</script>

<template>
<template v-if="component.subcomponents">
  <div class="font-black text-sm">{{ component.name }}</div>
  <RubricComponentMobile v-for="subcomp in component.subcomponents" :component="subcomp" :maxScore="maxScore" :levels="levels"/>
</template>
<template v-else>
  <RubricComponentCard :component="component" :maxScore="maxScore" :levels="levels" />
</template>
</template>
