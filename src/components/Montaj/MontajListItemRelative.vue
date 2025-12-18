<script setup lang="ts">
import { ITaskWorker } from "@/api/task_worker/types";
import {
  useGeneralStore,
  useOrderStore,
  useTaskStatusStore,
  useTaskWorkerStore,
} from "@/store";
import dayjs from "@/utils/dayjs";
import { getShortFIO, invertColor } from "@/utils/utils";
import { computed } from "vue";
import UserFIO from "../User/UserFIO.vue";
import { useSystem } from "@/composable/useSystem";

const props = defineProps<{
  taskMW: ITaskWorker;
  day: { dayString: string; day: string };
  objectId: string;
  index: number;
}>();

const emit = defineEmits(["onEditTaskWorker"]);

const generalStore = useGeneralStore();
const taskStatusStore = useTaskStatusStore();
const taskWorkerStore = useTaskWorkerStore();
const orderStore = useOrderStore();

const allTaskWorker = computed(() =>
  taskWorkerStore.items.filter(
    (x) =>
      x.workerId == props.taskMW.workerId &&
      x.objectId === props.taskMW.objectId &&
      x.operationId === props.taskMW.operationId && // x.objectId == props.objectId
      !["finish", "autofinish"].includes(x.status)
  )
);

const taskWorkerProcess = computed(() =>
  allTaskWorker.value.find((x) => x.status === "process")
);
const taskWorkerPause = computed(() =>
  allTaskWorker.value.find((x) => x.status === "pause")
);
const taskWorkerOther = computed(() =>
  allTaskWorker.value.find((x) => !["process", "pause"].includes(x.status))
);

const activeTaskWorker = computed(
  () =>
    taskWorkerProcess.value || taskWorkerPause.value || taskWorkerOther.value
);

const statusActiveTaskWorker = computed(() =>
  taskStatusStore.items.find((x) => x.id == activeTaskWorker.value?.statusId)
);

const activeOrder = computed(() =>
  orderStore.items.find((x) => x.id == activeTaskWorker.value?.orderId)
);

const isSameDay = computed(() => dayjs().isSame(props.day.day, "day"));

const activeStyle = computed(() => {
  let _style = {
    background: "transparent",
    color:
      generalStore.themeMode == "dark"
        ? isSameDay.value
          ? "#fff"
          : "#bbb"
        : isSameDay.value
        ? "#000"
        : "#555",
    // left: "0px",
    // top: "0px",
    // width: "0px",
  };

  if (
    activeTaskWorker.value &&
    statusActiveTaskWorker.value &&
    isSameDay.value &&
    ["process"].includes(statusActiveTaskWorker.value.status)
  ) {
    _style = {
      background: statusActiveTaskWorker.value?.color,
      color: invertColor(statusActiveTaskWorker.value?.color, true),
      // left: `${props.taskMW.stat.startCol * props.sizeColumn + 3}px`,
      // top: `${props.index * 35 + 3}px`,
      // width: `${props.taskMW.stat.length * props.sizeColumn - 5}px`,
    };
  }
  return _style;
});

const { isElectron } = useSystem();
</script>

<template>
  <div class="z-50 rounded-lg" :style="activeStyle">
    <div
      class="flex items-center gap-1 cursor-pointer"
      @click="isElectron ? emit('onEditTaskWorker', taskMW, objectId) : {}"
    >
      <div class="self-center">
        <TaskWorkerStatusTagDot
          v-if="isSameDay"
          :task-worker-id="activeTaskWorker?.id"
        />
      </div>
      <div v-if="activeTaskWorker" class="flex-auto flex flex-row items-center">
        <!-- [{{ taskMW.stat.length }} / {{ activeTaskWorker?.taskStatus?.id }}] -->
        <div
          class="flex-auto text-nowrap"
          :class="[{ 'text-xs': !isElectron }]"
        >
          <template v-if="isElectron">
            <template v-if="isElectron">
              <p type="text" class="p-1.5 leading-3">
                <UserFIO :user-id="activeTaskWorker.workerId" />
              </p>
            </template>
            <template v-else>
              <UserFIO :user-id="activeTaskWorker.workerId" />
            </template>
          </template>
          <div v-else class="leading-5">
            <UserFIO :user-id="activeTaskWorker.workerId" />
          </div>
        </div>

        <a-popover placement="left">
          <template #title> Текущий заказ </template>
          <template #content>
            <div
              v-if="
                activeTaskWorker &&
                activeOrder &&
                isSameDay &&
                ['process'].includes(activeTaskWorker.status)
              "
              class="leading-3"
            >
              №{{ activeOrder.number }}
              {{ activeOrder.name }}
            </div>
          </template>
          <span
            v-if="
              activeTaskWorker &&
              activeOrder &&
              isSameDay &&
              ['process'].includes(activeTaskWorker.status)
            "
            class="inline px-2 bg-black/20 rounded-r-md"
          >
            {{ activeOrder.number }}
            <!-- {{ activeTaskWorker?.order.name }} -->
          </span>
        </a-popover>
      </div>
    </div>
  </div>
</template>
