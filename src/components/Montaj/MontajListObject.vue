<script setup lang="ts">
import { IObject } from "@/api/object/types";
import { useObjectStore, useTaskWorkerStore } from "@/store";
import { Colors } from "@/utils/colors";
import { getShortFIO, invertColor } from "@/utils/utils";
import { computed } from "vue";

const props = defineProps<{
  objectId: string | number;
  workerId: string;
  index: number;
}>();

const emit = defineEmits(["onEditTaskWorker"]);

const objectStore = useObjectStore();
const currentObject = computed(() =>
  objectStore.items.find((x) => x.id == props.objectId)
);
// const taskWorkerStore = useTaskWorkerStore();

// const allTaskWorker = computed(() =>
//   taskWorkerStore.items.filter(
//     (x) =>
//       x.workerId == props.workerId &&
//       x.orderId === props.object.item.orderId &&
//       x.operationId === props.taskMW.item.operationId // x.objectId == props.objectId
//   )
// );

// const taskWorkerProcess = computed(() =>
//   allTaskWorker.value.find((x) => x.status === "process")
// );
// const taskWorkerPause = computed(() =>
//   allTaskWorker.value.find((x) => x.status === "pause")
// );
// const taskWorkerOther = computed(() =>
//   allTaskWorker.value.find((x) => !["process", "pause"].includes(x.status))
// );

// const activeTaskWorker = computed(
//   () => taskWorkerProcess.value || taskWorkerPause.value || taskWorkerOther.value
// );

const activeStyle = computed(() => {
  let _style = {
    background: "transparent",
    color: "#999",
    left: "0px",
    top: "0px",
    width: "0px",
  };

  // if (activeTaskWorker.value) {
  // _style = {
  //   background: Colors.s[500], //activeTaskWorker.value.taskStatus?.color,
  //   color: "white", //invertColor(activeTaskWorker.value.taskStatus?.color, true),
  //   left: `${currentObject.value.stat.startCol * props.sizeColumn + 3}px`,
  //   top: `${props.index * 35 + 3}px`,
  //   width: `${props.object.stat.length * props.sizeColumn - 5}px`,
  // };
  // }
  return _style;
});
</script>

<template>
  <div class="z-50 rounded-sm">
    <a-tooltip>
      <template #title>
        {{ $t("button.editTask") }}
      </template>
      <div class="p-1 cursor-pointer text-sm">
        <!-- @click="emit('onEditTaskWorker', object.item, objectId)" -->
        <!-- <TaskWorkerStatusTagDot :task-worker-id="activeTaskWorker?.id" />
        {{ getShortFIO(activeTaskWorker?.worker?.name) }}
        - №{{ activeTaskWorker?.order.number }}
        {{ activeTaskWorker?.order.name }} -->
        {{ currentObject?.name }}
        <br />
        <!-- <div class="h-12">Active task</div> -->
      </div>
    </a-tooltip>
  </div>
</template>
