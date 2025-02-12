<script setup lang="ts">
import { IPaneOptionFinancy, IPaneOptionFinancyInput } from "@/api/types";
import {
  useAuthStore,
  usePostStore,
  useUserStore,
  useWorkTimeStore,
} from "@/store";
import dayjs from "@/utils/dayjs";
import { ref } from "vue";
import { IWorTimeExtends } from "./FinancyPaneTableTotal.vue";
import { useI18n } from "vue-i18n";
import FinancyPaneTableTotal from "./FinancyPaneTableTotal.vue";
import { getObjectTime } from "@/utils/time";
import FinancyDetails from "./FinancyDetails.vue";
import VIcon from "../UI/VIcon.vue";
import { iChevronDown, iMinus, iPen, iPlusLg, iTrashFill } from "@/utils/icons";

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
const authStore = useAuthStore();
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
  {
    title: t("table.object.action"),
    dataIndex: "action",
    key: "action",
    fixed: false,
  },
]);
</script>

<template>
  <a-table
    :columns="columns"
    :data-source="data"
    bordered
    expandRowByClick
    sticky
    size="small"
    :pagination="{
      pageSize: 32,
    }"
    :row-class-name="(_record: any, index: number) => ([0,6].includes(_record.dayWeek)  ? 'custom priority cursor-pointer bg-p-500/30 dark:bg-p-500/15 hover:!bg-p-500/40 dark:hover:!bg-p-500/30' : 'cursor-pointer')"
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
          v-if="workTimes[record.day]"
          :data="workTimes[record.day]"
          :pane="pane"
          :day="record.day"
        />
      </template>

      <template v-if="column.key === 'totalTime'">
        {{ workTimes[record.day]?.length }}
        <div
          v-if="workTimes[record.day]"
          class="text-base text-g-500 dark:text-g-400"
        >
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
      <template v-if="column.key === 'action'">
        <a-tooltip v-if="authStore.roles.includes('workTime-patch')">
          <template #title>
            {{ $t("button.edit") }}
          </template>
          <a-button
            type="link"
            @click="(e: Event) => {e.preventDefault(); e.stopPropagation()}"
          >
            <VIcon :path="iPen" class="text-s-400 dark:text-g-300" />
          </a-button>
        </a-tooltip>

        <a-tooltip v-if="authStore.roles.includes('workTime-delete')">
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
        </a-tooltip>
      </template>
    </template>

    <template #expandedRowRender="{ record }">
      <template v-if="workTimes[record.day]?.length">
        <!-- record {{ workTimes[record.day][0]?.id }} -->
        <FinancyDetails :work-times="workTimes[record.day]" />
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
        class="transition-all rotate-0"
        @click="(e) => onExpand(record, e)"
      />
      <VIcon
        v-else
        :path="iChevronDown"
        class="transition-all rotate-180"
        @click="(e) => onExpand(record, e)"
      />
    </template>
  </a-table>
</template>
