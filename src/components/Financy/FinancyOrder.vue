<script setup lang="ts" async>
import { computed, onMounted, ref } from "vue";
import dayjs from "@/utils/dayjs";

import { useI18n } from "vue-i18n";

import { getStatByOrder } from "@/api/work_history";
import { useGeneralStore, useUserStore } from "@/store";
import { IWorkHistoryStatByOrder } from "@/api/work_history/types";
import FinancyOrderDetails from "@/components/Financy/FinancyOrderDetails.vue";
import { iChevronDown } from "@/utils/icons";

const props = defineProps<{ orderId: string }>();

dayjs.locale("ru");

const generalStore = useGeneralStore();
const userStore = useUserStore();

const { t } = useI18n();

const data = ref<IWorkHistoryStatByOrder[]>([]);

const onLoadWorkHistoryStat = () => {
  getStatByOrder({ orderId: [props.orderId] }).then((r) => {
    r?.forEach((el) => {
      if (el.worker) {
        userStore.onAddItemToStore(el.worker);
      }
    });
    data.value = r?.map((x) => {
      return {
        ...x,
        key: x.workerId,
      };
    });
  });
};

const total = computed(() =>
  data.value ? data.value?.reduce((a, e) => a + e.total, 0) : 0
);

const columns = [
  { title: t("table.financyOrder.worker"), dataIndex: "worker", key: "worker" },
  { title: t("table.financyOrder.total"), dataIndex: "total", key: "total" },
];

onMounted(async () => {
  onLoadWorkHistoryStat();
});
</script>

<template>
  <div class="flex-auto overflow-hidden max-h-screen">
    <div class="flex-auto p-4">
      <a-table
        :columns="columns"
        :data-source="data"
        :pagination="{
          pageSize: 100,
        }"
        bordered
        expandRowByClick
        sticky
        size="small"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'worker'">
            <p>
              {{ record.worker?.name }}
            </p>
          </template>
          <template v-if="column.key === 'total'">
            <p>{{ record.total.toLocaleString("ru-RU") }} ₽</p>
          </template>
          <!-- <template v-if="column.key === 'operation'">
        <p>
          {{ record.operation?.name }}
        </p>
      </template> -->
          <!-- <template v-if="column.key === 'time'">
        <TimePretty :time="getObjectTime(record.totalMinutes)" />
      </template> -->
        </template>
        <template #expandedRowRender="{ record }">
          <template v-if="record">
            <!-- record {{ workTimes[record.day][0]?.id }} -->
            <FinancyOrderDetails :stat="record" />
          </template>
          <template v-else>
            <p>{{ $t("info.notFoundWorkHistory") }}</p>
          </template>
        </template>
        <template #expandIcon="{ expanded, onExpand, record }">
          <VIcon
            v-if="!expanded"
            :path="iChevronDown"
            class="transition-all rotate-0"
            @click="(e: any) => onExpand(record, e)"
          />
          <VIcon
            v-else
            :path="iChevronDown"
            class="transition-all rotate-180"
            @click="(e: any) => onExpand(record, e)"
          />
        </template>
        <template #footer>
          {{ $t("table.financyOrder.totalAll") }}:
          {{ total.toLocaleString("ru-RU") }} ₽
        </template>
      </a-table>
    </div>
  </div>
</template>
