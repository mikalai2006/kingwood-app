<script setup lang="ts">
import { IPaneOptionFinancy, IPaneOptionFinancyInput } from "@/api/types";
import useOrder from "@/composable/useOrder";
import { useUserStore } from "@/store";
import dayjs from "@/utils/dayjs";
import { computed, onMounted, ref } from "vue";
import { IPay, IPayInput } from "@/api/pay/types";
import VFormPay from "../Form/VFormPay.vue";
import FinancyReportPaneUsers from "./FinancyReportPaneUsers.vue";
import FinancyReportTotal from "./FinancyReportTotal.vue";
import FinancyReportForm from "./FinancyReportForm.vue";
import { iChevronDown } from "@/utils/icons";
import FinancyReportUserInfo from "./FinancyReportUserInfo.vue";
import { getStatByMonth } from "@/api/work_history";
import { IWorkHistoryStatByMonth } from "@/api/work_history/types";
import FinancyReportPaneUser from "./FinancyReportPaneUser.vue";

const props = defineProps<{
  pane: IPaneOptionFinancy;
}>();

const emit = defineEmits({
  onChangeTabPane: (data: IPaneOptionFinancyInput) => {
    return `true`;
  },
});

const userStore = useUserStore();
// const postStore = usePostStore();
// const workHistoryStore = useWorkHistoryStore();

const month = computed(() => dayjs(props.pane?.month) || "");
const workerId = computed<string>(() => props.pane?.workerId || "");
// const orderId = ref(props.pane?.orderId);

const currentDate = computed(() => dayjs(month.value));

// const workers = computed(() => {
//   return userStore.items
//     .filter((x) => !x.hidden)
//     .map((x) => {
//       const post = postStore.items.find((y) => y.id === x.postId);
//       return {
//         post,
//         value: x.id,
//         label: x.name,
//       };
//     });
// });
// const filterOption = (input: string, option: IFormOptionFilter) => {
//   return option.label.toUpperCase().indexOf(input.toUpperCase()) >= 0;
// };

const worker = computed(() =>
  userStore.items.find((x) => x.id === workerId.value)
);

// const onQuery = (isSaveOption: boolean) => {
//   const data: IPaneOptionFinancyInput = {
//     ...props.pane,
//     month: month.value?.toString(),
//     monthIndex: month.value.month(),
//     orderId: orderId.value,
//     workerId: workerId.value,
//     title: worker.value
//       ? `${getShortFIO(worker.value.name)} - ${currentDate.value.format(
//           "YYYY-MM"
//         )}`
//       : props.pane.title,
//   };
//   if (isSaveOption) {
//     emit("onChangeTabPane", data);
//   }

//   if (!month.value) {
//     return;
//   }
//   workHistoryStore
//     .find({
//       // workerId: workerId.value ? [workerId.value] : undefined,
//       from: month.value
//         ? currentDate.value.startOf("month").format()
//         : undefined,
//       to: month.value ? currentDate.value.endOf("month").format() : undefined,
//       $limit: 10000,
//     })
//     .then((r) => {
//       // if (!r.data?.length) {
//       emit("onChangeTabPane", {
//         ...props.pane,
//         workerId: undefined,
//       });
//       // }
//     });
// };

const statData = ref<IWorkHistoryStatByMonth[]>([]);

const idsWorkerWithWorkHistory = computed<string[]>(() => {
  return [
    ...new Set(
      statData.value?.reduce((ac, el) => {
        el.workers.length && ac.push(...el.workers);
        return ac;
      }, [] as string[])
    ),
  ];
});

const loading = ref(false);

const onQueryStat = async () => {
  loading.value = true;

  await getStatByMonth({
    from: props.pane.month
      ? currentDate.value.startOf("month").format()
      : undefined,
    to: props.pane.month
      ? currentDate.value.endOf("month").format()
      : undefined,
    $limit: 10000,
    status: 1,
  }).then((r) => {
    statData.value = r ? r.sort((a, b) => a.total - b.total) : [];
    return r;
  });

  loading.value = false;
};

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

onMounted(() => {
  onQueryStat();
});
</script>

<template>
  <div class="flex-auto flex flex-row items-stretch bg-white dark:bg-g-900/50">
    <div class="flex flex-row items-stretch basis-3/12 shrink-0 grow-1 gap-4">
      <div class="p-4 overflow-hidden w-full">
        <!-- {{ JSON.stringify(daysList) }} -->
        <div class="bg-s-100 dark:bg-g-800 rounded-lg">
          <FinancyReportForm
            :pane="pane"
            @onChangeTabPane="
              ($event) => {
                emit('onChangeTabPane', $event);
                // onQuery();
              }
            "
          />
        </div>
        <!-- {{ JSON.stringify(props.pane) }} -->
        <div
          v-if="props.pane.month"
          class="mt-4 p-2 bg-s-100 dark:bg-g-800 rounded-lg overflow-y-auto max-h-[calc(100vh_-_235px)] b-scroll"
        >
          <div
            class="cursor-pointer flex flex-row items-center text-base text-s-500 dark:text-g-300 py-4 px-2"
            @click="showTotal = !showTotal"
          >
            <div class="pr-2">
              <a-spin v-if="loading" />
              <VIcon
                v-else
                :path="iChevronDown"
                :class="[showTotal ? 'rotate-180' : '', 'transition-transform']"
              />
            </div>
            <div class="flex-auto">
              {{ $t("table.financy.totalByMonth") }}
            </div>
          </div>
          <FinancyReportTotal
            v-if="showTotal"
            :pane="pane"
            :statData="statData"
            :key="pane.month?.toString()"
            @onEditPay="onEditPay"
          />
        </div>
        <a-alert v-else :message="$t('form.selectDate')" type="error" banner />
      </div>
    </div>

    <div v-if="!loading" class="basis-2/12 shrink-0 grow-1 min-w-80">
      <div
        class="mt-4 rounded-lg overflow-y-auto h-[calc(100vh_-_165px)] b-scroll"
      >
        <FinancyReportPaneUsers
          :pane="pane"
          :idsWorkers="idsWorkerWithWorkHistory"
          @on-change-tab-pane="emit('onChangeTabPane', $event)"
        />
      </div>
    </div>

    <div
      v-if="!loading && idsWorkerWithWorkHistory.length"
      class="flex-auto flex flex-col items-stretch m-4"
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
      <div v-if="pane.workerId" class="flex flex-row items-center pb-4 px-4">
        <div class="flex-auto">
          <FinancyReportUserInfo :pane="pane" />
        </div>
        <div>
          <a-button type="primary" @click="onAddPay">
            {{ $t("form.financy.addPay") }}
          </a-button>
        </div>
      </div>
      <div class="overflow-y-scroll h-[calc(100vh_-_170px)] b-scroll relative">
        <FinancyReportPaneUser :key="pane?.workerId" :pane="pane" />
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
