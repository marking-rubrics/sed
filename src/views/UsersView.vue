<script setup lang="ts">
import { Marker, MarkerContent } from '@/components/ui/marker';
import UserInfo from '@/components/UserInfo.vue';
import type { User, Team, RubricLookup } from '@/types'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import UserEditor from '@/components/UserEditor.vue';
import { onMounted, ref, computed } from 'vue'
import { createEmptyUser } from '@/utils/users'
import { Button } from '@/components/ui/button'
import { PhPlus } from '@phosphor-icons/vue'
import { Input } from '@/components/ui/input'
import { getAllTeams } from '@/services/teamService'
import { getAllUsersWithProfileAssignments, updateExistingUserAndAssignments, administrativeDeleteUser } from '@/services/userService'
import { adminRegisterAndProvisionUser } from '@/services/adminService'
import { getRubricsLookup } from '@/services/rubricService';
import { useUserStore } from '@/stores/users';
const userStore = useUserStore()

const manageableUsers = computed(() => {
  const currentAdminUid = userStore.currentUser?.id

  return users.value.filter((user) => {
    // 🚀 CRITICAL CHECK: Filter out any soft-deleted or disabled profile accounts
    if ((user as any).isDisabled === true) return false

    // Filter out the currently logged-in admin session
    if (user.id === currentAdminUid) return false

    return true
  })
})
const currentUser = computed(() => users.value.find(user => user.id === userStore.currentUser?.id))

const users = ref<User[]>([])
const teams = ref<Team[]>([])
const rubrics = ref<RubricLookup[]>([])
onMounted(async () => {
  teams.value = await getAllTeams()
  rubrics.value = await getRubricsLookup()
  await refreshUsers()
})
const refreshUsers = async () => {
  users.value = await getAllUsersWithProfileAssignments()
}

const newUserName = ref("")
const newEmail = computed(() => newUserName.value + "@sed-marking.com")
const password = ref("")
const createNewUser = async () => {
  if (newUserName.value === '') return
  if (password.value === '') return
  await adminRegisterAndProvisionUser({
    displayName: newUserName.value,
    email: newEmail.value,
    password: password.value,
    roles: ['assessor']
  })
  users.value = await getAllUsersWithProfileAssignments()
  newUserName.value = ""
  password.value = ""
}

const showEditor = ref(false)
const openEditor = () => { showEditor.value = true }
const closeEditor = () => { showEditor.value = false }
const userInEditor = ref<User>(createEmptyUser())
const sendToEditor = (user: User) => {
  if (userInEditor.value.id == user.id && showEditor.value) {
    closeEditor()
  } else {
    userInEditor.value = user
    openEditor()
  }
}
const updateUser = async (user: User) => {
  userInEditor.value = user
  await updateExistingUserAndAssignments({
    id: user.id,
    displayName: user.displayName,
    roles: user.roles,
    rubricIds: user.rubricIds,
    teamIds: user.teamIds
  })
  await refreshUsers()
  closeEditor()
}
const deleteUser = async (user: User) => {
  await administrativeDeleteUser(user.id)
  await refreshUsers()
  closeEditor()
}
</script>

<template>
<div class="flex flex-col gap-2 mt-2">
  <div class="flex flex-row items-center gap-1">
    <Input placeholder="Username" v-model="newUserName"/>
    <Input placeholder="Password" v-model="password"/>
    <Button variant="secondary" @click="createNewUser"><PhPlus /> New User</Button>
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
          <UserInfo v-if="currentUser" :user="currentUser!" class="w-full max-w-md" @click="sendToEditor(currentUser!)"
            :rubrics="rubrics" :teams="teams"
          />
          <UserInfo v-for="user in manageableUsers" :key="user.id" :user="user" class="w-full max-w-md" @click="sendToEditor(user)"
            :rubrics="rubrics" :teams="teams"
          />
        </TableBody>
      </Table>
    </div>

    <aside class="sticky top-24 flex flex-row items-stretch self-start h-auto ml-5"
      :class="{ 'hidden': !showEditor }"
    >
      <UserEditor class="w-150"
        :user="userInEditor" :rubrics="rubrics" :teams="teams"
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
