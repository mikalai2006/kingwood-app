<script setup lang="ts">
import {
  useAuthStore,
  useOrderStore,
  usePostStore,
  useTaskStatusStore,
  useTaskStore,
  useTaskWorkerStore,
  useUserStore,
} from "@/store";
import { iPen, iTrashFill } from "@/utils/icons";
import { computed } from "vue";
import VIcon from "../UI/VIcon.vue";
import TaskWorkerStatusTag from "../Task/TaskWorkerStatusTag.vue";
import dayjs from "dayjs";
import { dateFormat } from "@/utils/date";
import OrderTaskItemUser from "./OrderTaskItemUser.vue";
import TimeWorkedForWorker from "../Time/TimeWorkedForWorker.vue";

const props = defineProps<{
  maxWorkedMs: number;
  taskId: string;
  taskWorkerId: string;
}>();
const emit = defineEmits(["onEditTaskWorker", "onDeleteTaskWorker"]);

const authStore = useAuthStore();
const userStore = useUserStore();
const orderStore = useOrderStore();
const taskStore = useTaskStore();
const taskWorkerStore = useTaskWorkerStore();
const postStore = usePostStore();
const taskStatusStore = useTaskStatusStore();

const task = computed(() => taskStore.items.find((x) => x.id === props.taskId));

const order = computed(() => {
  return orderStore.items.find((x) => x.id === task.value?.orderId);
});

const taskWorker = computed(() => {
  return taskWorkerStore.items.find((x) => x.id == props.taskWorkerId);
});

const taskStatus = computed(() =>
  taskStatusStore.items.find((x) => x.status == taskWorker.value?.status)
);

const percentWorkedMs = computed(() =>
  task.value?.maxHours
    ? Math.round((task.value.workedMs * 100) / (task.value.maxHours * 3600000))
    : 0
);
</script>

<template>
  <!-- bg-white dark:bg-g-800  -->
  <div
    v-if="taskWorker"
    class="group relative mb-1 flex flex-row items-center gap-4 py-1 px-4 border-g-200 dark:border-g-700 rounded-lg bg-white dark:bg-g-800"
  >
    <!-- :style="{
        background: taskStatus?.color + '50',
        color: invertColor(taskStatus?.color, true),
      }" -->
    <div>
      <OrderTaskItemUser
        v-if="taskWorker"
        :user-id="taskWorker.workerId"
        :task-worker-id="taskWorkerId"
      >
        <template #description>
          <div v-if="task && task.maxHours">
            <TimeWorkedForWorker
              :task-worker-id="taskWorkerId"
              :max-ms="task.maxHours * 3600000"
              :showProcent="false"
              :showHours="true"
            />
          </div>
        </template>
      </OrderTaskItemUser>
    </div>
    <div
      :class="[
        ' self-start whitespace-nowrap ',
        !dayjs().isBetween(
          dayjs(taskWorker.from),
          dayjs(taskWorker.to),
          'day',
          '[]'
        ) && !['finish', 'autofinish'].includes(taskWorker.status)
          ? 'px-1 rounded-md bg-yellow-400 dark:bg-yellow-500 text-black'
          : 'text-g-300 dark:text-g-500',
      ]"
    >
      {{ $t("from") }} {{ dayjs(taskWorker.from).format(dateFormat) }}
      <!-- {{ $t("to") }} {{ dayjs(taskWorker.to).format(dateFormat) }} -->
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
      <div class="self-center pl-4 hidden group-hover:flex flex-row gap-2">
        <a-tooltip
          v-if="
            authStore.roles?.includes('taskWorker-patch') &&
            order?.status != 200
          "
        >
          <template #title>
            {{ $t("button.patchTaskWorker") }}
          </template>
          <a-button size="small" @click="$emit('onEditTaskWorker', taskWorker)">
            <div class="flex gap-1 items-center">
              <VIcon :path="iPen" class="text-xs" />
              <!-- {{ $t("button.edit") }} -->
            </div>
          </a-button>
        </a-tooltip>

        <a-tooltip
          v-if="
            authStore.roles?.includes('taskWorker-delete') &&
            taskWorker.status === 'wait' &&
            order?.status != 200
          "
        >
          <template #title>
            {{ $t("button.deleteTaskWorker") }}
          </template>
          <a-button
            size="small"
            danger
            class="hidden group-hover:block"
            @click="$emit('onDeleteTaskWorker', taskWorker)"
          >
            <div class="flex gap-1 items-center">
              <VIcon :path="iTrashFill" />
            </div>
          </a-button>
        </a-tooltip>
        <!-- <a-popconfirm
          v-if="authStore.roles?.includes('taskWorker-delete')"
          :cancelText="$t('button.cancel')"
          :okText="$t('button.delete')"
          :okButtonProps="{
            size: 'small',
            type: 'primary',
            danger: true,
          }"
          @confirm="onDeleteTaskWorker(item as ITaskWorker)"
        >
          <template #title>
            <div class="w-52">
              {{
                replaceSubstringByArray($t("message.removeTaskWorker"), [
                  item.worker?.name,
                  order?.number,
                  order?.name,
                ])
              }}
            </div>
          </template>
          <template #icon>
            <VIcon :path="iWraningTriangle" class="text-2xl text-red-500" />
          </template>
          <a-tooltip>
            <template #title>
              {{ $t("button.deleteTaskWorker") }}
            </template>
            <a-button danger size="small">
              <VIcon :path="iTrashFill" />
            </a-button>
          </a-tooltip>
        </a-popconfirm> -->
      </div>
    </div>
    <div>
      <TaskWorkerStatusTag :task-worker-id="taskWorker.id" />
    </div>
  </div>
</template>
