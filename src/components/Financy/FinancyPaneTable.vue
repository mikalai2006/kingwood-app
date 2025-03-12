<script setup lang="ts">
import { IPaneOptionFinancy, IPaneOptionFinancyInput } from "@/api/types";
import { useAuthStore, usePostStore, useUserStore } from "@/store";
import dayjs from "@/utils/dayjs";
import { ref } from "vue";
import { IWorkHistoryExtends } from "./FinancyPaneTableTotal.vue";
import { useI18n } from "vue-i18n";
import FinancyPaneTableTotal from "./FinancyPaneTableTotal.vue";
import { getObjectTime } from "@/utils/time";
import VIcon from "../UI/VIcon.vue";
import { iChevronDown, iPen } from "@/utils/icons";
import FinancyWorkHistorys from "./FinancyWorkHistorys.vue";
import { dateFormat } from "@/utils/date";
import TimePretty from "../Time/TimePretty.vue";
import FinancyDetailsList from "./FinancyDetailsList.vue";

const props = defineProps<{
  pane: IPaneOptionFinancy;
  data: {
    day: number;
    dayWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
    dayName: string;
    date: string;
  }[];
  workHistorys: { [key: string]: IWorkHistoryExtends[] };
}>();

const emit = defineEmits({
  onChangeTabPane: (data: IPaneOptionFinancyInput) => {},
});

const { t } = useI18n();

const userStore = useUserStore();
const postStore = usePostStore();
const authStore = useAuthStore();

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
  {
    title: t("table.object.action"),
    dataIndex: "action",
    key: "action",
    fixed: false,
  },
]);

const openModalWorkTime = ref(false);
const workTimeDate = ref<string>("");
</script>

<template>
  <a-table
    :columns="columns"
    :data-source="data"
    bordered
    expandRowByClick
    class="financy_table"
    sticky
    size="small"
    :pagination="{
      pageSize: 32,
    }"
    :row-class-name="(_record: any, index: number) => ([0,6].includes(_record.dayWeek)  ? 'custom priority cursor-pointer bg-p-500/10 dark:bg-p-500/15 hover:!bg-p-500/20 dark:hover:!bg-p-500/30' : 'cursor-pointer')"
  >
    <template #bodyCell="{ column, record }">
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
          v-if="workHistorys[record.day]"
          :data="workHistorys[record.day]"
          :pane="pane"
          :day="record.day"
        />
      </template>

      <template v-if="column.key === 'totalTime'">
        <!-- {{ workTimes[record.day]?.length }} -->
        <div
          v-if="workHistorys[record.day]"
          class="text-base text-g-500 dark:text-g-400"
        >
          <TimePretty
            :time="
              getObjectTime(
                workHistorys[record.day]?.reduce(
                  (a, b) => a + dayjs(b.to).diff(b.from),
                  0
                )
              )
            "
            hide-seconds
          />
        </div>
      </template>
      <template v-if="column.key === 'action'">
        <a-tooltip v-if="authStore.roles.includes('workTime-list')">
          <template #title>
            {{ $t("button.edit") }}
          </template>
          <a-button
            type="text"
            @click="(e: Event) => {workTimeDate=record.date; openModalWorkTime=true; e.preventDefault(); e.stopPropagation()}"
          >
            <VIcon :path="iPen" />
          </a-button>
        </a-tooltip>

        <!-- <a-tooltip v-if="authStore.roles.includes('workTime-delete')">
          <template #title>
            {{ $t("button.delete") }}
          </template>
          <a-button
            danger
            type="link"
            @click="(e: Event) => { e.preventDefault(); e.stopPropagation()}"
          >
            <VIcon :path="iTrashFill" />
          </a-button>
        </a-tooltip> -->
      </template>
    </template>

    <template #expandedRowRender="{ record }">
      <template v-if="workHistorys[record.day]?.length">
        <!-- record {{ workTimes[record.day][0]?.id }} -->
        <FinancyDetailsList
          :work-historys="workHistorys[record.day]"
          :pane="pane"
          :date="record.day.toString()"
          :show-button-add="false"
        />
      </template>
      <template v-else>
        <p>{{ $t("info.notFoundWorkHistory") }}</p>
      </template>
    </template>
    <!-- <template #expandColumnTitle>
      <span style="color: red">More</span>
    </template> -->
    <template #expandIcon="{ expanded, onExpand, record }">
      <VIcon
        v-if="!expanded"
        :path="iChevronDown"
        class="transition-all rotate-0 text-g-300 dark:text-g-600"
        @click="(e) => onExpand(record, e)"
      />
      <VIcon
        v-else
        :path="iChevronDown"
        class="transition-all rotate-180 text-g-300 dark:text-g-600"
        @click="(e) => onExpand(record, e)"
      />
    </template>
  </a-table>

  <a-modal
    v-model:open="openModalWorkTime"
    :destroyOnClose="true"
    style="width: 70%"
    :title="
      $t('page.workTimes.title') + ' ' + dayjs(workTimeDate).format(dateFormat)
    "
    :maskClosable="false"
    :ok-button-props="{ hidden: true }"
    :cancel-button-props="{ hidden: true }"
  >
    <FinancyWorkHistorys :date="workTimeDate" :pane="pane" />
  </a-modal>
</template>
