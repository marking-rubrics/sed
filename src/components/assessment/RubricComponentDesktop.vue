<script setup lang="ts">
import type { RubricComponent } from '@/types'
import { TableRow, TableCell } from '@/components/ui/table';
import { NumberField, NumberFieldContent, NumberFieldDecrement, NumberFieldIncrement, NumberFieldInput } from '@/components/ui/number-field';
import { Textarea } from '@/components/ui/textarea';
import { useNestedGrading } from '@/composables/useNestedGrading';

const props = defineProps<{
  component: RubricComponent
  maxScore: number
  indices: number[]
}>()

const { score, comment } = useNestedGrading(props.indices);
</script>

<template>
<template v-if="component.subcomponents && component.subcomponents.length > 0">
  <TableRow>
    <TableCell class="w-0 px-4">{{ indices.map(i => i + 1).join('.') }}</TableCell>
    <TableCell class="px-4 font-black" colspan="5">{{ component.name }}</TableCell>
  </TableRow>
  <RubricComponentDesktop
    v-for="(subcomp, index) in component.subcomponents"
    :component="subcomp"
    :maxScore="maxScore"
    :indices="indices.concat(index)"
  />
</template>
<template v-else>
  <TableRow>
    <TableCell class="w-0 px-4">{{ indices.map(i => i + 1).join('.') }}</TableCell>
    <TableCell class="w-0 whitespace-normal wrap-break-words px-4">{{ component.name }}</TableCell>
    <TableCell class="w-0 whitespace-nowrap px-4 text-center">{{ component.weightage }}</TableCell>
    <TableCell class="whitespace-normal wrap-break-words px-4 text-center" v-for="ld in component.levelDescriptions">{{ ld.description }}</TableCell>
    <TableCell class="w-0 whitespace-nowrap px-4 text-center">
      <NumberField class="w-30" v-model="score" :min="0" :max="maxScore" :step="0.1" :defaultValue="0" :format-options="{
        minimumFractionDigits: 1,
      }">
        <NumberFieldContent>
          <NumberFieldDecrement />
          <NumberFieldInput />
          <NumberFieldIncrement />
        </NumberFieldContent>
      </NumberField>
    </TableCell>
    <TableCell class="w-0 px-4 text-center">
      <Textarea class="w-[250px] h-[100px]" v-model="comment" />
    </TableCell>
  </TableRow>
</template>
</template>
