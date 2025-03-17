<script setup lang="ts">
import { IPaneOptionFinancy, IPaneOptionFinancyInput } from "@/api/types";
import { usePostStore, useUserStore } from "@/store";
import { computed, ref } from "vue";
import { IWorkHistory } from "@/api/work_history/types";

export interface IWorkHistoryExtends extends IWorkHistory {
  totalMs: number;
  day: number;
}

const props = defineProps<{
  pane: IPaneOptionFinancy;
  day: number;
  data: IWorkHistoryExtends[];
}>();

const emit = defineEmits({
  onChangeTabPane: (data: IPaneOptionFinancyInput) => {},
});

const userStore = useUserStore();
const postStore = usePostStore();

const worker = computed(() =>
  userStore.items.find((x) => x.id === props.pane.workerId)
);

// const workTimeTotal = computed(() => {
//   return props.data?.reduce((a, b) => a + dayjs(b.to).diff(b.from), 0);
// });

// const workHistoryTotal = computed(() => {
//   return props.data?.reduce((a, b) => a + b.totalMs, 0);
// });

const totalMoney = computed(() => props.data.reduce((a, b) => a + b.total, 0));
</script>

<template>
  <div class="flex-auto flex items-center gap-4">
    <div class="text-base font-medium text-p-700 dark:text-p-400">
      {{ totalMoney.toLocaleString("ru-RU") }}
      ₽
    </div>
  </div>
  <div></div>
</template>
