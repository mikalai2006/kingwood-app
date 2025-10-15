<script setup lang="ts">
import { computed, onMounted, ref } from "vue";

import { IPaneOptionFinancy } from "@/api/types";
import { usePayStore, useWorkHistoryStore } from "@/store";
import dayjs from "dayjs";
import groupBy from "lodash-es/groupBy";
import { iChevronDown } from "@/utils/icons";

const props = defineProps<{
  pane: IPaneOptionFinancy;
}>();
const emit = defineEmits(["onEditPay"]);

const workHistoryStore = useWorkHistoryStore();
const payStore = usePayStore();

const month = computed(() => dayjs(props.pane?.month) || "");
const workerId = computed<string>(() => props.pane?.workerId || "");
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

const showTable = ref(false);

const onFindPays = () => {
  payStore.find({
    month: currentDate.value.month(),
    year: currentDate.value.year(),
    workerId: props.pane.workerId ? [props.pane.workerId] : undefined,
  });
};

const loading = ref(false);
onMounted(async () => {
  if (!props.pane.workerId) {
    return;
  }

  onFindPays();

  loading.value = true;

  await workHistoryStore.find({
    workerId: props.pane.workerId ? [props.pane.workerId] : undefined,
    from: props.pane.month
      ? currentDate.value.startOf("month").format()
      : undefined,
    to: props.pane.month
      ? currentDate.value.endOf("month").format()
      : undefined,
    $limit: 10000,
  });

  loading.value = false;
});
</script>

<template>
  <div v-if="loading" class="absolute inset-0 pt-24 px-12 z-[99999]">
    <div class="flex items-center justify-center">
      <a-spin size="large" />
    </div>
  </div>
  <template v-else>
    <a-alert
      v-if="!pane.workerId"
      :message="$t('form.selectUser')"
      type="warning"
      banner
    />
    <template v-else>
      <div class="bg-s-50 dark:bg-g-800 rounded-lg p-4">
        <FinancyTotal
          :pane="pane"
          :key="pane?.workerId"
          @onEditPay="emit('onEditPay')"
        />
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
    </template>
  </template>
</template>
