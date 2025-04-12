<script setup lang="ts">
import { computed } from "vue";

import { usePostStore, useTaskStatusStore, useUserStore } from "@/store";
import { invertColor } from "@/utils/utils";
import { ITaskWorker } from "@/api/task_worker/types";

const props = defineProps<{ taskWorker: ITaskWorker }>();

const postStore = usePostStore();
const userStore = useUserStore();
const taskStatusStore = useTaskStatusStore();

const user = computed(() =>
  userStore.items.find((x) => x.id === props.taskWorker?.workerId)
);
const post = computed(() =>
  postStore.items.find((x) => x.id === user.value?.postId)
);
const taskWorkerStatus = computed(() =>
  taskStatusStore.items.find((x) => x.id === props.taskWorker?.statusId)
);

const styleTag = computed(() => {
  let result = {
    background: taskWorkerStatus.value?.color,
    color: invertColor(taskWorkerStatus.value?.color, true),
  };

  return result;
});
</script>

<template>
  <a-tag :bordered="false" class="flex items-center" :style="styleTag">
    <VIcon
      v-if="taskWorkerStatus?.icon"
      :path="taskWorkerStatus?.icon"
      :class="['text-lg', taskWorkerStatus?.animate]"
    />
    <p class="pl-1 text-sm">
      {{ taskWorkerStatus?.name }}
    </p>
  </a-tag>
</template>
