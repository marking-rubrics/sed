<script setup lang="ts">
import type { RubricComponent, RubricLevel } from '@/types'
import { TableRow, TableCell } from '@/components/ui/table';
import { NumberField, NumberFieldContent, NumberFieldDecrement, NumberFieldIncrement, NumberFieldInput } from '@/components/ui/number-field';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Field, FieldLabel } from './ui/field';


defineProps<{
  levels: RubricLevel[]
  component: RubricComponent
  maxScore: number
}>()
</script>

<template>
<template v-if="component.subcomponents">
  <div class="flex flex-col w-full gap-2">
    <Separator orientation="horizontal" />
    <div class="font-black text-sm">{{ component.name }}</div>
    <Separator orientation="horizontal" />
  </div>
  <RubricComponentMobile v-for="subcomp in component.subcomponents" :component="subcomp" :maxScore="maxScore" :levels="levels"/>
</template>
<template v-else>
  <Card class="flex flex-col m-2">
    <CardHeader>
      <CardTitle>
        <div class="text-sm">{{ component.name }}</div>
      </CardTitle>
    </CardHeader>
    <CardContent class="flex flex-col gap-2">
      <Button class="w-full text-xs" variant="secondary">Collapse rubric</Button>
      <Accordion type="single" collapsible>
        <AccordionItem v-for="level in levels" :value="level.descriptor">
          <AccordionTrigger>{{ level.descriptor }}</AccordionTrigger>
          <AccordionContent>{{ component.levelDescriptions!.find(ld => ld.levelDescriptor === level.descriptor)?.description }}</AccordionContent>
        </AccordionItem>
      </Accordion>

      <div class="flex flex-row w-full justify-center">
        <NumberField class="w-full" :min="0" :max="maxScore" :step="0.1" :defaultValue="0" :format-options="{
          minimumFractionDigits: 1,
        }">
          <NumberFieldContent>
            <NumberFieldDecrement />
            <NumberFieldInput />
            <NumberFieldIncrement />
          </NumberFieldContent>
        </NumberField>
      </div>

      <Field class="w-full">
        <FieldLabel>
          Comment
        </FieldLabel>
        <Textarea class="w-full h-[100px]" />
      </Field>
    </CardContent>
  </Card>
  <!-- <TableRow>
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
  </TableRow> -->
</template>
</template>
