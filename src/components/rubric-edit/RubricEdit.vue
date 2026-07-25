<script setup lang="ts">
import type { Rubric, AssessedRubric } from "@/types"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { RubricEditComponent } from "./index"
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

defineProps<{
  rubric: Rubric | undefined
}>()
</script>

<template>
<Table v-if="rubric" class="w-full">
  <TableHeader>
    <TableRow>
      <TableHead></TableHead>
      <TableHead class="w-auto whitespace-nowrap px-4 text-center">Descriptor</TableHead>
      <TableHead v-for="level in rubric.levels" :key="level.descriptor"
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
      <TableHead class="w-auto whitespace-nowrap px-4 text-center">Range</TableHead>
      <TableHead v-for="level in rubric.levels" :key="level.descriptor"
        class="text-center px-4"
      >
        <Input
          v-model="level.range"
          class="w-full text-sm text-center"
        />
      </TableHead>
    </TableRow>
    <TableRow>
      <TableHead class="px-4">Criteria</TableHead>
      <TableHead class="w-auto whitespace-nowrap px-4 text-center">Weightage</TableHead>
      <TableHead v-for="level in rubric.levels" :key="level.descriptor" class="px-4">
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="secondary" class="w-full text-sm text-center">
              Menu
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuItem>Add Left</DropdownMenuItem>
              <DropdownMenuItem>Add Right</DropdownMenuItem>
              <DropdownMenuItem>Delete</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <template v-for="component in rubric.components" :key="component.id">
      <RubricEditComponent :component="component" :maxScore="rubric.maxScore" />
    </template>
  </TableBody>
</Table>
</template>
