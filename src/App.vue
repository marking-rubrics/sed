<script setup lang="ts">
import { Button } from './components/ui/button';

import { useRouter, useRoute } from 'vue-router';
const currentRoute = useRoute()
const router = useRouter();
const routerList = router.getRoutes();

const user = "user";
</script>

<template>
  <div class="flex flex-row px-5 py-3 border-b border-border gap-2 items-center">
    <div class="font-black">SED</div>
    <Button as-child variant="ghost" v-for="route in routerList" :key="route.name"
      :class="currentRoute.name == route.name ? 'bg-teal-600 hover:bg-teal-100 text-white hover:text-primary' : ''"
      class="sm:visible md:hidden"
    ><RouterLink :to="route.path">{{ route.name }}</RouterLink></Button>
    <div class="flex-1"></div>
    <div>Logged in as <span class="font-bold">{{ user }}</span></div>
    <Button variant="destructive">Log out</Button>
  </div>
  <div class="w-dvw flex flex-row items-center justify-center h-dvh">
    <RouterView />
  </div>
</template>

<style scoped></style>
