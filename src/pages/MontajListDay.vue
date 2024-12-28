<script setup lang="ts" async>
import { computed, onMounted, reactive, ref } from "vue";
import draggable from "vuedraggable";

import { useUserStore } from "@/store/modules/user";
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
import { useRoute } from "vue-router";
import { dateFormat } from "@/utils/date";
import MontajWorkerList from "@/components/Montaj/MontajWorkerList.vue";

dayjs.locale("ru");
const userStore = useUserStore();
const orderStore = useOrderStore();
const taskStatusStore = useTaskStatusStore();
const objectStore = useObjectStore();
const taskStore = useTaskStore();

const { t } = useI18n();

const route = useRoute();

const ordersForMontaj = computed(() =>
  orderStore.items
    .filter((x) => x.group?.includes("create_complete") && x.status === 1)
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

const open = ref<boolean>(false);

const showModal = () => {
  open.value = true;
};

const params = route.params;
const { day } = params;

const currentDay = computed(() =>
  day ? dayjs(day as string).format(dateFormat) : null
);

let idGlobal = 100;
const clone = ({ name }: { name: string }) => {
  return { name, id: idGlobal++ };
};
const controlOnStart = ref(false);
const pullFunction = () => {
  return controlOnStart.value ? "clone" : true;
};
const start = ({ originalEvent }: { originalEvent: KeyboardEvent }) => {
  controlOnStart.value = originalEvent.ctrlKey;
};
const list1 = ref({});

onMounted(async () => {
  await orderStore.find({ group: ["create_complete"], status: 1 });

  if (ordersForMontaj.value.length > 0) {
    for (const item of ordersForMontaj.value) {
      list1.value[item.id] = [];
    }
  }
});

const onEndDrag = (e: Event) => {
  console.log("onEndDrag", e);
};
</script>
<template>
  <div class="h-full flex flex-row items-stretch">
    <div class="flex-auto p-4">
      <VTitle :text="$t('page.montajList.title')" />
      <div class="">
        <div class="flex flex-row items-center">
          <a-breadcrumb>
            <a-breadcrumb-item>
              <RouterLink to="/montajList">
                {{ $t("page.montajList.title") }}
              </RouterLink>
            </a-breadcrumb-item>
            <a-breadcrumb-item v-if="$route.params.day">
              {{ currentDay }}
            </a-breadcrumb-item>
          </a-breadcrumb>
          <!-- <a-date-picker
            v-model:value="week"
            picker="week"
            :format="customWeekStartEndFormat"
            @change="onChangeWeek"
          /> -->
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
            <th class="px-4 text-normal border border-s-200 dark:border-g-700">
              {{ currentDay }}
              <!-- <a-button size="small" @click="">
                {{ $t("button.edit") }}
              </a-button> -->
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
            <td class="border border-s-200 dark:border-g-700">
              <div class="text-left px-4">
                {{ order.id }}
                <draggable
                  class="dragArea list-group"
                  :list="list1[order.id]"
                  :id="order.id"
                  :clone="clone"
                  :group="{ name: 'people', pull: pullFunction }"
                  @start="start"
                  item-key="id"
                  @end="onEndDrag"
                >
                  <template #item="{ element }">
                    <div class="list-group-item cursor-move">
                      {{ element.name }}
                    </div>
                  </template>
                </draggable>
                <!-- <a-button @click="">
                  {{ $t("form.create") }}
                </a-button> -->
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="w-4/12 border-l border-s-100 dark:border-g-700">
      <MontajWorkerList @onEndDrag="onEndDrag" />
    </div>
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
