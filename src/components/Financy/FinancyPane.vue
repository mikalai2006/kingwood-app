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

const month = ref(dayjs(props.pane.month) || "");
const workerId = ref<string>(props.pane.workerId || "");
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
      dayName: _date.format("dddd"),
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

  if (!workerId.value || !month.value) {
    return;
  }
  workHistoryStore.find({
    workerId: workerId.value ? [workerId.value] : undefined,
    from: month.value ? currentDate.value.startOf("month").format() : undefined,
    to: month.value ? currentDate.value.endOf("month").format() : undefined,
    $limit: 1000,
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
  console.log("Edit pay item: ", item);

  dataForm.value = { ...item };
  showModal();
};

onMounted(() => {
  onQuery(false);
});
</script>

<template>
  <div class="flex-auto flex flex-row items-stretch bg-white dark:bg-g-900/50">
    <div class="flex flex-row items-stretch basis-5/12 shrink-0 grow-1">
      <div class="py-4 pl-4 overflow-hidden w-full">
        <!-- {{ JSON.stringify(daysList) }} -->
        <div class="p-4 bg-s-100 dark:bg-g-800 rounded-lg">
          <a-form layout="vertical">
            <!-- <a-form-item :label="$t('form.order.name')" name="orderId">
            <a-select
              v-model:value="orderId"
              :placeholder="$t('form.financy.selectOrder')"
              :options="state.data"
              @search="onFetchOrders"
              :show-search="true"
              :filter-option="false"
              :not-found-content="state.value ? undefined : null"
              @change="onQuery"
            >
            </a-select>
          </a-form-item> -->

            <a-form-item :label="$t('form.financy.workerId')" name="workerId">
              <!-- {{ workerId }} -->
              <a-select
                v-model:value="workerId"
                show-search
                allowClear
                :options="workers"
                :placeholder="$t('form.taskWorker.selectWorkerId')"
                :filter-option="filterOption"
                @change="() => onQuery(true)"
              >
                <template #option="{ value, label, post }">
                  <div class="flex flex-row">
                    <div class="flex-auto">
                      {{ label }}
                    </div>
                    <div class="text-s-500">{{ post?.name }}</div>
                  </div>
                </template>
              </a-select>
            </a-form-item>

            <a-form-item :label="$t('form.financy.month')" name="month">
              <a-date-picker
                v-model:value="month"
                picker="month"
                @change="() => onQuery(true)"
              />
            </a-form-item>
          </a-form>
        </div>

        <div
          class="mt-4 p-4 bg-s-100 dark:bg-g-800 rounded-lg overflow-y-auto h-[calc(100vh_-_370px)] b-scroll"
        >
          <div class="text-s-500 dark:text-p-400 px-4">
            {{ $t("table.financy.totalByMonth") }}
          </div>
          <FinancyTotal
            :pane="pane"
            :key="pane.month?.toString()"
            @onEditPay="onEditPay"
          />

          <div>
            <a-button type="primary" @click="onAddPay">
              {{ $t("form.financy.addPay") }}
            </a-button>
          </div>
        </div>
      </div>
    </div>

    <div
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
      <FinancyPaneTable
        :data="daysList"
        :pane="pane"
        :work-historys="listDataGroupDays"
      />
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
