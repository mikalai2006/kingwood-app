<script setup lang="ts">
import { computed } from "vue";

import {
  useGeneralStore,
  useOperationStore,
  usePostStore,
  useTaskStatusStore,
  useTaskStore,
  useTaskWorkerStore,
  useUserStore,
} from "@/store";
import { getShortFIO, invertColor } from "@/utils/utils";
import TaskWorkerStatusTagDot from "../Task/TaskWorkerStatusTagDot.vue";
import { ITaskWorker } from "@/api/task_worker/types";
import { Colors } from "@/utils/colors";
import dayjs from "@/utils/dayjs";

const props = defineProps<{
  orderId: string;
  objectId: string;
  status: boolean;
}>();

const generalStore = useGeneralStore();
const userStore = useUserStore();
const taskStore = useTaskStore();
const taskWorkerStore = useTaskWorkerStore();
const postStore = usePostStore();
const taskStatusStore = useTaskStatusStore();
const operationStore = useOperationStore();

const operationsMontaj = computed(() =>
  operationStore.items.filter(
    (x) => x.name.toLowerCase().indexOf("монтаж") > -1
  )
);

const tasks = computed(() => {
  return taskStore.items
    .filter(
      (x) =>
        x.objectId === props.objectId &&
        operationsMontaj.value.map((y) => y.id).includes(x.operationId)
      // x.to week.value.startOf("week").utc().format(),
    )
    .map((z) => {
      const _taskWorkers = taskWorkerStore.items
        .filter(
          (y) =>
            y.taskId === z.id &&
            dayjs(new Date())
              // .subtract(1, "day")
              .isBetween(dayjs(y.from), dayjs(y.to), "day", "[]")
        )
        .map((u) => {
          const _user = userStore.items.find((us) => us.id === u.workerId);
          return {
            ...u,
            user: _user,
          };
        });
      return {
        ...z,
        workers: _taskWorkers,
      };
    });
});

const allWorkersInOrder = computed(() => {
  return tasks.value.reduce((ac, el) => {
    ac.push(...el.workers);
    return ac;
  }, [] as ITaskWorker[]);
});
const allWorkersInProcess = computed(() =>
  allWorkersInOrder.value.filter((x) => x.status !== "finish")
);
const allWorkers = computed(() =>
  allWorkersInProcess.value.length > 0
    ? allWorkersInProcess.value.slice(0, 1)
    : allWorkersInOrder.value.slice(0, 1)
);
</script>

<template>
  <div
    v-if="allWorkers.length"
    class="relative min-w-32 min-h-16 rounded-md"
    :class="[
      { 'bg-s-200 dark:bg-g-700': !status },
      { 'bg-green-500 dark:bg-green-700': status },
    ]"
  >
    <div
      class="absolute w-2 h-2 top-1 left-1/2 bg-white dark:bg-g-900 rounded-full z-10"
    ></div>
    <div class="p-2 pt-4">
      <!-- <pre>
      {{ JSON.stringify(operationsByGroup, null, 2) }}
    </pre> -->
      <a-tooltip
        v-for="worker in allWorkers"
        :key="worker.id"
        :color="
          status
            ? Colors.green[600]
            : generalStore.themeMode === 'dark'
            ? Colors.g[500]
            : Colors.s[100]
        "
      >
        <template #title>
          <div v-for="task in tasks" :key="task.id" class="mb-4">
            <div class="text-black dark:text-g-100">
              {{ task.name }}
            </div>
            <div
              v-for="item in task.workers"
              class="flex items-center gap-1 space-y-1"
            >
              <TaskWorkerStatusTagDot :task-worker-id="item.id" />
              <div
                class="text-sm text-nowrap"
                :class="status ? 'text-white' : 'text-black dark:text-g-100'"
              >
                {{ getShortFIO(item.user?.name) }}
              </div>
              <!-- <a-tag
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
        </a-tag> -->
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
            </div>
          </div>
        </template>
        <!-- <div>
        {{ task.name }}
      </div> -->
        <div class="flex items-center gap-1 space-y-1">
          <TaskWorkerStatusTagDot :task-worker-id="worker.id" />
          <div
            class="text-sm text-nowrap"
            :class="status ? 'text-white' : 'text-black dark:text-g-100'"
          >
            {{ getShortFIO(worker.worker?.name) }}
          </div>
          <!-- <a-tag
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
        </a-tag> -->
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
        </div>
        <div v-if="allWorkersInOrder.length - 1 > 0">
          +{{ allWorkersInOrder.length - 1 }}
          {{ $t("info.user", allWorkersInOrder.length - 1) }}
        </div>
      </a-tooltip>
      <!-- <div>
      <div class="font-bold">
        {{ operation?.name }}
      </div>
      <div>
        {{ workers.map((x) => x.name).join(", ") }}
      </div>
    </div> -->
    </div>
  </div>
</template>

<style scoped></style>
