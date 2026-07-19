<script setup lang="ts">
import { PhSignOut } from '@phosphor-icons/vue';
import { Button } from './components/ui/button';

import { useRouter, useRoute } from 'vue-router';
const currentRoute = useRoute()
const router = useRouter();
const routerList = router.getRoutes();

const user = "user";
</script>

<template>
  <div class="flex flex-row px-5 py-3 border-b border-border gap-2 items-center flex-wrap">
    <div class="font-black select-none">SED</div>
    <Button as-child variant="ghost" v-for="route in routerList" :key="route.name"
      :class="currentRoute.name == route.name ? 'bg-teal-600 hover:bg-teal-100 text-white hover:text-primary' : ''"
      :title="route.name"
    ><RouterLink :to="route.path"><component :is="route.meta.icon"></component><span class="hidden md:flex">{{ route.name }}</span></RouterLink></Button>
    <div class="flex flex-row gap-1 items-center ms-auto select-none">
      <div class="text-xs flex flex-row items-center"><span class="hidden md:flex">Logged in as &nbsp;</span><span class="font-bold">{{ user }}</span></div>
      <Button variant="destructive" title="Log out"><PhSignOut/></Button>
    </div>
  </div>
  <div class="flex flex-col px-5 pt-3 pb-10">
    <div class="text-2xl font-black select-none">{{ currentRoute.name }}</div>
    <RouterView />
  </div>
</template>

<style scoped></style>
