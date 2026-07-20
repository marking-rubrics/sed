<script setup lang="ts">
import { Marker, MarkerContent } from '@/components/ui/marker';
import UserInfo from '@/components/UserInfo.vue';
import type { UserRole } from '@/types'

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

const rubricList = ['a', 'b', 'c']
const teamList = ['T1-1','T1-2']
</script>

<template>
<!-- Current user -->
<Marker variant="separator" class="py-3 select-none">
  <MarkerContent>Current User</MarkerContent>
</Marker>
<UserInfo :user="currentUser" class="w-full max-w-md" :rubricList="rubricList" :teamList="teamList"/>

<!-- Other users -->
<Marker variant="separator" class="py-3 select-none">
  <MarkerContent>Other Users</MarkerContent>
</Marker>
<div class="flex flex-row flex-wrap">
  <UserInfo v-for="user in otherUsers" :key="user.uid" :user="user" class="w-full max-w-md" :rubricList="rubricList" :teamList="teamList"/>
</div>

</template>
