<script setup lang="ts">
import { IPaneOptionFinancy, IPaneOptionFinancyInput } from "@/api/types";
import { usePostStore, useUserStore, useWorkTimeStore } from "@/store";
import dayjs from "@/utils/dayjs";
import { ref } from "vue";
import { IWorTimeExtends } from "./FinancyPaneTableTotal.vue";
import { useI18n } from "vue-i18n";
import FinancyPaneTableTotal from "./FinancyPaneTableTotal.vue";
import { getObjectTime } from "@/utils/time";

const props = defineProps<{
  pane: IPaneOptionFinancy;
  data: {
    day: number;
    dayWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
    dayName: string;
  }[];
  workTimes: { [key: string]: IWorTimeExtends[] };
}>();

const emit = defineEmits({
  onChangeTabPane: (data: IPaneOptionFinancyInput) => {},
});

const { t } = useI18n();

const userStore = useUserStore();
const postStore = usePostStore();
const workTimeStore = useWorkTimeStore();

const columns = ref([
  {
    title: t("table.financy.day"),
    dataIndex: "day",
    key: "day",
    fixed: false,
  },
  {
    title: t("table.financy.total"),
    dataIndex: "total",
    key: "total",
    fixed: false,
  },
  {
    title: t("table.financy.totalTime"),
    dataIndex: "totalTime",
    key: "totalTime",
    fixed: false,
  },
  // {
  //   title: t("table.object.action"),
  //   dataIndex: "action",
  //   key: "action",
  //   fixed: false,
  // },
]);
</script>

<template>
  <a-table
    :columns="columns"
    :data-source="data"
    expandRowByClick
    bordered
    sticky
    size="small"
    :pagination="{
      pageSize: 32,
    }"
    :row-class-name="(_record: any, index: number) => ([0,6].includes(_record.dayWeek)  ? 'custom priority cursor-pointer bg-p-500/30 dark:bg-p-500/15 hover:!bg-p-500/40 dark:hover:!bg-p-500/30' : 'cursor-pointer')"
  >
    <!-- 
    :customRow="
            (record: IOrder) => {
              return {
                // xxx, // props
                onClick: () => {
                  emit('showOrderInfo', record)
                }, // click row
                // onDblclick: (event) => {}, // double click row
                // onContextmenu: (event) => {}  // right button click row
                // onMouseenter: (event) => {}   // mouse enter row
                // onMouseleave: (event) => {}   // mouse leave row
              };
            }
          " -->
    <template #bodyCell="{ column, record }">
      <!-- <template v-if="record"></template> -->
      <template v-if="column.key === 'day'">
        <div class="text-xl text-g-800 dark:text-g-200">
          {{ record.day }}
          <span class="text-sm text-g-500 dark:text-g-400">
            {{ record.dayName }}
          </span>
        </div>
      </template>

      <template v-if="column.key === 'total'">
        <FinancyPaneTableTotal
          v-if="workTimes[record.day]"
          :data="workTimes[record.day]"
          :pane="pane"
          :day="record.day"
        />
      </template>

      <template v-if="column.key === 'totalTime'">
        <!-- <div>
      <TimePretty :time="getObjectTime(workTimeTotal - workHistoryTotal)" />
    </div> -->
        <div
          v-if="workTimes[record.day]"
          class="text-base text-g-500 dark:text-g-400"
        >
          <!-- {{ $t("form.financy.totalTimeWork") }}: -->
          <TimePretty
            :time="
              getObjectTime(
                workTimes[record.day]?.reduce(
                  (a, b) => a + dayjs(b.to).diff(b.from),
                  0
                )
              )
            "
          />
        </div>
      </template>
    </template>
  </a-table>
</template>
