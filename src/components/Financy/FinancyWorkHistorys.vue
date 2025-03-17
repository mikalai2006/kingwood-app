<script setup lang="ts">
import { IPaneOptionFinancy, IPaneOptionFinancyInput } from "@/api/types";
import {
  useAuthStore,
  useOrderStore,
  usePostStore,
  useUserStore,
  useWorkHistoryStore,
  useWorkTimeStore,
} from "@/store";
import dayjs from "@/utils/dayjs";
import { computed, ref, useTemplateRef } from "vue";
import { useResizeObserver } from "@vueuse/core";
import { useI18n } from "vue-i18n";
import { getObjectTime } from "@/utils/time";
import VIcon from "../UI/VIcon.vue";
import { iChevronDown, iPen, iPlusLg } from "@/utils/icons";
import { dateTimeFormat } from "@/utils/date";
import VFormWorkTime from "../Form/VFormWorkTime.vue";
import { IWorkTime, IWorkTimeInput } from "@/api/work_time/types";
import TimePretty from "../Time/TimePretty.vue";
import { colorWorkTimeProgress, replaceSubstringByArray } from "@/utils/utils";
import FinancyWorkTimesHistory from "./FinancyWorkTimesHistory.vue";
import FinancyDetails from "./FinancyDetails.vue";
import FinancyDetailsList from "./FinancyDetailsList.vue";
import { IWorkHistoryInput } from "@/api/work_history/types";
import VFormWorkHistory from "../Form/VFormWorkHistory.vue";

const COUNT_DAY_ADD_WORKTIME = 31;

const props = defineProps<{
  date: string;
  pane: IPaneOptionFinancy;
}>();

const emit = defineEmits({
  onChangeTabPane: (data: IPaneOptionFinancyInput) => {},
});

const { t } = useI18n();

const userStore = useUserStore();
const postStore = usePostStore();
const authStore = useAuthStore();
const orderStore = useOrderStore();
const workHistoryStore = useWorkHistoryStore();

const columns = ref([
  {
    title: t("table.financy.from"),
    dataIndex: "from",
    key: "from",
    fixed: false,
  },
  {
    title: t("table.financy.to"),
    dataIndex: "to",
    key: "to",
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

const currentDate = computed(() => dayjs(props.date));

const listData = computed(() => {
  const _list = workHistoryStore.items
    .filter(
      (x) =>
        props.pane.workerId == x.workerId &&
        dayjs(x.to).year() > 1 &&
        dayjs(x.date).isSame(dayjs(props.date), "day")
    )
    .map((x) => {
      const _totalMs = dayjs(x.to).diff(x.from);
      const _order = orderStore.items.find((ord) => ord.id == x.orderId);
      // const workHistory = workHistoryStore.items.filter(
      //   (w) => w.workTimeId === x.id
      // );
      return {
        ...x,
        totalMs: _totalMs,
        key: x.id,
        order: _order,
        // workHistory,
      };
    });
  return _list;
});

const showFormWorkTime = ref(false);

const defaultDataForm: IWorkHistoryInput = {};

const dataForm = ref(defaultDataForm);

// const onAddNewItem = () => {
//   dataForm.value = Object.assign({}, defaultData);
//   showModal();
// };

const onEditItem = (item: IWorkHistoryInput) => {
  console.log("edit WorkHistory: ", item);

  dataForm.value = Object.assign({}, item);
  showFormWorkTime.value = true;
};

const onAddItem = () => {
  const userForPayload = userStore.items.find(
    (x) => x.id === props.pane.workerId
  );
  if (!userForPayload) {
    return;
  }

  const timeFrom = dayjs(props.date);
  const timeTo = dayjs(props.date);
  dataForm.value = Object.assign(
    {},
    {
      workerId: userForPayload.id,
      from: timeFrom.format(),
      date: timeFrom.set("hour", 12).format(),
      to: timeTo.endOf("day").set("seconds", 0).format(),
      oklad: userForPayload.oklad,
    }
  );
  showFormWorkTime.value = true;
};

const timeline = useTemplateRef<HTMLElement>("timeline");
const widthTimeline = ref(0);
const widthFirstTime = ref(0);
useResizeObserver(timeline, (entries) => {
  const entry = entries[0];
  const child = entry.target.querySelector(".child")?.getBoundingClientRect();
  // console.log(child?.width);
  if (child) {
    widthFirstTime.value = child.width;
  }

  const { width } = entry.contentRect;
  widthTimeline.value = width;
});

const widthOneMs = computed(() => widthTimeline.value / (86400000 + 1800000));
const startDayMs = computed(() => dayjs(props.date).startOf("day").valueOf());
</script>

<template>
  <!-- {{ widthOneMs }} {{ startDayMs }}
  <br />
  wf={{ widthTimeline }} w={{ widthTimeline / 49 }} ws={{
    widthOneMs * 1800000
  }} -->
  <div ref="timeline" class="my-6 w-full mx-auto relative">
    <!-- <div class="flex flex-row items-center justify-center text-left">
      <div v-for="i in 25" class="flex-auto">
        {{ i - 1 }}
      </div>
    </div> -->
    <div class="flex flex-row items-end">
      <div
        v-for="i in Array.from(Array(49).keys())"
        class="m-0 p-0 border border-transparent border-l-g-200 dark:border-l-g-700 last:border-r-g-200 dark:last:border-r-g-700 border-b-g-50 dark:border-b-g-700 relative box-border z-10"
        :class="[i % 2 !== 0 ? 'h-2' : 'h-3', `child n_${i}`]"
        :style="[{ 'flex-basis': widthOneMs * 1800000 + 'px' }]"
      >
        <div
          v-if="i % 2 === 0"
          class="absolute -top-[20px] -left-[9px] w-4 text-center text-g-400 dark:text-g-500"
        >
          {{ i / 2 < 10 ? "0" : "" }}{{ i / 2 }}
        </div>
        <!-- <div class="rotate-90">&#8211;</div> -->
      </div>
    </div>

    <div class="">
      <div
        class="flex flex-row items-end absolute inset-0 z-0 top-3 border-b border-b-g-100 dark:border-b-g-700"
      >
        <div
          v-for="i in Array.from(Array(49).keys())"
          class="m-0 p-0 border border-dashed border-transparent border-l-g-100 dark:border-l-g-700 last:border-r-g-100 dark:last:border-r-g-700 relative box-border"
          :class="['h-full', `child n_${i}`]"
          :style="[{ 'flex-basis': widthOneMs * 1800000 + 'px' }]"
        ></div>
      </div>
      <!-- :class="[colorWorkTimeProgress[index]]" -->
      <a-tooltip v-for="(item, index) in listData">
        <template #title>
          {{ item.order?.name }}
        </template>
        <div
          :key="item.id"
          class="cursor-pointer relative bg-s-500 dark:bg-s-500/80 hover:bg-s-700/50 hover:dark:bg-g-400/50 h-5"
          :style="{
            width:
              Math.max(
                (dayjs(item.to).valueOf() - dayjs(item.from).valueOf()) *
                  widthOneMs,
                2
              ) + 'px',
            marginLeft:
              Math.abs(dayjs(item.from).valueOf() - startDayMs) * widthOneMs +
              'px',
          }"
          @click="
            () => {
              onEditItem(item);
            }
          "
        >
          <!-- <FinancyWorkTimesHistory
          v-for="history in item.workHistory"
          :date="date"
          :history-id="history.id"
          :workTime="item"
          :widthOneMs="widthOneMs"
        /> -->
          <!-- <div v-for="order in item.workHistory" class="bg-s-500">
          {{ order.id }}
        </div> -->
        </div>
      </a-tooltip>
    </div>
  </div>

  <a-table
    :columns="columns"
    :data-source="listData"
    bordered
    expandRowByClick
    sticky
    class="financy_table"
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

      <template v-if="column.key === 'from'">
        {{ dayjs(record.from).format(dateTimeFormat) }}
      </template>

      <template v-if="column.key === 'to'">
        {{ dayjs(record.to).format(dateTimeFormat) }}
      </template>

      <template v-if="column.key === 'total'">
        {{ record.total.toLocaleString("ru-RU") }} ₽
      </template>

      <template v-if="column.key === 'totalTime'">
        <div
          v-if="record.totalMs != undefined"
          class="text-base text-g-500 dark:text-g-400"
        >
          <TimePretty :time="getObjectTime(record.totalMs)" />
        </div>
      </template>
      <template v-if="column.key === 'action'">
        <a-tooltip v-if="authStore.roles.includes('workTime-patch')">
          <template #title>
            {{ $t("button.edit") }}
          </template>
          <a-button
            type="link"
            @click="(e: Event) => {onEditItem(record); e.preventDefault(); e.stopPropagation()}"
          >
            <VIcon :path="iPen" class="text-s-400 dark:text-g-300" />
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

    <!-- <template #expandedRowRender="{ record }">
      <template v-if="record.workHistory">
        <FinancyDetailsList
          :work-times="[record]"
          :pane="pane"
          :date="date"
          :show-button-add="true"
        />
      </template>
      <template v-else>
        <p>{{ $t("info.notFoundWorkHistory") }}</p>
      </template>
    </template> -->
    <!-- <template #expandIcon="{ expanded, onExpand, record }">
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
    </template> -->
    <template #footer>
      <a-alert
        v-if="dayjs().diff(dayjs(date), 'days') > COUNT_DAY_ADD_WORKTIME"
        type="warning"
        show-icon
        :message="$t('notify.warning')"
        :description="
          replaceSubstringByArray($t('info.rangeAddWorkTime'), [
            COUNT_DAY_ADD_WORKTIME,
          ])
        "
      />
      <a-tooltip
        v-if="
          authStore.roles.includes('workTime-create') &&
          dayjs().diff(dayjs(date), 'days') <= COUNT_DAY_ADD_WORKTIME
        "
      >
        <template #title>
          {{ $t("button.addWorkTime") }}
        </template>
        <a-button
          @click="(e: Event) => {onAddItem(); e.preventDefault(); e.stopPropagation()}"
        >
          <div class="flex gap-2 items-center">
            <VIcon :path="iPlusLg" class="text-g-400 dark:text-g-300" />
            <div>
              {{ $t("button.addWorkTime") }}
            </div>
          </div>
        </a-button>
      </a-tooltip>
    </template>
  </a-table>

  <a-modal
    v-model:open="showFormWorkTime"
    :destroyOnClose="true"
    :title="$t('form.workTime.modalTitle')"
    :maskClosable="false"
    :ok-button-props="{ hidden: true }"
    :cancel-button-props="{ hidden: true }"
  >
    <VFormWorkHistory
      :data="dataForm"
      :default-data="defaultDataForm"
      @callback="
        () => {
          showFormWorkTime = false;
        }
      "
    />
  </a-modal>
</template>
