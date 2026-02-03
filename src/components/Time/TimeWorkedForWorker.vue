<script setup lang="ts">
import { ITask } from "@/api/task/types";
import { useGeneralStore, useOrderStore, useTaskWorkerStore } from "@/store";
import { Colors } from "@/utils/colors";
import { iTimer } from "@/utils/icons";
import { computed } from "vue";

const props = defineProps<{
  taskWorkerId: string;
  maxMs: number;
  showProcent: boolean;
  showHours: boolean;
}>();

const orderStore = useOrderStore();
const generalStore = useGeneralStore();
const taskWorkerStore = useTaskWorkerStore();

const taskWorker = computed(() =>
  taskWorkerStore.items.find((x) => x.id == props.taskWorkerId)
);

const percentWorkedMsFocusTask = computed(() =>
  taskWorker.value && props.maxMs
    ? Math.round((taskWorker.value.workedMs * 100) / props.maxMs)
    : 0
);
</script>
<template>
  <!-- {{ taskWorker?.workedMs }}/ {{ maxMs }} -->
  <div
    class="flex flex-row gap-1 items-center text-xs"
    :class="'text-g-300 dark:text-g-400'"
  >
    <div>
      <VIcon :path="iTimer" />
    </div>
    <div class="flex-auto">
      <!-- <a-progress
        :percent="percentWorkedMsFocusTask"
        type="line"
        :status="
          task.status == 'process' ? 'active' : isFull ? 'exception' : 'normal'
        "
        :strokeWidth="6"
        :show-info="false"
        :stroke-color="
          isFull
            ? order?.priority
              ? generalStore.themeMode === 'dark'
                ? Colors.r[100]
                : Colors.r[900]
              : generalStore.themeMode === 'dark'
              ? Colors.r[400]
              : Colors.r[900]
            : order?.priority
            ? generalStore.themeMode === 'dark'
              ? Colors.r[300]
              : Colors.r[600]
            : generalStore.themeMode === 'dark'
            ? Colors.g[200]
            : Colors.g[500]
        "
      >
      </a-progress> -->
      <div class="w-32 rounded-md bg-black/15 h-1.5 overflow-hidden">
        <div
          class="relative h-full"
          :class="[
            taskWorker?.status == 'process' ? 'progress-active' : '',
            'bg-g-500 dark:bg-g-200',
          ]"
          :style="{ width: Math.min(percentWorkedMsFocusTask, 100) + '%' }"
        ></div>
      </div>
    </div>
    <div v-if="taskWorker">
      <template v-if="showProcent">
        {{ Math.min(percentWorkedMsFocusTask, 100) }}%
      </template>
      <template v-if="showHours">
        - {{ Math.round(taskWorker.workedMs / 3600000) }} ч.
      </template>
    </div>
  </div>
</template>
