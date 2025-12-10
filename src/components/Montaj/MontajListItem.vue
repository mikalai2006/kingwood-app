<script setup lang="ts">
import { ITaskWorker } from "@/api/task_worker/types";
import { useTaskWorkerStore } from "@/store";
import { getShortFIO, invertColor } from "@/utils/utils";
import { computed } from "vue";

const props = defineProps<{
  taskMW: {
    item: ITaskWorker;
    stat: {
      startCol: number;
      length: number;
    };
  };
  objectId: string;
  sizeColumn: number;
  index: number;
}>();

const emit = defineEmits(["onEditTaskWorker"]);

const taskWorkerStore = useTaskWorkerStore();

const allTaskWorker = computed(() =>
  taskWorkerStore.items.filter(
    (x) =>
      x.workerId == props.taskMW.item.workerId &&
      x.orderId === props.taskMW.item.orderId &&
      x.operationId === props.taskMW.item.operationId // x.objectId == props.objectId
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

const activeStyle = computed(() => {
  let _style = {
    background: "transparent",
    color: "#999",
    left: "0px",
    top: "0px",
    width: "0px",
  };

  // if (activeTaskWorker.value) {
  //   _style = {
  //     background: activeTaskWorker.value.taskStatus?.color,
  //     color: invertColor(activeTaskWorker.value.taskStatus?.color, true),
  //     left: `${props.taskMW.stat.startCol * props.sizeColumn + 3}px`,
  //     top: `${props.index * 35 + 3}px`,
  //     width: `${props.taskMW.stat.length * props.sizeColumn - 5}px`,
  //   };
  // }
  return _style;
});
</script>

<template>
  <div class="absolute z-50 rounded-sm" :style="activeStyle">
    <a-tooltip>
      <template #title>
        {{ $t("button.editTask") }}
      </template>
      <div
        class="flex gap-1 p-1 cursor-pointer text-xs"
        @click="emit('onEditTaskWorker', taskMW.item, objectId)"
      >
        <TaskWorkerStatusTagDot :task-worker-id="activeTaskWorker?.id" />
        <!-- [{{ taskMW.stat.length }} / {{ activeTaskWorker?.taskStatus?.id }}] -->
        <!-- {{ getShortFIO(activeTaskWorker?.worker?.name) }}
        - №{{ activeTaskWorker?.order.number }}
        {{ activeTaskWorker?.order.name }} -->
      </div>
    </a-tooltip>
  </div>
</template>
