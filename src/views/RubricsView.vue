<script setup lang="ts">
import { PhFloppyDisk, PhPlus, PhTrash, PhArrowCounterClockwise } from '@phosphor-icons/vue'
import { Button } from '@/components/ui/button'
import { ref, computed, onMounted, watch } from 'vue'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RubricEdit } from '@/components/rubric-edit'
import { Input } from '@/components/ui/input'
import { Field, FieldLabel } from '@/components/ui/field'
import { ButtonGroup } from '@/components/ui/button-group'
import { NumberField, NumberFieldContent, NumberFieldDecrement, NumberFieldIncrement, NumberFieldInput } from '@/components/ui/number-field';
import { useRubricStore } from '@/stores/rubrics'

const rubricStore = useRubricStore()

onMounted(() => {
  // Load list options into store global memory if not already retrieved
  if (rubricStore.rubricsList.length === 0) {
    rubricStore.loadRubricsLookup()
  }
})

const selectedRubricId = ref<string | undefined>(undefined)
watch(
  () => selectedRubricId.value,
  async (newId) => {
    if (newId) {
      try {
        await rubricStore.loadActiveRubric(newId)
      } catch (error) {
        console.error('Failed to swap active rubric view matrix:', error)
      }
    } else {
      rubricStore.clearActiveRubric()
    }
  }
)

const createNew = async () => {
  const newRubricId = await rubricStore.createRubric()
  if (newRubricId) {
    selectedRubricId.value = newRubricId
  }
}

const resetRubric = async () => {
  rubricStore.revertChanges()
}
const saveRubric = async () => {
  rubricStore.saveAllChanges()
}
const deleteRubric = async () => {
  rubricStore.deleteAndClearActiveRubric()
}
</script>

<template>
<div class="flex flex-col gap-2 mt-2">
  <div class="flex flex-row flex-wrap items-center gap-2">
    <Button variant="secondary" class="w-full sm:w-auto" @click="createNew"><PhPlus /> New Rubrics</Button>
    <Select v-model="selectedRubricId" v-if="rubricStore.rubricsList.length > 0">
      <SelectTrigger class="w-full sm:w-2xs" :class="selectedRubricId ? 'bg-teal-100' : 'bg-red-100'">
        <SelectValue placeholder="Select a rubric" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem v-for="rubric in rubricStore.rubricsList" :value="rubric.id">{{ rubric.title }}</SelectItem>
      </SelectContent>
    </Select>
  </div>



  <div class="flex flex-col items-stretch h-full w-full gap-2 mt-2" v-if="rubricStore.hasActiveRubric">
    <div class="flex flex-row gap-2 grow">
      <Field class="flex-1">
        <FieldLabel>Rubric Name</FieldLabel>
        <Input v-model="rubricStore.activeRubric!.title" class="w-full"/>
      </Field>
      <Field class="flex-1">
        <FieldLabel>Max Score</FieldLabel>
        <NumberField class="" :min="0" :max="100" :step="1"
          :defaultValue="0"
          v-model="rubricStore.activeRubric!.maxScore"
        >
          <NumberFieldContent>
            <NumberFieldDecrement />
            <NumberFieldInput/>
            <NumberFieldIncrement />
          </NumberFieldContent>
        </NumberField>
      </Field>
      <Field class="flex-0">
        <FieldLabel>Controls</FieldLabel>
        <ButtonGroup>
          <Button variant="outline" :disabled="!rubricStore.isDirty" @click="resetRubric"><PhArrowCounterClockwise /></Button>
          <Button variant="outline" :disabled="!rubricStore.isDirty" @click="saveRubric"><PhFloppyDisk /></Button>
          <Button variant="outline" @click="deleteRubric"><PhTrash class="text-destructive" /></Button>
        </ButtonGroup>
      </Field>
    </div>
    <div class="flex flex-row items-start">
    </div>
    <div class="flex-1 overflow-x-auto">
      <RubricEdit />
    </div>
  </div>
</div>
</template>
