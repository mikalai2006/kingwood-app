<script setup lang="ts">
import { IOrder } from "@/api/order/types";
import { IPaneOptionFinancy } from "@/api/types";
import {
  useAuthStore,
  useObjectStore,
  useOrderStore,
  usePayStore,
  useUserStore,
  useWorkHistoryStore,
} from "@/store";
import dayjs from "@/utils/dayjs";
import { groupBy } from "lodash-es";
import { computed, onMounted, ref } from "vue";
import VIcon from "../UI/VIcon.vue";
import { iChange, iChevronDown, iPen } from "@/utils/icons";
import { IObject } from "@/api/object/types";
import { IPay } from "@/api/pay/types";

const props = defineProps<{
  pane: IPaneOptionFinancy;
}>();

const emit = defineEmits(["onEditPay"]);

const authStore = useAuthStore();
const userStore = useUserStore();
const workHistoryStore = useWorkHistoryStore();
const orderStore = useOrderStore();
const objectStore = useObjectStore();
const payStore = usePayStore();

const worker = computed(() =>
  userStore.items.find((x) => x.id === props.pane.workerId)
);

const currentDate = computed(() => dayjs(dayjs(props.pane.month)));

const listData = computed(() => {
  const _list = workHistoryStore.items
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
      // const _totalMinutes = x.workHistory.reduce((a, b) => {
      //   const dayTo = dayjs(b.to);
      //   // console.log(dayTo.year(), dayTo.diff(b.from));

      //   return a + (dayTo.year() != 1 ? dayTo.diff(b.from) : 0);
      // }, 0);
      return {
        ...x,
        totalMinutes: dayjs(x.to).year() != 1 ? dayjs(x.to).diff(x.from) : 0,
      };
    });
  return _list;
});

const totalMoney = computed(() =>
  listData.value.reduce((a, b) => a + b.total, 0)
);

const totalMoneyGroupOrder = computed(() => {
  const _list = workHistoryStore.items
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
      return {
        ...x,
      };
    });

  const _group = groupBy(_list, "orderId");
  const _result: {
    [key: string]: {
      total: number;
      order: IOrder | undefined;
      object: IObject | undefined;
    };
  } = {};

  for (const key in _group) {
    const _order = orderStore.items.find((x) => x.id === key);
    _result[key] = {
      total: _group[key].reduce((a, e) => a + e.total, 0),
      order: _order,
      object: objectStore.items.find((x) => x.id === _order?.objectId),
    };
  }

  return _result;
});

const totalByOrders = computed(() => {
  return Object.values(totalMoneyGroupOrder.value).reduce(
    (a, e) => a + e.total,
    0
  );
});

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

const showDetails = ref(false);

const payViewChangedId = ref("");
const showPayChanged = ref(false);
const onViewChanged = (item: IPay) => {
  payViewChangedId.value = item.id;
  showPayChanged.value = true;
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
      <table class="w-full text-left rtl:text-right border-collapse">
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
          <tr
            class="cursor-pointer border-b border-black/5 dark:border-g-900"
            @click="showDetails = !showDetails"
          >
            <td
              scope="row"
              class="px-4 py-2 font-normal text-g-900 dark:text-white"
            >
              <div class="flex gap-2 items-center">
                <VIcon
                  :path="iChevronDown"
                  :class="[
                    showDetails ? 'rotate-180' : '',
                    'transition-transform',
                  ]"
                />
                {{ $t("table.financy.totalZpMonth") }}
              </div>
            </td>
            <td
              class="px-6 py-2 text-base text-right text-s-500 whitespace-nowrap dark:text-p-400"
            >
              {{ totalMoney.toLocaleString("ru-RU") }} ₽
            </td>
          </tr>
          <tr
            v-if="showDetails"
            class="border-b border-black/5 dark:border-g-900 text-g-500 dark:text-g-400"
          >
            <td colspan="2">
              <div class="bg-s-200 dark:bg-g-900 rounded-lg text-sm">
                <div
                  v-for="item in totalMoneyGroupOrder"
                  class="flex items-center"
                >
                  <div class="flex-auto px-4 py-2 font-normal">
                    {{ item.order?.number ? "№" + item.order?.number + " " : ""
                    }}{{ item.order?.name }}, {{ item.object?.name }}
                  </div>
                  <div
                    class="px-6 py-2 text-right text-s-500 whitespace-nowrap dark:text-p-400"
                  >
                    {{ item.total.toLocaleString("ru-RU") }} ₽
                  </div>
                </div>
                <!-- <div class="flex items-center">
                  <div class="flex-auto px-4 py-2">
                    {{ $t("table.financy.otherWorks") }}
                  </div>
                  <div
                    class="px-6 py-2 text-right text-s-500 whitespace-nowrap dark:text-p-400"
                  >
                    {{ (totalMoney - totalByOrders).toLocaleString("ru-RU") }} ₽
                  </div>
                </div> -->
              </div>
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

              <a-tooltip>
                <template #title>
                  {{ $t("modal.changedPayButton") }}
                </template>
                <a-button
                  v-if="
                    pay.props &&
                    Object.values(pay.props).length &&
                    authStore.roles.includes('pay-view-changes')
                  "
                  type="text"
                  class="p-0"
                  @click="
                    () => {
                      onViewChanged(pay);
                    }
                  "
                >
                  <a-badge :count="Object.values(pay.props).length">
                    <div class="flex gap-2 px-2.5">
                      <VIcon :path="iChange" />
                    </div>
                  </a-badge>
                </a-button>
              </a-tooltip>
            </th>
            <td
              class="px-6 py-2 text-base text-right text-s-800 dark:text-p-400 whitespace-nowrap"
            >
              {{ pay.total.toLocaleString("ru-RU") }} ₽

              <a-tooltip v-if="authStore.roles?.includes('pay-patch')">
                <template #title>
                  {{ $t("button.edit") }}
                </template>
                <a-button
                  size="small"
                  type="text"
                  @click="emit('onEditPay', pay)"
                >
                  <div class="flex gap-1 items-center">
                    <VIcon :path="iPen" class="text-xs" />
                  </div>
                </a-button>
              </a-tooltip>
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

  <a-modal
    v-model:open="showPayChanged"
    :style="{ width: '800px' }"
    :destroyOnClose="true"
    :title="$t('modal.changedPayTitle')"
    :maskClosable="false"
    :ok-button-props="{ hidden: true }"
    :cancel-button-props="{ hidden: true }"
  >
    <FinancyPayChanges :pay-id="payViewChangedId" />
  </a-modal>
</template>
