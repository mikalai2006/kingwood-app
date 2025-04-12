<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useGeneralStore, useOperationStore, useUserStore } from "@/store";
import { ITask } from "@/api/task/types";
import ArchiveOrderTaskItem from "./ArchiveOrderTaskItem.vue";

const props = defineProps<{ orderId: string; tasks: ITask[] }>();
const emit = defineEmits(["onEditTask"]);

const operationStore = useOperationStore();
const userStore = useUserStore();
const generalStore = useGeneralStore();

const tasksByOrder = computed<ITask[]>({
  get() {
    return props.tasks
      .filter((x) => x.orderId === props.orderId && x.statusId !== "finish")
      .sort((a, b) => a.sortOrder - b.sortOrder);
  },
  set(value) {},
});
const taskNotCompleted = computed(() =>
  props.tasks.filter(
    (x) => x.orderId === props.orderId && x.statusId !== "finish"
  )
);
const tasksCompleted = computed(() =>
  props.tasks.filter(
    (x) => x.orderId === props.orderId && x.statusId === "finish"
  )
);

const operationMontaj = computed(() =>
  operationStore.items.filter(
    (x) => x.name.toLowerCase().indexOf("монтаж") > -1
  )
);

onMounted(() => {
  tasksByOrder.value = props.tasks
    .filter((x) => x.orderId === props.orderId && x.statusId !== "finish")
    .sort((a, b) => a.sortOrder - b.sortOrder);
});

const loading = ref(false);
</script>
<template>
  <div class="b-scroll">
    <div class="flex flex-col gap-1">
      <div
        v-if="tasksByOrder.length === 0"
        class="text-g-500 dark:text-g-300 p-4"
      >
        {{ $t("info.notFoundTasks") }}
      </div>
      <div
        v-for="task in tasksCompleted"
        class="p-2 flex flex-row hover:bg-black/5 dark:hover:bg-black/10"
      >
        <ArchiveOrderTaskItem
          :taskId="task.id"
          :task="task"
          @on-edit-task="emit('onEditTask', task)"
        />
      </div>
      <template v-for="item in tasksByOrder">
        <div class="p-2 pt-6 flex flex-row">
          <ArchiveOrderTaskItem :task="item" :task-id="item.id" />
        </div>
      </template>
    </div>
  </div>
  <div
    v-if="loading"
    class="bg-white/95 dark:bg-s-900/95 absolute inset-0 flex items-center justify-center"
  >
    <a-spin />
  </div>
</template>
