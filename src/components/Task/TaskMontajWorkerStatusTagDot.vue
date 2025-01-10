<script setup lang="ts">
import { computed } from "vue";

import {
  usePostStore,
  useTaskStatusStore,
  useTaskMontajWorkerStore,
  useUserStore,
} from "@/store";
import { invertColor } from "@/utils/utils";
import { iArrowClockWise, iPauseCircleFill } from "@/utils/icons";

const props = defineProps<{ taskWorkerId: string }>();

const taskMontajWorkerStore = useTaskMontajWorkerStore();
const postStore = usePostStore();
const userStore = useUserStore();
const taskStatusStore = useTaskStatusStore();

const taskWorker = computed(() =>
  taskMontajWorkerStore.items.find((x) => x.id === props.taskWorkerId)
);
const user = computed(() =>
  userStore.items.find((x) => x.id === taskWorker.value?.workerId)
);
const post = computed(() =>
  postStore.items.find((x) => x.id === user.value?.postId)
);
const taskWorkerStatus = computed(() =>
  taskStatusStore.items.find((x) => x.id === taskWorker.value?.statusId)
);

const styleTag = computed(() => {
  let result = {
    background: taskWorkerStatus.value?.color,
    color: invertColor(taskWorkerStatus.value?.color, true),
  };

  //   if (taskWorker.value?.statusId === "process") {
  //     result = Object.assign(
  //       {},
  //       {
  //         background: post.value?.color,
  //         color: invertColor(post.value?.color, true),
  //       }
  //     );
  //   }
  //   else if (taskWorker.value?.status === "finish") {
  //     result = Object.assign(
  //       {},
  //       {
  //         background: colors.green[500],
  //         color: invertColor(colors.green[200], true),
  //       }
  //     );
  //   }

  return result;
});
</script>
<template>
  <a-tooltip>
    <template #title>
      {{ taskWorkerStatus?.name }}
    </template>
    <div class="flex items-center p-1 rounded-full" :style="styleTag">
      <VIcon
        v-if="taskWorkerStatus?.icon"
        :path="taskWorkerStatus?.icon"
        :class="['text-md', taskWorkerStatus?.animate]"
      />
    </div>
  </a-tooltip>
</template>
