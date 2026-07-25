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
    <TableCell class="w-auto whitespace-nowrap px-4 text-center">
      <NumberField class="" :min="0" :max="maxScore" :step="0.1" :defaultValue="0" :format-options="{
        minimumFractionDigits: 1,
      }">
        <NumberFieldContent>
          <NumberFieldDecrement />
          <NumberFieldInput class="w-30" />
          <NumberFieldIncrement />
        </NumberFieldContent>
      </NumberField>
    </TableCell>
    <TableCell class="w-auto px-4 text-center">
      <Textarea class="w-[250px] h-[100px]" />
    </TableCell>
  </TableRow>
</template>
</template>
