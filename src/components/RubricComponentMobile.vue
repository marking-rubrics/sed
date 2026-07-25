<script setup lang="ts">
import type { RubricComponent, RubricLevel } from '@/types'
import { TableRow, TableCell } from '@/components/ui/table';
import { NumberField, NumberFieldContent, NumberFieldDecrement, NumberFieldIncrement, NumberFieldInput } from '@/components/ui/number-field';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Field, FieldLabel } from './ui/field';
import { PhEye } from '@phosphor-icons/vue';
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
