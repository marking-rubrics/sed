<script setup lang="ts">
import { Marker, MarkerContent } from '@/components/ui/marker';
import UserInfo from '@/components/UserInfo.vue';
import type { User, UserRole } from '@/types'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import UserEditor from '@/components/UserEditor.vue';
import { ref } from 'vue'
import { createEmptyUser } from '@/utils/factory'
import { Button } from '@/components/ui/button'
import { PhPlus } from '@phosphor-icons/vue'


const currentUser = {
  uid: 'user',
  role: 'Admin' as UserRole,
  displayName: 'User Display Name',
  rubricIds: ['fdssaf', 'fsdafa'],
  teamIds: ['fdsaf'],
}

const otherUsers = [
  {
    uid: 'asdfljlj',
    role: 'Admin' as UserRole,
    displayName: 'idhsuocahsdocois',
    rubricIds: [''],
    teamIds: [''],
  },
]

const rubricList = [{ value: 'a', label: 'a' }, { value: 'b', label: 'b' }, { value: 'c', label: 'c' }]
const teamList = [{ value: 'T1-1', label: 'T1-1' }, { value: 'T1-2', label: 'T1-2' }]

const showEditor = ref(false)
const openEditor = () => { showEditor.value = true }
const closeEditor = () => { showEditor.value = false }
const userInEditor = ref<User>(createEmptyUser())
const sendToEditor = (user: User) => {
  if (userInEditor.value.uid == user.uid && showEditor.value) {
    closeEditor()
  } else {
    userInEditor.value = user
    openEditor()
  }
}
const updateUser = (user: User) => {
  userInEditor.value = user
}
const deleteUser = (user: User) => {

}
</script>

<template>
<div class="flex flex-col gap-2 mt-2">
  <div class="flex flex-row items-center">
    <Button variant="secondary"><PhPlus /> New User</Button>
  </div>

  <div class="flex flex-row items-start h-full w-full">
    <div class="flex-1 overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="w-auto whitespace-nowrap px-4">User</TableHead>
            <TableHead class="w-auto whitespace-nowrap px-4">Display Name</TableHead>
            <TableHead class="w-auto whitespace-nowrap px-4">Role</TableHead>
            <TableHead class="w-1/2">Rubrics</TableHead>
            <TableHead class="w-1/2">Teams</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <UserInfo :user="currentUser" class="w-full max-w-md" @click="sendToEditor(currentUser)"/>
          <UserInfo v-for="user in otherUsers" :key="user.uid" :user="user" class="w-full max-w-md" @click="sendToEditor(user)"/>
        </TableBody>
      </Table>
    </div>

    <aside class="sticky top-24 flex flex-row items-stretch self-start h-auto ml-5"
      :class="{ 'hidden': !showEditor }"
    >
      <!-- <Separator orientation="vertical" class="mx-5 h-auto self-stretch"/> -->
      <UserEditor class="w-150"
        :user="userInEditor" :rubricList="rubricList" :teamList="teamList"
        @close="closeEditor" @update="updateUser" @delete="deleteUser"
      />
    </aside>
  </div>

  <!-- Other users -->
  <!-- <Marker variant="separator" class="py-3 select-none">
    <MarkerContent>Other Users</MarkerContent>
  </Marker> -->
  <!-- <div class="flex flex-row flex-wrap">
    <UserInfo v-for="user in otherUsers" :key="user.uid" :user="user" class="w-full max-w-md" :rubricList="rubricList" :teamList="teamList"/>
  </div> -->
</div>

</template>
