<script setup lang="ts">
import type { User, UserRole } from "@/types";
import { ref, watch } from "vue";
import { Button } from "@/components/ui/button";
import { PhX, PhCheck, PhTrash, PhArrowCounterClockwise } from "@phosphor-icons/vue";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardAction } from "@/components/ui/card";
import TagsInputWithListbox from "./TagsInputWithListbox.vue";

const props = defineProps<{
  user: User,
  rubricList: { value: string; label: string }[],
  teamList: { value: string; label: string }[],
}>()
const displayName = ref('')
const role = ref('')
const rubricIds = ref<string[]>([])
const teamIds = ref<string[]>([])

watch(
  () => props.user,
  (newUser) => {
    if (!newUser) return
    displayName.value = newUser.displayName
    role.value = newUser.role
    rubricIds.value = [...(newUser.rubricIds ?? [])]
    teamIds.value = [...(newUser.teamIds ?? [])]
  },
  { immediate: true, deep: true }
)

const confirmEdit = () => {
  emits('update', {
    ...props.user,
    displayName: displayName.value,
    role: role.value as UserRole,
    rubricIds: [...rubricIds.value],
    teamIds: [...teamIds.value]
  })
}
const resetEdit = () => {
  displayName.value = props.user.displayName
  role.value = props.user.role
  rubricIds.value = props.user.rubricIds ?? []
  teamIds.value = props.user.teamIds ?? []
}
const deleteUser = () => {
  emits('delete')
}

const emits = defineEmits<{
  (e: 'close'): void,
  (e: 'update', user: User): void
  (e: 'delete'): void
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
      {{ user }}
      <FieldSet>
        <FieldGroup>
          <Field>
            <FieldLabel>Username</FieldLabel>
            <Input disabled :value="props.user.uid"></Input>
          </Field>
          <Field>
            <FieldLabel>Display Name</FieldLabel>
            <Input v-model="displayName"></Input>
          </Field>
          <Field>
            <FieldLabel>Role</FieldLabel>
            <Input v-model="role"></Input>
          </Field>
          <Field>
            <FieldLabel>Rubrics</FieldLabel>
            <TagsInputWithListbox
              v-model="rubricIds" :options="props.rubricList"></TagsInputWithListbox>
          </Field>
          <Field>
            <FieldLabel>Teams</FieldLabel>
            <TagsInputWithListbox v-model="teamIds" :options="props.teamList"></TagsInputWithListbox>
          </Field>
        </FieldGroup>
      </FieldSet>
    </div>
  </CardContent>

  <CardFooter class="flex flex-row justify-end">
    <Button variant="secondary" @click="resetEdit"><PhArrowCounterClockwise/>Reset</Button>
    <Button variant="default" @click="confirmEdit"><PhCheck/>Confirm</Button>
    <Button variant="destructive" @click="deleteUser" class="ms-auto"><PhTrash/>Delete</Button>
  </CardFooter>
</Card>
</template>
