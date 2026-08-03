<script setup lang="ts">
import type { RubricLookup, User } from "@/types";
import { ref, watch, computed } from "vue";
import { Button } from "@/components/ui/button";
import { PhX, PhCheck, PhTrash, PhArrowCounterClockwise } from "@phosphor-icons/vue";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardAction } from "@/components/ui/card";
import TagsInputWithListbox from "./TagsInputWithListbox.vue";
import type { Rubric, Team } from "@/types";
import { useUserStore } from "@/stores/users";
const userStore = useUserStore()

const props = defineProps<{
  user: User,
  rubrics: RubricLookup[],
  teams: Team[],
}>()
const userRoles = ['admin', 'lecturer', 'assessor']
const displayName = ref('')
const roles = ref<string[]>([])
const rubricIds = ref<string[]>([])
const teamIds = ref<string[]>([])
const isCurrentUser = computed(() => props.user.id === userStore.currentUser?.id)

watch(
  () => props.user,
  (newUser) => {
    if (!newUser) return
    displayName.value = newUser.displayName
    roles.value = [...newUser.roles]
    rubricIds.value = [...(newUser.rubricIds ?? [])]
    teamIds.value = [...(newUser.teamIds ?? [])]
  },
  { immediate: true, deep: true }
)

const confirmEdit = () => {
  emits('update', {
    ...props.user,
    displayName: displayName.value,
    roles: [...roles.value],
    rubricIds: [...rubricIds.value],
    teamIds: [...teamIds.value]
  })
}
const resetEdit = () => {
  displayName.value = props.user.displayName
  roles.value = [...props.user.roles]
  rubricIds.value = [...(props.user.rubricIds ?? [])]
  teamIds.value = [...(props.user.teamIds ?? [])]
}
const deleteUser = () => {
  emits('delete', props.user)
}

const emits = defineEmits<{
  (e: 'close'): void,
  (e: 'update', user: User): void
  (e: 'delete', user: User): void
}>()
const closeEditor = () => {
  emits('close')
}

</script>

<template>
<Card>
  <CardHeader class="">
    <CardTitle class="text-xl font-black">User Editor</CardTitle>
    <CardAction>
      <Button variant="ghost" @click="closeEditor"><PhX/></Button>
    </CardAction>
  </CardHeader>

  <CardContent>
    <div class="flex flex-col">
      <!-- {{ user }} -->
      <FieldSet>
        <FieldGroup>
          <Field>
            <FieldLabel>Username</FieldLabel>
            <Input disabled :value="props.user.email.replace('@sed-marking.com', '')"></Input>
          </Field>
          <Field>
            <FieldLabel>Display Name</FieldLabel>
            <Input v-model="displayName"></Input>
          </Field>
          <Field>
            <FieldLabel>Role</FieldLabel>
            <TagsInputWithListbox
              v-model="roles" :options="userRoles.map(role => ({ value: role, label: role }))"></TagsInputWithListbox>
          </Field>
          <Field>
            <FieldLabel>Rubrics</FieldLabel>
            <TagsInputWithListbox
              v-model="rubricIds" :options="rubrics.map(r => ({ value: r.id, label: r.title }))"></TagsInputWithListbox>
          </Field>
          <Field>
            <FieldLabel>Teams</FieldLabel>
            <TagsInputWithListbox v-model="teamIds" :options="teams.map(t => ({ value: t.id, label: t.name }))"></TagsInputWithListbox>
          </Field>
        </FieldGroup>
      </FieldSet>
    </div>
  </CardContent>

  <CardFooter class="flex flex-row gap-1 justify-end">
    <Button variant="secondary" @click="resetEdit"><PhArrowCounterClockwise/>Reset</Button>
    <Button variant="default" @click="confirmEdit"><PhCheck/>Confirm</Button>
    <Button v-if="!isCurrentUser" variant="destructive" @click="deleteUser" class="ms-auto"><PhTrash/>Delete</Button>
  </CardFooter>
</Card>
</template>
