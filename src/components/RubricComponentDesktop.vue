<script setup lang="ts">
import type { RubricComponent } from '@/types'

defineProps<{
  component: RubricComponent
}>()
</script>

<template>
<TableRow>
  <template v-if="component.subcomponents">
    <TableCell class="px-4" colspan="5">{{ component.name }}</TableCell>
  </template>
  <template v-else>
    <RubricComponentDesktop :component="component" />
  </template>
</TableRow>
</template>
