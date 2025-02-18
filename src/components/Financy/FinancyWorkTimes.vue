<script setup lang="ts">
import { IPaneOptionFinancy, IPaneOptionFinancyInput } from "@/api/types";
import {
  useAuthStore,
  usePostStore,
  useUserStore,
  useWorkTimeStore,
} from "@/store";
import dayjs from "@/utils/dayjs";
import { computed, ref } from "vue";
import { IWorTimeExtends } from "./FinancyPaneTableTotal.vue";
import { useI18n } from "vue-i18n";
import FinancyPaneTableTotal from "./FinancyPaneTableTotal.vue";
import { getObjectTime } from "@/utils/time";
import FinancyDetails from "./FinancyDetails.vue";
import VIcon from "../UI/VIcon.vue";
import { iChevronDown, iMinus, iPen, iPlusLg, iTrashFill } from "@/utils/icons";
import { dateTimeFormat } from "@/utils/date";
import VFormWorkTime from "../Form/VFormWorkTime.vue";
import { IWorkTime, IWorkTimeInput } from "@/api/work_time/types";
import TimePretty from "../Time/TimePretty.vue";
import { replaceSubstringByArray } from "@/utils/utils";

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
const workTimeStore = useWorkTimeStore();

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
  const _list = workTimeStore.items
    .filter(
      (x) =>
        props.pane.workerId == x.workerId &&
        dayjs(x.to).year() > 1 &&
        dayjs(x.date).isSame(dayjs(props.date), "day")
    )
    .map((x) => {
      const _totalMs = dayjs(x.to).diff(x.from);
      return {
        ...x,
        totalMs: _totalMs,
      };
    });
  return _list;
});

const showFormWorkTime = ref(false);

const defaultDataForm: IWorkTimeInput = {};

const dataForm = ref(defaultDataForm);

// const onAddNewItem = () => {
//   dataForm.value = Object.assign({}, defaultData);
//   showModal();
// };

const onEditItem = (item: IWorkTime) => {
  console.log("edit WorkTime: ", item);

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
</script>

<template>
  <a-table
    :columns="columns"
    :data-source="listData"
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
          <TimePretty :time="getObjectTime(record.totalMs)" hide-seconds />
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
      <template v-if="workTimes[record.day]?.length">
        <FinancyDetails :work-times="workTimes[record.day]" />
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
            <VIcon :path="iPlusLg" class="text-s-400 dark:text-g-300" />
            <div>
              {{ $t("form.add") }}
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
    <VFormWorkTime
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
