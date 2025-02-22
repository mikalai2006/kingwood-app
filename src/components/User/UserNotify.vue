<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useAuthStore, useNotifyStore } from "@/store";
import { useRouter } from "vue-router";
import VIcon from "../UI/VIcon.vue";
import { iBell } from "@/utils/icons";

const authStore = useAuthStore();
const notifyStore = useNotifyStore();

const router = useRouter();

const newNotify = computed(() =>
  notifyStore.items.filter(
    (x) => x.userTo === authStore?.iam?.id && x.status === 0
  )
);

onMounted(() => {
  notifyStore.find({
    userTo: authStore.iam?.id ? [authStore.iam.id] : undefined,
    status: 0,
  });
});
</script>
<template>
  <div
    v-if="true"
    class="flex flex-row items-center gap-2 cursor-pointer"
    @click="
      () => {
        router.push({ name: 'notify' });
      }
    "
  >
    <div class="relative">
      <VIcon :path="iBell" class="text-2xl" />
      <div
        v-if="newNotify.length"
        class="text-white absolute -top-3 -right-3 px-1.5 py-0.5 leading-4 rounded-full bg-green-500 border-[3px] border-s-900 dark:border-g-950"
      >
        {{ newNotify.length }}
      </div>
    </div>
  </div>
</template>
