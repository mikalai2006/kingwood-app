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
import { computed, onMounted, ref } from "vue";
import { IWorkHistoryExtends } from "./FinancyPaneTableTotal.vue";
import { getObjectTime } from "@/utils/time";
import { useI18n } from "vue-i18n";
import { RouterLink } from "vue-router";
import { IWorkHistoryStatByOrder } from "@/api/work_history/types";
import { IOrder } from "@/api/order/types";
import FinancyOrder from "./FinancyOrder.vue";

const props = defineProps<{
  workTimes: IWorkHistoryExtends[];
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

const openFinancyOrder = ref(false);

const activeFinancyOrder = ref<IOrder | null>();

const onViewFinancyOrder = (orderId: string) => {
  const _order = orderStore.items.find((x) => x.id === orderId);

  if (_order) {
    activeFinancyOrder.value = _order;
    openFinancyOrder.value = true;
  }
};

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
    <!-- :showHeader="false" -->
    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'object'">
        <p>
          {{ record.object?.name }}
        </p>
      </template>
      <template v-if="column.key === 'order'">
        <!-- <RouterLink
          :to="{
            name: 'financyOrder',
            params: {
              orderId: record.order.id,
            },
          }"
        >
          <span class="underline">
            №{{ record.order?.number }} - {{ record.order?.name }}
          </span>
        </RouterLink> -->
        <a-button type="link" @click="onViewFinancyOrder(record.order.id)">
          <span class="underline">
            №{{ record.order?.number }} - {{ record.order?.name }}
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

  <a-modal
    v-model:open="openFinancyOrder"
    width="70%"
    style="margin: 0 auto"
    :key="activeFinancyOrder?.id"
    wrapClassName="b-scroll full-modal"
    :bodyStyle="{ margin: 0, padding: 0 }"
    :destroyOnClose="true"
    :maskClosable="false"
    :ok-button-props="{ hidden: true }"
    :cancel-button-props="{ hidden: true }"
    :cancel-text="$t('button.close')"
    @cancel="
      () => {
        activeFinancyOrder = null;
      }
    "
  >
    <template #title>
      <p class="text-xl leading-6 py-4">
        {{ $t("page.financyOrder.title") }} №{{ activeFinancyOrder?.number }}
        -
        {{ activeFinancyOrder?.name }}
      </p>
    </template>
    <div v-if="activeFinancyOrder" class="">
      <FinancyOrder :order-id="activeFinancyOrder.id" />
    </div>
  </a-modal>
</template>
