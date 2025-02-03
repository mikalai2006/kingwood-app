<script setup lang="ts">
import { IPaneOptionFinancy } from "@/api/types";
import { usePayStore, useUserStore, useWorkTimeStore } from "@/store";
import dayjs from "@/utils/dayjs";
import { getObjectTime } from "@/utils/time";
import { computed, onMounted } from "vue";

const props = defineProps<{
  pane: IPaneOptionFinancy;
}>();

const userStore = useUserStore();
const workTimeStore = useWorkTimeStore();
const payStore = usePayStore();

const worker = computed(() =>
  userStore.items.find((x) => x.id === props.pane.workerId)
);

const currentDate = computed(() => dayjs(dayjs(props.pane.month)));

const listData = computed(() => {
  const _list = workTimeStore.items
    .filter(
      (x) =>
        props.pane.workerId?.includes(x.workerId) &&
        dayjs(x.to).year() > 1 &&
        dayjs(x.to)
          .utc(true)
          .isBetween(
            dayjs(props.pane.month).utc(true).startOf("month"),
            dayjs(props.pane.month).utc(true).endOf("month"),
            "day",
            "[]"
          )
    )
    .map((x) => {
      const _totalMinutes = x.workHistory.reduce((a, b) => {
        const dayTo = dayjs(b.to);
        console.log(dayTo.year(), dayTo.diff(b.from));

        return a + (dayTo.year() != 1 ? dayTo.diff(b.from) : 0);
      }, 0);
      return {
        ...x,
        totalMinutes: _totalMinutes,
      };
    });
  return _list;
});

const totalMoney = computed(() =>
  listData.value.reduce((a, b) => a + b.total, 0)
);
const totalMinutesHistory = computed(() =>
  listData.value.reduce((a, b) => a + b.totalMinutes, 0)
);

const listPay = computed(() =>
  payStore.items.filter(
    (x) =>
      x.year == currentDate.value.year() &&
      x.month == currentDate.value.month() &&
      x.workerId == props.pane.workerId
  )
);

const totalPayed = computed(() =>
  listPay.value.reduce((a, b) => a + b.total, 0)
);

const onFindPays = () => {
  payStore.find({
    month: currentDate.value.month(),
    year: currentDate.value.year(),
    workerId: props.pane.workerId ? [props.pane.workerId] : undefined,
  });
};

onMounted(() => {
  onFindPays();
});
</script>

<template>
  <div>
    <!-- {{ JSON.stringify(totalMoney) }}
    {{ JSON.stringify(listPay, null, 2) }} -->

    <!-- {{ totalMoney }}|{{ totalPayed }} -->

    <div class="relative overflow-x-auto">
      <table class="w-full text-left rtl:text-right">
        <!-- <thead class="text-sm border-b dark:bg-g-800 dark:border-g-700">
          <tr>
            <th scope="col" class="font-normal px-4 py-3">
              {{ $t("table.financy.payName") }}
            </th>
            <th scope="col" class="font-normal px-4 py-3">
              {{ $t("table.financy.paySize") }}
            </th>
          </tr>
        </thead> -->
        <tbody>
          <tr class="border-b border-black/5 dark:bg-g-800 dark:border-g-700">
            <th
              scope="row"
              class="px-4 py-2 font-normal text-g-900 dark:text-white"
            >
              {{ $t("table.financy.totalZpMonth") }}
            </th>
            <td
              class="px-6 py-2 text-base text-right text-s-500 whitespace-nowrap dark:text-p-400"
            >
              {{ totalMoney.toLocaleString("ru-RU") }} ₽
            </td>
          </tr>
          <tr
            v-if="listPay.length"
            v-for="pay in listPay"
            :key="pay.id"
            class="border-b border-black/5 dark:bg-g-800 dark:border-g-700"
          >
            <th
              scope="row"
              class="px-4 py-2 font-normal text-g-900 dark:text-white"
            >
              {{ pay.name }}
            </th>
            <td
              class="px-6 py-2 text-base text-right text-s-800 dark:text-p-400 whitespace-nowrap"
            >
              {{ pay.total.toLocaleString("ru-RU") }} ₽
            </td>
          </tr>
        </tbody>
        <!-- <tfoot>
          <tr class="bg-white dark:bg-g-800">
            <th
              scope="row"
              class="px-6 py-4 font-medium text-g-900 whitespace-nowrap dark:text-white"
            >
              {{ $t("table.financy.payDolg") }}
            </th>
            <td class="px-6 py-4">{{ totalMoney - totalPayed }}</td>
          </tr>
        </tfoot> -->
      </table>
    </div>

    <div class="p-4 text-lg flex gap-4">
      <span class="flex-auto"> {{ $t("table.financy.payDolg") }}: </span>
      <b class="text-s-500 dark:text-p-400">
        {{ (totalMoney + totalPayed).toLocaleString("ru-RU") }} ₽
      </b>
      <!-- <div>
        <TimePretty :time="getObjectTime(totalMinutesHistory)" />
      </div> -->
    </div>
  </div>
</template>
