<script setup lang="ts">
import {
  useOrderStore,
  usePostStore,
  useTaskStatusStore,
  useTaskStore,
  useTaskWorkerStore,
  useUserStore,
} from "@/store";
import dayjs from "@/utils/dayjs";
import { invertColor } from "@/utils/utils";
import { computed } from "vue";

const props = defineProps<{ workerId: string }>();

const taskStore = useTaskStore();
const taskWorkerStore = useTaskWorkerStore();
const orderStore = useOrderStore();
const userStore = useUserStore();
const postStore = usePostStore();
const taskStatusStore = useTaskStatusStore();

const taskIds = computed(
  () =>
    taskWorkerStore.items
      .filter((y) =>
        dayjs(new Date())
          // .subtract(1, "day")
          .isBetween(dayjs(y.from), dayjs(y.to), "day", "[]")
      )
      .map((x) => {
        const task = taskStore.items.find((z) => z.id === x.taskId);
        const order = orderStore.items.find((y) => y.id === task?.orderId);
        const taskStatus = taskStatusStore.items.find(
          (s) => s.id === x.statusId
        );
        return {
          ...x,
          order,
          task,
          taskStatus,
        };
      })
      .filter(
        (x) =>
          x.workerId === props.workerId &&
          x.task &&
          !["finish", "autofinish"].includes(x.task.status)
      )
  // .map((x) => {
  //   const task = taskStore.items.find((z) => z.id === x.taskId);
  //   const order = orderStore.items.find((y) => y.id === task?.orderId);
  //   const taskStatus = taskStatusStore.items.find((s) => s.id === x.statusId);
  //   return {
  //     ...x,
  //     order,
  //     task,
  //     taskStatus,
  //   };
  // })
);

const user = computed(() =>
  userStore.items.find((x) => x.id === props.workerId)
);
const post = computed(() =>
  postStore.items.find((x) => x.id === user.value?.postId)
);
// const tasks = computed(() =>
//   taskStore.items
//     .filter((x) => x.workerId === props.workerId && x.status === "process")
//     .map((x) => {
//       const order = orderStore.items.find((y) => y.id === x.orderId);
//       return {
//         ...x,
//         order,
//       };
//     })
// );
</script>
<template>
  <div v-for="item in taskIds">
    <!-- {{ item.task?.name }} { item.order?.name }}) -->
    <a-tag
      class="flex items-center mb-1 text-sm"
      :bordered="false"
      :style="{
        background: item.taskStatus?.color,
        color: invertColor(item.taskStatus?.color, true),
      }"
    >
      <div class="flex flex-row items-center">
        <div>
          <VIcon
            v-if="item.taskStatus?.icon"
            :path="item.taskStatus?.icon"
            :class="['text-xl', item.taskStatus.animate]"
          />
        </div>
        <div class="leading-4 pl-1">
          №{{ item.order?.number }} - {{ item.order?.name }}
          <br />
          {{ item.task?.name }} | {{ item.task?.status }}
        </div>
      </div>
    </a-tag>
  </div>
</template>
