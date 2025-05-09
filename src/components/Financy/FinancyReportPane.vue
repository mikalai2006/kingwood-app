<script setup lang="ts">
import {
  IFormOptionFilter,
  IPaneOptionFinancy,
  IPaneOptionFinancyInput,
} from "@/api/types";
import useOrder from "@/composable/useOrder";
import { usePostStore, useUserStore, useWorkHistoryStore } from "@/store";
import dayjs from "@/utils/dayjs";
import groupBy from "lodash-es/groupBy";
import { computed, onMounted, ref } from "vue";
import FinancyTotal from "./FinancyTotal.vue";
import FinancyPaneTable from "./FinancyPaneTable.vue";
import { IPay, IPayInput } from "@/api/pay/types";
import VFormPay from "../Form/VFormPay.vue";
import { getShortFIO } from "@/utils/utils";
import FinancyReportPaneUsers from "./FinancyReportPaneUsers.vue";
import FinancyReportTotal from "./FinancyReportTotal.vue";
import FinancyReportForm from "./FinancyReportForm.vue";
import { iChevronDown } from "@/utils/icons";
import FinancyReportUserInfo from "./FinancyReportUserInfo.vue";

const props = defineProps<{
  pane: IPaneOptionFinancy;
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
const orderId = ref(props.pane.orderId);

const currentDate = computed(() => dayjs(month.value));

const countDays = computed(() =>
  month.value ? currentDate.value.daysInMonth() : 0
);

const daysList = computed(() =>
  Array.from(Array(countDays.value).keys()).map((x) => {
    const _date = month.value.startOf("month").add(x, "day");
    // dayjs(
    //   `${x + 1}-${month.value.month()}-${month.value.year()}`,
    //   "D-M-YYYY"
    // );
    return {
      key: x.toString(),
      day: x + 1,
      date: _date.format(),
      dayWeek: _date.day(),
      dayName: _date.format("dd"),
    };
  })
);

const workers = computed(() => {
  return userStore.items
    .filter((x) => !x.hidden)
    .map((x) => {
      const post = postStore.items.find((y) => y.id === x.postId);
      return {
        post,
        value: x.id,
        label: x.name,
      };
    });
});
const filterOption = (input: string, option: IFormOptionFilter) => {
  return option.label.toUpperCase().indexOf(input.toUpperCase()) >= 0;
};

const worker = computed(() =>
  userStore.items.find((x) => x.id === workerId.value)
);

const onQuery = (isSaveOption: boolean) => {
  const data: IPaneOptionFinancyInput = {
    ...props.pane,
    month: month.value?.toString(),
    monthIndex: month.value.month(),
    orderId: orderId.value,
    workerId: workerId.value,
    title: worker.value
      ? `${getShortFIO(worker.value.name)} - ${currentDate.value.format(
          "YYYY-MM"
        )}`
      : props.pane.title,
  };
  if (isSaveOption) {
    emit("onChangeTabPane", data);
  }

  if (!month.value) {
    return;
  }
  workHistoryStore
    .find({
      // workerId: workerId.value ? [workerId.value] : undefined,
      from: month.value
        ? currentDate.value.startOf("month").format()
        : undefined,
      to: month.value ? currentDate.value.endOf("month").format() : undefined,
      $limit: 10000,
    })
    .then((r) => {
      // if (!r.data?.length) {
      emit("onChangeTabPane", {
        ...props.pane,
        workerId: undefined,
      });
      // }
    });
};

const listData = computed(() => {
  const _list = workHistoryStore.items
    .filter(
      (x) =>
        workerId.value == x.workerId &&
        dayjs(x.to).year() > 1 &&
        dayjs(x.to)
          .utc(true)
          .isBetween(
            currentDate.value.utc(true).startOf("month"),
            currentDate.value.utc(true).endOf("month"),
            "day",
            "[]"
          )
    )
    .map((x) => {
      const _totalMs = dayjs(x.to).diff(x.from);
      // x.workHistory.reduce(
      //   (a, b) => a + dayjs(b.to).diff(b.from),
      //   0
      // );
      return {
        ...x,
        totalMs: _totalMs,
      };
    });
  return _list;
});

const listDataGroupDays = computed(() => {
  const _list = listData.value.map((x) => {
    return {
      ...x,
      day: dayjs(x.from).utc(true).date(),
    };
  });

  return groupBy(_list, "day");
});

const { state, onFetchOrders } = useOrder();

const open = ref<boolean>(false);

const showModal = () => {
  open.value = true;
};

const defaultData = computed<IPayInput>(() => {
  return {
    workerId: workerId.value,
    year: currentDate.value.year(),
    month: currentDate.value.month(),
  };
});

const dataForm = ref<IPayInput>({});

const onAddPay = () => {
  dataForm.value = { ...defaultData.value };
  showModal();
};

const onEditPay = (item: IPay) => {
  import.meta.env.VIEW_CONSOLE && console.log("Edit pay item: ", item);

  dataForm.value = { ...item };
  showModal();
};

const showTotal = ref(false);
const showTable = ref(false);

onMounted(() => {
  onQuery(false);
});
</script>

<template>
  <div class="flex-auto flex flex-row items-stretch bg-white dark:bg-g-900/50">
    <div class="flex flex-row items-stretch basis-4/12 shrink-0 grow-1 gap-4">
      <div class="p-4 overflow-hidden w-full">
        <!-- {{ JSON.stringify(daysList) }} -->
        <div class="bg-s-100 dark:bg-g-800 rounded-lg">
          <FinancyReportForm
            :pane="pane"
            @onChangeTabPane="emit('onChangeTabPane', $event)"
          />
        </div>

        <div
          class="mt-4 p-4 bg-s-100 dark:bg-g-800 rounded-lg overflow-y-auto max-h-[calc(100vh_-_235px)] b-scroll"
        >
          <div
            class="cursor-pointer flex flex-row items-center text-s-500 dark:text-g-300 p-4"
            @click="showTotal = !showTotal"
          >
            <div class="flex-auto">
              {{ $t("table.financy.totalByMonth") }}
            </div>
            <div>
              <VIcon
                :path="iChevronDown"
                :class="[showTotal ? 'rotate-180' : '', 'transition-transform']"
              />
            </div>
          </div>
          <FinancyReportTotal
            v-if="showTotal"
            :pane="pane"
            :key="pane.month?.toString()"
            @onEditPay="onEditPay"
          />
        </div>
      </div>
    </div>

    <div class="basis-2/12 shrink-0 grow-1 bg-white dark:bg-g-900 min-w-80">
      <div
        class="mt-4 rounded-lg overflow-y-auto h-[calc(100vh_-_165px)] b-scroll"
      >
        <FinancyReportPaneUsers
          :pane="pane"
          @on-change-tab-pane="emit('onChangeTabPane', $event)"
        />
      </div>
    </div>

    <div
      v-if="listData.length"
      class="flex-auto flex flex-col items-stretch m-4 overflow-y-auto h-[calc(100vh_-_130px)] b-scroll"
    >
      <!-- <div class="flex-auto flex flex-col">
        <div
          v-for="day in daysList"
          :key="day.day.toString()"
          class="flex flex-row text-center gap-4 p-2 border-r border-b border-s-100 dark:border-g-700"
          :class="[
            {
              'bg-p-500/15 dark:bg-p-500/15': [0, 6].includes(day.dayWeek),
            },
          ]"
        >
          <div class="p-2 px-4 flex gap-2 items-center">
            <div class="text-xl text-p-700 dark:text-p-400">
              {{ day.day }}
              <sup class="text-sm text-g-500 dark:text-g-400">
                {{ day.dayName }}
              </sup>
            </div>
          </div>
          <div class="flex-auto flex gap-2 items-center">
            <FinancyDay
              v-if="listDataGroupDays[day.day]"
              :pane="pane"
              :day="day.day"
              :data="listDataGroupDays[day.day]"
            />
          </div>
        </div>
      </div> -->
      <div
        class="z-10 sticky top-0 flex flex-row items-center bg-white dark:bg-g-900 pb-4 px-4"
      >
        <div class="flex-auto">
          <FinancyReportUserInfo :pane="pane" />
        </div>
        <div>
          <a-button type="primary" @click="onAddPay">
            {{ $t("form.financy.addPay") }}
          </a-button>
        </div>
      </div>

      <div class="bg-s-50 dark:bg-g-800 rounded-lg p-4">
        <FinancyTotal :pane="pane" @onEditPay="onEditPay" />
      </div>

      <div class="mt-4 bg-s-50 dark:bg-g-800 rounded-lg">
        <!-- {{ pane.workerId }} -->

        <div
          class="cursor-pointer flex flex-row items-center text-s-500 dark:text-g-300 p-4"
          @click="showTable = !showTable"
        >
          <div class="flex-auto">
            {{ $t("page.financy.everyDayReport") }}
          </div>
          <div>
            <VIcon
              :path="iChevronDown"
              :class="[showTable ? 'rotate-180' : '', 'transition-transform']"
            />
          </div>
        </div>
        <FinancyPaneTable
          v-if="showTable"
          :key="pane.workerId"
          :data="daysList"
          :pane="pane"
          :work-historys="listDataGroupDays"
        />
      </div>
    </div>
  </div>

  <a-modal
    v-model:open="open"
    destroyOnClose
    :key="`${pane.month?.toString()}_${dataForm.id}`"
    :title="`${
      dataForm.id ? $t('form.financy.editPay') : $t('form.financy.addPay')
    } - ${worker?.name}`"
    :ok-button-props="{ hidden: true }"
    :cancel-button-props="{ hidden: true }"
  >
    <VFormPay
      v-if="worker"
      :data="dataForm"
      :default-data="defaultData"
      @callback="
        () => {
          open = false;
        }
      "
    />
  </a-modal>
</template>
