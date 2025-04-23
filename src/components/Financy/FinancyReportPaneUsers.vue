<script setup lang="ts">
import { IPaneOptionFinancy, IPaneOptionFinancyInput } from "@/api/types";
import { usePostStore, useUserStore, useWorkHistoryStore } from "@/store";
import dayjs from "@/utils/dayjs";
import groupBy from "lodash-es/groupBy";
import { computed, ref } from "vue";
import FinancyReportPaneUsersItem from "./FinancyReportPaneUsersItem.vue";

const props = defineProps<{
  pane: IPaneOptionFinancy;
  idsWorkers: string[];
}>();

const emit = defineEmits({
  onChangeTabPane: (data: IPaneOptionFinancyInput) => {
    return `true`;
  },
});

const userStore = useUserStore();
const postStore = usePostStore();
const workHistoryStore = useWorkHistoryStore();

const month = computed(() => dayjs(props.pane.month) || "");
const workerId = computed<string>(() => props.pane.workerId || "");
// const orderId = ref(props.pane.orderId);

const currentDate = computed(() => dayjs(month.value));

const workers = computed(() =>
  userStore.items.filter((x) => props.idsWorkers.includes(x.id))
);

// const workHistoryGroupWorker = computed(() => {
//   const _list = workHistoryStore.items
//     .filter(
//       (x) =>
//         dayjs(x.to).year() > 1 &&
//         dayjs(x.to)
//           .utc(true)
//           .isBetween(
//             currentDate.value.utc(true).startOf("month"),
//             currentDate.value.utc(true).endOf("month"),
//             "day",
//             "[]"
//           )
//     )
//     .map((x) => {
//       const _worker = userStore.items.find((y) => y.id === x.workerId);
//       return {
//         worker: _worker,
//         ...x,
//       };
//     })
//     .filter((x) =>
//       x.worker?.name.toLowerCase().includes(name.value.toLowerCase())
//     );
//   // .map((x) => {
//   //   const _totalMs = dayjs(x.to).diff(x.from);
//   //   return {
//   //     ...x,
//   //     totalMs: _totalMs,
//   //   };
//   // });
//   return groupBy(_list, "workerId");
// });

const name = ref("");
</script>

<template>
  <div class="flex-auto flex flex-row items-stretch">
    <div class="overflow-hidden w-full">
      <div class="mb-4">
        <a-input v-model:value="name" placeholder="Введите фИО..." />
      </div>
      <!-- <div v-for="item in workHistoryGroupWorker">
          {{ item[0].id }}
        </div> -->
      <template v-if="!!workers?.length">
        <FinancyReportPaneUsersItem
          v-for="item in workers"
          :pane="pane"
          :worker-id="item.id"
          @onChangeTabPane="emit('onChangeTabPane', $event)"
        />
      </template>
      <template v-else-if="name != ''">
        <a-alert
          type="info"
          show-icon
          :message="$t('notify.info')"
          :description="$t('info.notFoundFinancyUsersByName')"
        />
      </template>
      <template v-else>
        <a-alert
          type="info"
          show-icon
          :message="$t('notify.info')"
          :description="$t('info.notFoundFinancyUsers')"
        />
      </template>
    </div>
  </div>
</template>
