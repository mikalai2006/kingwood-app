<script setup lang="ts">
import {
  useObjectStore,
  useOperationStore,
  useOrderStore,
  useUserStore,
  useWorkHistoryStore,
  useWorkTimeStore,
} from "@/store";
import dayjs from "@/utils/dayjs";
import { computed, onMounted } from "vue";
import { IWorTimeExtends } from "./FinancyPaneTableTotal.vue";
import { getObjectTime } from "@/utils/time";
import { useI18n } from "vue-i18n";

const props = defineProps<{
  workTimes: IWorTimeExtends[];
}>();

const { t } = useI18n();

const userStore = useUserStore();
const workTimeStore = useWorkTimeStore();
const workHistoryStore = useWorkHistoryStore();
const orderStore = useOrderStore();
const objectStore = useObjectStore();
const operationStore = useOperationStore();

const idsWorkTime = computed(() => props.workTimes.map((x) => x.id));

// const workTime = computed(() =>
//   workTimeStore.items.filter((x) => idsWorkTime.value.includes(x.id))
// );

const workHistory = computed(() => {
  const _list = workHistoryStore.items
    .filter((x) => idsWorkTime.value.includes(x.workTimeId))
    .map((x) => {
      // console.log("x.workHistory: ", x.workHistory);

      const dayTo = dayjs(x.to);
      // console.log(dayTo.year(), dayTo.diff(x.from));

      const _totalMinutes = dayTo.year() != 1 ? dayTo.diff(x.from) : 0;

      const order = orderStore.items.find((_order) => _order.id === x.orderId);
      const object = objectStore.items.find(
        (_object) => _object.id === x.objectId
      );
      const operation = operationStore.items.find(
        (_operation) => _operation.id === x.operationId
      );
      return {
        ...x,
        totalMinutes: _totalMinutes,
        order,
        object,
        operation,
      };
    });
  return _list;
});

const innerColumns = [
  { title: t("table.financy.object"), dataIndex: "object", key: "object" },
  { title: t("table.financy.order"), dataIndex: "order", key: "order" },
  { title: t("table.financy.operation"), key: "operation" },
  {
    title: t("table.financy.time"),
    dataIndex: "time",
    key: "time",
  },
];

onMounted(() => {});
</script>

<template>
  <!-- <div>
    <div
      v-for="history in workHistory"
      :key="history.id"
      class="flex flex-row items-center"
    >
      <div class="leading-5">
        {{ history.order?.name }}
        <p>
          {{ history.object?.name }}
        </p>
      </div>
      <div>
        {{ history.operation?.name }}
      </div>
      <div>
        <TimePretty :time="getObjectTime(history.totalMinutes)" />
      </div>
    </div>
  </div> -->
  <a-table
    :columns="innerColumns"
    :data-source="workHistory"
    :pagination="false"
  >
    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'object'">
        <p>
          {{ record.object?.name }}
        </p>
      </template>
      <template v-if="column.key === 'order'">
        <a-button type="link">
          <span class="underline">
            {{ record.order?.name }}
          </span>
        </a-button>
      </template>
      <template v-if="column.key === 'operation'">
        <p>
          {{ record.operation?.name }}
        </p>
      </template>
      <template v-if="column.key === 'time'">
        <TimePretty :time="getObjectTime(record.totalMinutes)" />
        <!-- <span>
          <a-badge status="success" />
          Finished
        </span> -->
      </template>
    </template>
  </a-table>
</template>
