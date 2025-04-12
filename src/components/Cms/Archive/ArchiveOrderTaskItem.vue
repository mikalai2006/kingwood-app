<script setup lang="ts">
import { ITask } from "@/api/task/types";
import {
  useAuthStore,
  useOrderStore,
  usePostStore,
  useTaskStatusStore,
  useUserStore,
} from "@/store";
import { computed } from "vue";
import VIcon from "@/components/UI/VIcon.vue";
import { invertColor } from "@/utils/utils";
import { useI18n } from "vue-i18n";
import dayjs from "dayjs";
import { dateFormat } from "@/utils/date";
import ArchiveOrderTaskUser from "./ArchiveOrderTaskUser.vue";
import ArchiveTaskWorkerStatusTag from "./ArchiveTaskWorkerStatusTag.vue";

const props = defineProps<{ taskId: string; task: ITask }>();
const emit = defineEmits(["onEditTask"]);

const authStore = useAuthStore();
const userStore = useUserStore();
const orderStore = useOrderStore();
const postStore = usePostStore();
const taskStatusStore = useTaskStatusStore();

const taskWorkers = computed(() => {
  return props.task.workers;
});

const taskStatus = computed(() =>
  taskStatusStore.items.find((x) => x.id === props.task?.statusId)
);

const statuses = computed(() => [
  ...new Set(taskWorkers.value.map((y) => y.statusId)),
]);

// const operation = computed(() =>
//   operationStore.items.find((x) => x.id === props.tasks[0].operationId)
// );

// const tasksPopulate = computed(() =>
//   props.tasks.map((x) => {
//     const worker = userStore.items.find((y) => y.id === x.workerId);
//     return {
//       ...x,
//       worker,
//     };
//   })
// );
const { t } = useI18n();

const order = computed(() => {
  return orderStore.items.find((x) => x.id === props.task?.orderId);
});
</script>

<template>
  <div class="flex flex-col items-center">
    <div
      :class="['rounded-full p-2 relative flex items-center justify-center']"
      :style="{
        background: taskStatus?.color,
        color: invertColor(taskStatus?.color, true),
      }"
    >
      <VIcon
        v-if="taskStatus?.icon"
        :path="taskStatus?.icon"
        :class="['text-sm', taskStatus.animate]"
      />
    </div>
    <div
      :class="['mt-2 -mb-2 w-[2px] flex-auto']"
      :style="{
        // background: taskWorkers[0]?.post?.color,
        // color: invertColor(taskWorkers[0]?.post?.color, true),
        background: taskStatus?.color,
        // color: invertColor(taskStatus?.color, true),
      }"
    ></div>
  </div>

  <div class="pl-2 flex-auto group pb-2">
    <div class="flex flex-row items-center gap-1">
      <div class="font-bold pb-2 text-lg">
        {{ task?.name }}
      </div>
      <div class="flex flex-row items-center gap-2">
        <!-- <a-tooltip v-if="authStore.roles?.includes('taskWorker-patch')">
          <template #title>
            {{ $t("button.editTask") }}
          </template>
          <a-button
            size="small"
            class="hidden group-hover:block"
            @click="$emit('onEditTask', task)"
          >
            <div class="flex gap-1 items-center">
              <VIcon :path="iPen" />
            </div>
          </a-button>
        </a-tooltip> -->
      </div>
    </div>

    <div
      v-for="(item, key) in taskWorkers"
      class="relative bg-white dark:bg-g-800 mb-1 flex flex-row items-center gap-4 py-1 px-4 border-g-200 dark:border-g-700 rounded-lg"
    >
      <div
        class="absolute -left-[25px] h-[1px] w-6 bg-g-200 dark:bg-g-700"
        :style="{
          // background: taskStatus?.color,
        }"
      ></div>
      <div
        class="absolute -left-[26px] h-1.5 w-1.5 rounded-full"
        :style="{
          background: taskStatus?.color,
        }"
      ></div>
      <ArchiveOrderTaskUser v-if="item.worker" :user="item.worker">
        <template #description>
          <!-- c {{ dayjs(item.from).format(dateFormat) }} -->
          <!-- ->
          {{ dayjs(item.to).format(dateFormat) }} -->
        </template>
      </ArchiveOrderTaskUser>
      <div class="text-g-300 dark:text-g-500 self-start">
        {{ $t("from") }} {{ dayjs(item.from).format(dateFormat) }}
        <!-- <TimePretty
          :time="getObjectTime(dayjs(new Date()).diff(item.from))"
          short
        /> -->
      </div>
      <!-- <div class="flex flex-row items-center gap-1">
        <div>
          <VImg
            :image="item.worker?.images?.[0]"
            class="w-8 h-8 rounded-full"
          />
        </div>
        <div class="text-s-500 dark:text-s-300 flex-auto">
          {{ getShortFIO(item.worker?.name) }}
        </div>
      </div> -->
      <div class="flex-auto">
        <div
          class="self-center pl-4 hidden group-hover:flex flex-row gap-2"
        ></div>
      </div>
      <div>
        <ArchiveTaskWorkerStatusTag :task-worker="item" />
      </div>
    </div>

    <div
      v-if="
        authStore.roles?.includes('taskWorker-create') &&
        task?.status != 'finish'
      "
      class="flex flex-row items-center gap-4 py-1"
    >
      <div class="flex flex-row flex-auto items-center gap-1"></div>
    </div>
  </div>
</template>
