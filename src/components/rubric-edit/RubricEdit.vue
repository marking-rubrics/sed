<script setup lang="ts">
import type { Rubric } from "@/types"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { RubricEditComponent } from "./index"
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { PhColumnsPlusRight, PhColumnsPlusLeft, PhTrash, PhDotsThree } from "@phosphor-icons/vue";
import { useRubricStore } from '@/stores/rubrics'
import { storeToRefs } from "pinia";
const rubricStore = useRubricStore()
const { activeRubric } = storeToRefs(rubricStore)
</script>

<template>
<Table v-if="activeRubric" class="w-full">
  <TableHeader>
    <TableRow>
      <TableHead></TableHead>
      <TableHead></TableHead>
      <TableHead></TableHead>
      <TableHead class="w-auto whitespace-nowrap px-4 text-center">Descriptor</TableHead>
      <TableHead v-for="(level, levelindex) in activeRubric.levels" :key="levelindex"
        class="text-center px-4"
      >
        <Input
          v-model="level.descriptor"
          class="w-full text-sm text-center"
        />
      </TableHead>
    </TableRow>
    <TableRow>
      <TableHead></TableHead>
      <TableHead></TableHead>
      <TableHead></TableHead>
      <TableHead class="w-auto whitespace-nowrap px-4 text-center">Range</TableHead>
      <TableHead v-for="(level, levelindex) in activeRubric.levels" :key="levelindex"
        class="text-center px-4"
      >
        <Input
          v-model="level.range"
          class="w-full text-sm text-center"
        />
      </TableHead>
    </TableRow>
    <TableRow>
      <TableHead></TableHead>
      <TableHead></TableHead>
      <TableHead class="px-4">Criteria</TableHead>
      <TableHead class="w-auto whitespace-nowrap px-4 text-center">Weightage</TableHead>
      <TableHead v-for="(level, levelIndex) in activeRubric.levels" :key="levelIndex" class="px-4">
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="secondary" class="w-full text-sm text-center">
              <PhDotsThree />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuItem @click="rubricStore.insertGlobalLevel(levelIndex,'left')"><PhColumnsPlusLeft /> Add Left</DropdownMenuItem>
              <DropdownMenuItem @click="rubricStore.insertGlobalLevel(levelIndex,'right')"><PhColumnsPlusRight /> Add Right</DropdownMenuItem>
              <DropdownMenuItem @click="rubricStore.deleteGlobalLevel(levelIndex)"><PhTrash /> Delete</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <template v-for="(component, index) in activeRubric.components" :key="component.id">
      <RubricEditComponent :indexList="[index]" />
    </template>
  </TableBody>
</Table>
</template>
