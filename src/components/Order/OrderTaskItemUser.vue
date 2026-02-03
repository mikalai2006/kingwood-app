<script setup lang="ts">
import { useTaskStatusStore, useTaskWorkerStore, useUserStore } from "@/store";
import { computed } from "vue";
import UserListItem from "../User/UserListItem.vue";

const props = defineProps<{
  userId: string;
  taskWorkerId: string;
}>();

const taskWorkerStore = useTaskWorkerStore();
const userStore = useUserStore();
const taskStatusStore = useTaskStatusStore();

const worker = computed(() =>
  userStore.items.find((x) => x.id == props.userId)
);
const taskWorker = computed(() =>
  taskWorkerStore.items.find((x) => x.id == props.taskWorkerId)
);
const taskStatus = computed(() =>
  taskStatusStore.items.find((x) => x.status == taskWorker.value?.status)
);
</script>
<template>
  <div
    class="absolute -left-[25px] h-[1px] w-6 top-[30px]"
    :style="{
      background: taskStatus?.color,
    }"
  ></div>
  <div
    class="absolute -left-[26px] top-[28px] h-1.5 w-1.5 rounded-full"
    :style="{
      background: taskStatus?.color,
    }"
  ></div>
  <UserListItem v-if="worker" :user-id="worker.id">
    <template #description>
      <slot name="description"></slot>
      <!-- c {{ dayjs(item.from).format(dateFormat) }} -->
      <!-- ->
          {{ dayjs(item.to).format(dateFormat) }} -->
    </template>
  </UserListItem>
</template>
