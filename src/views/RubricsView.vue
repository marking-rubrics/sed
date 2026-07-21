<script setup lang="ts">
import { PhPlus } from '@phosphor-icons/vue'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ref } from 'vue'

</script>

<template>
<div class="flex flex-col gap-2 mt-2">
  <div class="flex flex-row items-center">
    <Button variant="secondary"><PhPlus /> New Rubrics</Button>
  </div>

  <div class="flex flex-row items-start h-full w-full">
    <div class="flex-1 overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="w-auto whitespace-nowrap px-4">Team</TableHead>
            <TableHead class="w-full">Members</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>

        </TableBody>
      </Table>
    </div>
  </div>
</div>
</template>
