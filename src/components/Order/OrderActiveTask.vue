<script setup lang="ts">
import { computed } from "vue";

import {
  usePostStore,
  useTaskStatusStore,
  useTaskStore,
  useTaskWorkerStore,
  useUserStore,
} from "@/store";
import VIcon from "../UI/VIcon.vue";
import { getShortFIO, invertColor } from "@/utils/utils";

const props = defineProps<{
  orderId: string;
}>();

const userStore = useUserStore();
const taskStore = useTaskStore();
const taskWorkerStore = useTaskWorkerStore();
const postStore = usePostStore();
const taskStatusStore = useTaskStatusStore();

const tasks = computed(() => {
  return taskStore.items.filter((x) => x.orderId === props.orderId);
});

const activeTasks = computed(() => {
  return tasks.value
    .filter((x) => x.active && x.orderId === props.orderId)
    .map((x) => {
      // const operation = operationStore.items.find(
      //   (y) => y.id === x?.operationId
      // );
      const taskWorkers = taskWorkerStore.items
        .filter((z) => z.taskId === x.id)
        .map((w) => {
          const user = userStore.items.find((u) => u.id === w.workerId);
          const taskWorkerStatus = taskStatusStore.items.find(
            (z) => z.id === w.statusId
          );
          return {
            ...w,
            user,
            post: postStore.items.find((post) => post.id === user?.postId),
            taskWorkerStatus,
          };
        });
      return {
        ...x,
        taskWorkers,
        // operation,
      };
    });
});

// const operation = computed(() => {
//   return operationStore.items.find(
//     (x) => x.id === activeTasks.value?.operationId
//   );
// });

// const workers = computed(() =>
//   activeTasks.value?.workerId
//     ? userStore.items.filter((x) => activeTasks.value?.workerId.includes(x.id))
//     : []
// );
</script>
<template>
  <div class="flex flex-col flex-wrap gap-1 items-center">
    <template v-for="item in activeTasks">
      <a-tag
        v-for="taskWorker in item.taskWorkers"
        :bordered="false"
        class="flex items-center gap-1 leading-3 py-1 w-full"
        :style="{
          background: taskWorker.taskWorkerStatus?.color,
          color: invertColor(taskWorker.taskWorkerStatus?.color, true),
        }"
      >
        <VIcon
          v-if="taskWorker.taskWorkerStatus?.icon"
          :path="taskWorker.taskWorkerStatus.icon"
          :class="['text-xl', taskWorker.taskWorkerStatus?.animate]"
        />
        <div class="">
          <p class="text-sm">
            {{ item.name }}: {{ taskWorker.taskWorkerStatus?.name }}
          </p>
          <p>
            {{ getShortFIO(taskWorker.user?.name) }}
          </p>
        </div>
      </a-tag>
      <!-- <div
        v-if="item.status === 'process'"
        class="shrink-0 rounded-full p-.5 px-1.5 relative flex items-center justify-center gap-1"
        :style="{ backgroundColor: item.operation?.color }"
      >
        <VIcon :path="iSpinThree" class="text-white text-md animate-spin2" />
        <span class="text-white">
          {{ item.operation?.name }}
        </span>
      </div> -->
    </template>
    <!-- <div>
      <div class="font-bold">
        {{ operation?.name }}
      </div>
      <div>
        {{ workers.map((x) => x.name).join(", ") }}
      </div>
    </div> -->
  </div>
</template>

<style scoped></style>
