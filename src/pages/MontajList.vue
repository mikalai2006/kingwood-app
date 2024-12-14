<script setup lang="ts" async>
import { useUserStore } from "@/store/modules/user";
import { computed, onMounted, reactive, ref } from "vue";
import dayjs from "@/utils/dayjs";
import {
  useObjectStore,
  useOrderStore,
  useTaskStatusStore,
  useTaskStore,
} from "@/store";
import { IOrder, IOrderInput } from "@/api/order/types";
import { ITask, ITaskInput } from "@/api/task/types";
import OrderTaskList from "@/components/Order/OrderTaskList.vue";
import OrderActiveTask from "@/components/Order/OrderActiveTask.vue";
import { useI18n } from "vue-i18n";
import VIcon from "@/components/UI/VIcon.vue";
import { iSearch } from "@/utils/icons";
import colors from "tailwindcss/colors";
import { Dayjs } from "dayjs";

dayjs.locale("ru");
const userStore = useUserStore();
const orderStore = useOrderStore();
const taskStatusStore = useTaskStatusStore();
const objectStore = useObjectStore();
const taskStore = useTaskStore();

const { t } = useI18n();

taskStore.find({ name: "Монтаж" });

const ordersForMontaj = computed(() =>
  orderStore.items
    .filter((x) => x.priority === 1)
    .map((x) => {
      const taskMontaj = taskStore.items.find(
        (y) =>
          y.orderId === x.id &&
          (y.name.toLowerCase().indexOf("монтаж") > -1 ||
            y.name.toLowerCase().indexOf("упаковка") > -1)
      );
      return {
        ...x,
        taskMontaj,
      };
    })
);

const defaultData: IOrderInput = {};

const dataForm = ref(defaultData);

const open = ref<boolean>(false);

const showModal = () => {
  open.value = true;
};

const week = ref<Dayjs>(dayjs(new Date()));

const dateFormat = "DD MMMM YYYY";
const weekFormat = "DD MMM YYYY";

const daysOfSelectWeek = ref<string[]>([]);

const onCreateWeekDays = (startDay: Dayjs) => {
  daysOfSelectWeek.value = Array(7)
    .fill(startDay)
    .map((el: Dayjs, idx) => {
      const newD = el.add(idx, "day").format(dateFormat);
      return newD;
    });
};

const onChangeWeek = (date: Dayjs, dateString: string) => {
  // console.log("onChangeWeek: ", date);

  const startDay = date.startOf("week"); //.format(weekFormat);

  onCreateWeekDays(startDay);
  // const result = [];

  // for (let i = 0; i< 7; i++) {

  // }
};

const customWeekStartEndFormat = (value: Dayjs) => {
  return `${dayjs(value).startOf("week").format(weekFormat)} ~ ${dayjs(value)
    .endOf("week")
    .format(weekFormat)}`;
};

onMounted(() => {
  onCreateWeekDays(week.value.startOf("week"));
});
</script>
<template>
  <div class="h-full flex flex-row items-stretch">
    <div class="flex-auto p-4">
      <VTitle :text="$t('page.montajList.title')" />
      <div class="">
        <div class="flex flex-row items-center">
          <a-date-picker
            v-model:value="week"
            picker="week"
            :format="customWeekStartEndFormat"
            @change="onChangeWeek"
          />
          <!-- {{ week }}
      <br />
      <pre>
        {{ JSON.stringify(daysOfSelectWeek, null, 2) }}
      </pre> -->
        </div>
      </div>
      <table
        class="mt-4 border-collapse border border-s-200 dark:border-g-700 w-full overflow-x-auto rounded"
      >
        <thead>
          <tr>
            <td></td>
            <th
              v-for="day in daysOfSelectWeek"
              :key="day"
              class="px-4 text-normal border border-s-200 dark:border-g-700"
            >
              {{
                day
                  .split(" ")
                  .slice(0, day.split(" ").length - 1)
                  .join(" ")
              }}
              <a-button size="small" @click="">
                {{ $t("button.edit") }}
              </a-button>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in ordersForMontaj" :key="order.id">
            <th class="w-64 py-4 border border-s-200 dark:border-g-700">
              <span class="text-base font-normal leading-4">
                {{ order.name }} / {{ order.id }} / {{ order.taskMontaj?.name }}
              </span>
            </th>
            <td
              v-for="day in daysOfSelectWeek"
              :key="day"
              class="border border-s-200 dark:border-g-700"
            >
              <div class="text-left px-4">
                <!-- <a-button @click="">
                  {{ $t("form.create") }}
                </a-button> -->
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="w-64 border-l border-s-100 dark:border-g-700">aside</div>
  </div>
  <!-- 
  <a-modal
    v-model:open="openOrderInfo"
    width="1000px"
    :key="currentOrderInModal?.id"
    @ok=""
  >
    <template #title>
      <p class="text-xl">
        {{ currentOrderInModal?.name }}
      </p>
    </template>
    <div v-if="currentOrderInModal" class="-mt-4 -ml-4 pl-4 py-4">
      <OrderTaskList
        :order-id="currentOrderInModal.id"
        @on-edit-task="onEditTask"
      />
      <a-button @click="onAddNewTask(currentOrderInModal.id)" class="mt-2">
        {{ $t("form.task.add") }}
      </a-button>
    </div>
  </a-modal> -->
</template>
