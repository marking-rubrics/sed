<script setup lang="ts">
import type { RubricComponent } from '@/types'
import { TableRow, TableCell } from '@/components/ui/table';
import { NumberField, NumberFieldContent, NumberFieldDecrement, NumberFieldIncrement, NumberFieldInput } from '@/components/ui/number-field';
import { Textarea } from '@/components/ui/textarea';

defineProps<{
  component: RubricComponent
  maxScore: number
}>()
</script>

<template>
<template v-if="component.subcomponents">
  <TableRow>
    <TableCell class="px-4 font-black" colspan="5">{{ component.name }}</TableCell>
  </TableRow>
  <RubricComponentDesktop v-for="subcomp in component.subcomponents" :component="subcomp" :maxScore="maxScore" />
</template>
<template v-else>
  <TableRow>
    <TableCell class="whitespace-normal wrap-break-words px-4">{{ component.name }}</TableCell>
    <TableCell class="w-auto whitespace-nowrap px-4 text-center">{{ component.weightage }}</TableCell>
    <TableCell class="whitespace-normal wrap-break-words px-4" v-for="ld in component.levelDescriptions">{{ ld.description }}</TableCell>
  </TableRow>
</template>
</template>
