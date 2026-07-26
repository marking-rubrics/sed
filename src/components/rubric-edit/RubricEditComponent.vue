<script setup lang="ts">
import type { RubricComponent } from '@/types'
import { TableRow, TableCell } from '@/components/ui/table';
import { NumberField, NumberFieldContent, NumberFieldDecrement, NumberFieldIncrement, NumberFieldInput } from '@/components/ui/number-field';
import { Textarea } from '@/components/ui/textarea';
import { PhDotsThreeVertical, PhListPlus, PhRowsPlusBottom, PhRowsPlusTop, PhTrash } from '@phosphor-icons/vue';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';


defineProps<{
  component: RubricComponent
  maxScore: number
  indexList: number[]
}>()
</script>

<template>
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
            <DropdownMenuItem><PhRowsPlusTop /> Add Above</DropdownMenuItem>
            <DropdownMenuItem><PhRowsPlusBottom /> Add Below</DropdownMenuItem>
            <DropdownMenuItem><PhListPlus /> Add Sub</DropdownMenuItem>
            <DropdownMenuItem><PhTrash /> Delete</DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </TableCell>
    <TableCell>{{ indexList.join('.') }}</TableCell>
    <TableCell class="px-4 font-black" colspan="5">{{ component.name }}</TableCell>
  </TableRow>
  <RubricEditComponent v-for="(subcomp, subcompindex) in component.subcomponents" :component="subcomp" :maxScore="maxScore" :indexList="indexList.concat(subcompindex + 1)" />
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
            <DropdownMenuItem><PhRowsPlusTop /> Add Above</DropdownMenuItem>
            <DropdownMenuItem><PhRowsPlusBottom /> Add Below</DropdownMenuItem>
            <DropdownMenuItem><PhListPlus /> Add Sub</DropdownMenuItem>
            <DropdownMenuItem><PhTrash /> Delete</DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </TableCell>
    <TableCell>{{ indexList.join('.') }}</TableCell>
    <TableCell class="whitespace-normal wrap-break-words px-4">{{ component.name }}</TableCell>
    <TableCell class="w-auto whitespace-nowrap px-4 text-center">{{ component.weightage }}</TableCell>
    <TableCell class="whitespace-normal wrap-break-words px-4" v-for="ld in component.levelDescriptions">{{ ld.description }}</TableCell>
  </TableRow>
</template>
</template>
