<script setup lang="ts">
import type { RubricComponent } from '@/types'
import { TableRow, TableCell } from '@/components/ui/table';
import { NumberField, NumberFieldContent, NumberFieldDecrement, NumberFieldIncrement, NumberFieldInput } from '@/components/ui/number-field';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { PhDotsThreeVertical, PhListPlus, PhRowsPlusBottom, PhRowsPlusTop, PhTrash } from '@phosphor-icons/vue';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ref, computed } from 'vue'
import { getComponentByIndexPath } from '@/utils/rubrics';
import { useRubricStore } from '@/stores/rubrics'
const rubricStore = useRubricStore()

const props = defineProps<{
  indexList: number[]
}>()

const component = computed<RubricComponent | null>({
  get() {
    const rootTree = rubricStore.activeRubric?.components || []
    return getComponentByIndexPath(rootTree, props.indexList)
  },
  set(newValue) {
    if (!newValue || !rubricStore.activeRubric) return

    const rootTree = rubricStore.activeRubric.components

    // Trace down the tree to replace the node directly at its destination index
    let currentArray: RubricComponent[] = rootTree
    for (let i = 0; i < props.indexList.length; i++) {
      const targetIndex = props.indexList[i]

      if (i === props.indexList.length - 1) {
        // We reached the final target index—replace the object entirely
        currentArray[targetIndex!] = newValue
      } else {
        // Keep digging deeper
        currentArray = currentArray[targetIndex!]!.subcomponents || []
      }
    }
  }
})

const insertAbove = () => {
  rubricStore.insertComponentAtDepth(props.indexList, 'above')
}
const insertBelow = () => {
  rubricStore.insertComponentAtDepth(props.indexList, 'below')
}
const deleteComponent = () => {
  rubricStore.deleteComponentAtPath(props.indexList)
}
const addSub = () => {
  rubricStore.addSubcomponent(props.indexList)
}
</script>

<template>
  <template v-if="component">
  <!-- <TableRow><TableCell :colspan="rubricStore.activeRubric?.levels.length || 0 + 4">{{ component }}</TableCell></TableRow> -->
    <template v-if="component.subcomponents && component.subcomponents.length > 0">
      <TableRow>
        <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button variant="secondary" class="text-sm text-center">
                <PhDotsThreeVertical />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuGroup>
                <DropdownMenuItem @click="insertAbove"><PhRowsPlusTop /> Add Above</DropdownMenuItem>
                <DropdownMenuItem @click="insertBelow"><PhRowsPlusBottom /> Add Below</DropdownMenuItem>
                <DropdownMenuItem @click="addSub"><PhListPlus /> Add Sub</DropdownMenuItem>
                <DropdownMenuItem @click="deleteComponent"><PhTrash /> Delete</DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
        <TableCell>{{ indexList.map(i => i + 1).join('.') }}</TableCell>
        <TableCell class="px-4 font-black" :colspan="(rubricStore.activeRubric?.levels.length || 0) + 2">
          <Input v-model="component.name" />
        </TableCell>
      </TableRow>
      <RubricEditComponent v-for="(subcomp, subcompindex) in component.subcomponents" :indexList="indexList.concat(subcompindex)" />
    </template>
    <template v-else>
      <TableRow>
        <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button variant="secondary" class="text-sm text-center">
                <PhDotsThreeVertical />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuGroup>
                <DropdownMenuItem @click="insertAbove"><PhRowsPlusTop /> Add Above</DropdownMenuItem>
                <DropdownMenuItem @click="insertBelow"><PhRowsPlusBottom /> Add Below</DropdownMenuItem>
                <DropdownMenuItem @click="addSub"><PhListPlus /> Add Sub</DropdownMenuItem>
                <DropdownMenuItem @click="deleteComponent"><PhTrash /> Delete</DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
        <TableCell>{{ indexList.map(i => i + 1).join('.') }}</TableCell>
        <TableCell class="whitespace-normal wrap-break-words px-4">
          <Input v-model="component.name" />
        </TableCell>
        <TableCell class="w-auto whitespace-nowrap px-4 text-center">
          <NumberField class="" :min="0" :max="100" :step="1"
            :defaultValue="0"
            v-model="component.weightage"
          >
            <NumberFieldContent>
              <NumberFieldDecrement />
              <NumberFieldInput/>
              <NumberFieldIncrement />
            </NumberFieldContent>
          </NumberField>
        </TableCell>
        <TableCell class="whitespace-normal wrap-break-words px-4" v-for="ld in component.levelDescriptions">
          <Textarea v-model="ld.description" />
        </TableCell>
      </TableRow>
    </template>
  </template>
</template>
