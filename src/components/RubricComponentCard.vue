<script setup lang="ts">
import { Card, CardAction, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Field, FieldLabel } from './ui/field';
import { PhEye, PhEyeClosed } from '@phosphor-icons/vue';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { NumberField, NumberFieldContent, NumberFieldDecrement, NumberFieldIncrement, NumberFieldInput } from './ui/number-field';
import { Textarea } from './ui/textarea';
import type { RubricComponent, RubricLevel } from '@/types';
import { ref } from 'vue';

defineProps<{
  component: RubricComponent;
  levels: RubricLevel[];
  maxScore: number;
}>();

const showRubric = ref(false);

const toggleView = () => {
  showRubric.value = !showRubric.value;
}
</script>

<template>
<Card class="flex flex-col m-2">
  <CardHeader>
    <CardTitle>
      <div class="text-sm">{{ component.name }}</div>
    </CardTitle>
    <CardAction>
      <Button variant="ghost" @click="toggleView">
        <PhEyeClosed v-if="!showRubric" /><PhEye v-else />
      </Button>
    </CardAction>
  </CardHeader>
  <CardContent class="flex flex-col gap-1">
    <Accordion type="single" collapsible v-if="showRubric" class="bg-gray-50 px-2">
      <AccordionItem v-for="level in levels" :value="level.descriptor">
        <AccordionTrigger class="text-xs">{{ level.descriptor }}</AccordionTrigger>
        <AccordionContent class="font-thin text-xs">{{ component.levelDescriptions!.find(ld => ld.levelDescriptor === level.descriptor)?.description }}</AccordionContent>
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
</template>
