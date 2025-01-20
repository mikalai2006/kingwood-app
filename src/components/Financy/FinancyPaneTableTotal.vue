<script setup lang="ts">
import { IPaneOptionFinancy, IPaneOptionFinancyInput } from "@/api/types";
import { usePostStore, useUserStore, useWorkTimeStore } from "@/store";
import dayjs from "@/utils/dayjs";
import { computed, ref } from "vue";
import { IWorkTime } from "@/api/work_time/types";
import { getObjectTime } from "@/utils/time";
import TimePretty from "../Time/TimePretty.vue";

export interface IWorTimeExtends extends IWorkTime {
  totalMs: number;
  day: number;
}

const props = defineProps<{
  pane: IPaneOptionFinancy;
  day: number;
  data: IWorTimeExtends[];
}>();

const emit = defineEmits({
  onChangeTabPane: (data: IPaneOptionFinancyInput) => {},
});

const userStore = useUserStore();
const postStore = usePostStore();
const workTimeStore = useWorkTimeStore();

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
    <div class="text-base text-p-700 dark:text-p-400">
      {{ totalMoney.toLocaleString("ru-RU") }}
      ₽
    </div>
  </div>
  <div></div>
</template>
