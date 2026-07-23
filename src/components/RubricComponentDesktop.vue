<script setup lang="ts">
import type { RubricComponent } from '@/types'
import { TableRow, TableCell } from '@/components/ui/table';

defineProps<{
  component: RubricComponent
}>()
</script>

<template>
<template v-if="component.subcomponents">
  <TableRow>
    <TableCell class="px-4 font-black" colspan="5">{{ component.name }}</TableCell>
  </TableRow>
  <RubricComponentDesktop v-for="subcomp in component.subcomponents" :component="subcomp" />
</template>
<template v-else>
  <TableRow>
    <TableCell class="w-auto whitespace-nowrap px-4">{{ component.name }}</TableCell>
    <TableCell class="w-auto whitespace-nowrap px-4">{{ component.weightage }}</TableCell>
    <TableCell class="px-4" v-for="ld in component.levelDescriptions">{{ ld.description }}</TableCell>
  </TableRow>
</template>
</template>
