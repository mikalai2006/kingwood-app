<script setup lang="ts" async>
import { useUserStore } from "@/store/modules/user";
import { computed, onMounted, reactive, ref } from "vue";
import dayjs from "@/utils/dayjs";
import {
  useObjectStore,
  useOperationStore,
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
const operationStore = useOperationStore();

const { t } = useI18n();

orderStore.find({ status: 4 });

const idsInstallOperation = computed(() =>
  operationStore.items.filter((x) => x.group === "install")
);

const ordersForMontaj = computed(() =>
  orderStore.items
    .filter((x) => x.status === 4)
    .map((x) => {
      const taskMontaj = taskStore.items.filter(
        (y) => y.orderId === x.id && y.name.toLowerCase().indexOf("монтаж") > -1
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
const onAddNewItem = () => {
  dataForm.value = defaultData;
  showModal();
};

const week = ref<Dayjs>(dayjs(new Date()));

const dateFormat = "DD MMMM YYYY";
const weekFormat = "DD MMM YYYY";

const daysOfSelectWeek = ref<{ dayString: string; day: Dayjs }[]>([]);

const onCreateWeekDays = (startDay: Dayjs) => {
  daysOfSelectWeek.value = Array(7)
    .fill(startDay)
    .map((el: Dayjs, idx) => {
      const newD = el.add(idx, "day");
      return { dayString: newD.format(dateFormat), day: newD };
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
      <div class="flex-auto">
        <a-button type="primary" @click="onAddNewItem">
          {{ $t("form.add") }}
        </a-button>
      </div>
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
            <td class="px-4 text-normal border border-s-200 dark:border-g-700">
              Объект
            </td>
            <!-- <td class="px-4 text-normal border border-s-200 dark:border-g-700">
              Исполнитель
            </td> -->
            <th
              v-for="day in daysOfSelectWeek"
              :key="day.dayString"
              class="px-4 text-normal border border-s-200 dark:border-g-700"
            >
              {{
                day.dayString
                  .split(" ")
                  .slice(0, day.dayString.split(" ").length - 1)
                  .join(" ")
              }}
              <RouterLink
                :to="{
                  name: 'montajListDay',
                  params: {
                    day: day.day.toISOString(),
                  },
                }"
              >
                {{ $t("button.edit") }}
              </RouterLink>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in ordersForMontaj" :key="order.id">
            <th class="w-64 py-4 border border-s-200 dark:border-g-700">
              <span class="text-base font-normal leading-4">
                {{ order.name }} / {{ order.id }} /
                {{ order.taskMontaj[0]?.name }}
              </span>
            </th>
            <!-- <th class="w-64 py-4 border border-s-200 dark:border-g-700">
              <span class="text-base font-normal leading-4">
                Исполнитель 1
              </span>
            </th> -->
            <td
              v-for="day in daysOfSelectWeek"
              :key="day.dayString"
              class="border border-s-200 dark:border-g-700 m-0 p-0"
            >
              <!-- <div class="text-left px-4 bg-s-400 w-full h-8">
                <a-button @click="">
                  {{ $t("form.create") }}
                </a-button>
              </div> -->
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <a-modal
    v-model:open="open"
    width="1000px"
    :key="dataForm?.id"
    @ok="
      () => {
        open = false;
      }
    "
  >
    <template #title>
      <p class="text-xl">
        {{ dataForm?.name }}
      </p>
    </template>
    <div v-if="dataForm" class="-mt-4 -ml-4 pl-4 py-4">
      <!-- <OrderTaskList
        :order-id="dataForm.id"
        @on-edit-task="onEditTask"
      />
      <a-button @click="onAddNewTask(dataForm.id)" class="mt-2">
        {{ $t("form.task.add") }}
      </a-button> -->
    </div>
  </a-modal>
</template>
