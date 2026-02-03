<script setup lang="ts">
import { ITask } from "@/api/task/types";
import { useGeneralStore, useOrderStore } from "@/store";
import { Colors } from "@/utils/colors";
import { iTimer } from "@/utils/icons";
import { computed } from "vue";
import TimeProgress from "./TimeProgress.vue";

const props = defineProps<{
  task: ITask;
}>();

const orderStore = useOrderStore();
const generalStore = useGeneralStore();

const percentWorkedMsFocusTask = computed(() =>
  props.task.maxHours
    ? Math.round((props.task.workedMs * 100) / (props.task.maxHours * 3600000))
    : 0
);

const isFull = computed(() => {
  return Math.round(props.task.workedMs / 3600000) > props.task.maxHours;
});

const order = computed(() => {
  return orderStore.items.find((x) => x.id == props.task.orderId);
});
</script>
<template>
  <!-- :class="
      isFull
        ? order?.priority
          ? 'text-r-900 dark:text-r-100'
          : 'text-r-900 dark:text-r-300'
        : order?.priority
        ? 'text-r-900 dark:text-r-300'
        : 'text-g-800 dark:text-g-300'
    " -->
  <div class="flex flex-row gap-1 items-center text-xs">
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
      <!-- <div class="w-full rounded-md bg-black/30 h-1.5 overflow-hidden">
        <div
          class="relative h-full"
          :class="[
            task.status == 'process' ? 'progress-active' : '',
            isFull
              ? order?.priority
                ? 'bg-r-900 dark:bg-r-100'
                : 'bg-r-900 dark:bg-r-400'
              : order?.priority
              ? 'bg-r-600 dark:bg-r-300'
              : 'bg-g-500 dark:bg-g-200',
          ]"
          :style="{ width: Math.min(percentWorkedMsFocusTask, 100) + '%' }"
        ></div>
      </div> -->
      <TimeProgress
        :active="task.status == 'process'"
        :procent="percentWorkedMsFocusTask"
        :height="6"
      />
    </div>
    <!-- <div>{{ Math.min(percentWorkedMsFocusTask, 100) }}%</div> -->
  </div>
</template>

<style>
.progress-active:after {
  content: "";
  position: absolute;
  inset: 0;
  background-color: #ffffff;
  border-radius: inherit;
  opacity: 0;
  -webkit-animation-name: activeAnimation;
  animation-name: activeAnimation;
  -webkit-animation-duration: 2.4s;
  animation-duration: 2.4s;
  -webkit-animation-timing-function: var(--ant-motion-ease-out-quint);
  animation-timing-function: var(--ant-motion-ease-out-quint);
  -webkit-animation-iteration-count: infinite;
  animation-iteration-count: infinite;
}
@keyframes activeAnimation {
  0% {
    transform: translatex(-100%) scalex(0);
    opacity: 0.1;
  }

  20% {
    transform: translatex(-100%) scalex(0);
    opacity: 0.5;
  }

  to {
    transform: translatex(0) scalex(1);
    opacity: 0;
  }
}
</style>
