<script setup lang="ts">
import { useOperationStore, useTaskStore, useUserStore } from "@/store";
import { computed } from "vue";

const props = defineProps<{
  orderId: string;
  taskId: string;
  operationId: string;
}>();

const operationStore = useOperationStore();
const userStore = useUserStore();
const taskStore = useTaskStore();

const operation = computed(() => {
  return operationStore.items.find((x) => x.id === props.operationId);
});

const task = computed(() => {
  return taskStore.items.find((x) => x.id === props.taskId);
});

const workers = computed(() =>
  task.value?.workerId
    ? userStore.items.filter((x) => task.value.workerId.includes(x.id))
    : []
);
</script>
<template>
  <div class="flex flex-col md:flex-row">
    <div>
      step
      {{ workers.join(", ") }}
    </div>
  </div>
</template>

<style scoped></style>
