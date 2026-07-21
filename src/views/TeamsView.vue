<script setup lang="ts">
import { PhPlus } from '@phosphor-icons/vue'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ref } from 'vue'

const showEditor = ref(false)
const openEditor = () => { showEditor.value = true }
const closeEditor = () => { showEditor.value = false }
</script>

<template>
<div class="flex flex-col gap-2 mt-2">
  <div class="flex flex-row items-center">
    <Button variant="secondary"><PhPlus /> New Team</Button>
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

    <aside class="sticky top-24 flex flex-row items-stretch self-start h-auto ml-5"
      :class="{ 'hidden': !showEditor }"
    >
      <!-- <UserEditor class="w-150"
        :user="userInEditor" :rubricList="rubricList" :teamList="teamList"
        @close="closeEditor" @update="updateUser" @delete="deleteUser"
      /> -->
    </aside>
  </div>
</div>
</template>
