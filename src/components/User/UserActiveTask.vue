<script setup lang="ts">
import { computed } from "vue";

import {
  useObjectStore,
  useOrderStore,
  useTaskStatusStore,
  useTaskStore,
  useTaskWorkerStore,
  useWorkHistoryStore,
} from "@/store";
import VIcon from "../UI/VIcon.vue";
import { getShortFIO, invertColor } from "@/utils/utils";

const props = defineProps<{
  userId: string;
}>();

const taskStore = useTaskStore();
const taskWorkerStore = useTaskWorkerStore();
const orderStore = useOrderStore();
const objectStore = useObjectStore();
const taskStatusStore = useTaskStatusStore();
const workHistoryStore = useWorkHistoryStore();

const activeWorkHistory = computed(() =>
  workHistoryStore.items.find(
    (x) => x.workerId === props.userId && x.status == 0
  )
);

const activeObject = computed(() => {
  return objectStore.items.find(
    (x) => x.id == activeWorkHistory.value?.objectId
  );
});

const activeTask = computed(() => {
  return taskStore.items.find((x) => x.id == activeWorkHistory.value?.taskId);
});

const activeTaskWorker = computed(() =>
  taskWorkerStore.items.find(
    (x) => x.id == activeWorkHistory.value?.taskWorkerId
  )
);

const taskStatus = computed(() =>
  taskStatusStore.items.find((x) => x.id == activeTaskWorker.value?.statusId)
);

const order = computed(() =>
  orderStore.items.find((x) => x.id == activeWorkHistory.value?.orderId)
);

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
  <a-tag
    v-if="activeWorkHistory"
    :bordered="false"
    class="flex items-center gap-1 leading-3 py-1"
    :style="{
      background: taskStatus?.color,
      color: taskStatus ? invertColor(taskStatus?.color, true) : '',
    }"
  >
    <VIcon
      v-if="taskStatus?.icon"
      :path="taskStatus.icon"
      :class="['text-xl', taskStatus?.animate]"
    />
    <div class="w-48">
      <p class="text-sm">
        {{ activeObject?.name }}
      </p>
      <p class="text-sm truncate">
        {{ order?.number ? "№" + order?.number + " - " : "" }}
        {{ order?.name }}
      </p>
      <p v-if="taskStatus" class="text-sm truncate">
        {{ activeTask?.name }}
        <!-- : {{ taskStatus?.name }} -->
      </p>
      <!-- <p>
            {{ getShortFIO(activeTaskWorker?.user?.name) }}
          </p> -->
    </div>
  </a-tag>
  <a-tag :bordered="false" v-else>
    {{ $t("table.user.isWork0") }}
  </a-tag>
</template>
