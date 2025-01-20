<script setup lang="ts" async>
import { useUserStore } from "@/store/modules/user";
import { computed, onMounted, ref } from "vue";
import dayjs from "@/utils/dayjs";
import {
  useAuthStore,
  useObjectStore,
  useOrderStore,
  useTaskStatusStore,
} from "@/store";
import { IOrder } from "@/api/order/types";
import { ITask } from "@/api/task/types";
import OrderTaskList from "@/components/Order/OrderTaskList.vue";
import { useI18n } from "vue-i18n";
import VIcon from "@/components/UI/VIcon.vue";
import { iCog } from "@/utils/icons";
import { Dayjs } from "dayjs";
import VHeader from "@/components/V/VHeader.vue";
import OrderList from "@/components/Order/OrderList.vue";
import useOrder from "@/composable/useOrder";

dayjs.locale("ru");
const userStore = useUserStore();
const orderStore = useOrderStore();
const taskStatusStore = useTaskStatusStore();
const objectStore = useObjectStore();
const authStore = useAuthStore();

const { t } = useI18n();

const {
  onAddNewItem,
  showOrderInfo,
  onOtgruzka,
  onEditItem,
  openTaskModal,
  dataTaskForm,
  defaultDataTask,
  open,
  dataForm,
  defaultData,
  openOtgruzka,
  dataFormOtgruzka,
  defaultDataOtgruzka,
  openOrderInfo,
  currentOrderInModal,
  onAddNewTask,
  onEditTask,

  columnKeys,
  columns,
  optionsForSelect,
  onSetColumns,

  dateFormStart,
  openDateStart,
  onDateStart,
  defaultDateStart,
} = useOrder();

// const onDeleteTask = (item: ITask) => {
//   console.log("Delete task: ", item);

//   // dataTaskForm.value = Object.assign({}, item);
//   // showTaskModal();

//   return new Promise((resolve) => {
//     setTimeout(() => resolve(true), 3000);
//   });
// };
// const showExpandIcon = (record) => {
//     const { expanded, onExpand } = record;
//     if(expanded){
//         return <DownOutlined onClick={e=>{onExpand(record, e)}}/>
//     }
//     else{
//         return <SomeOtherCustomIcon onClick={e=>{onExpand(record, e)}}
//     }
//   }
const querySearch = ref("");

const dateFormat = "DD.MM.YYYY";
const rangeSearch = ref<Dayjs[]>([
  // dayjs("01.01.2015", dateFormat),
  // dayjs("01.01.2015", dateFormat),

  dayjs(`01.01.${new Date().getFullYear()}`, dateFormat),
  dayjs(`31.12.${new Date().getFullYear()}`, dateFormat),
]);

const activeKey = ref("all");

const nameKeyLocalStorageColumns = ref("order.column");
const nameKeyLocalStorageRange = computed(() => "range.all");

const onChangeRange = (value: Dayjs[]) => {
  const _range = value.map((x) => x.format());
  // console.log("_range: ", _range);

  localStorage.setItem(nameKeyLocalStorageRange.value, JSON.stringify(_range));
};

onMounted(() => {
  // rangeSearch.value = [
  //   dayjs(`01.01.${new Date().getFullYear()}`, dateFormat),
  //   dayjs(`31.12.${new Date().getFullYear()}`, dateFormat),
  // ];

  // sync columns from localStorage.
  const _columns = localStorage.getItem(nameKeyLocalStorageColumns.value);
  if (_columns) {
    columnKeys.value = JSON.parse(_columns);
  }
  // sync range from localStorage.
  const _range = localStorage.getItem(nameKeyLocalStorageRange.value);
  if (_range) {
    const _data: string[] = JSON.parse(_range);
    rangeSearch.value = _data.map((x) => dayjs(x));
  }
});
</script>
<template>
  <div class="p-4 flex-auto">
    <!-- <VTitle :text="$t('page.order.title')" /> -->
    <VHeader :title="$t('page.order.title')" class="mb-4">
      <template #back>&nbsp;</template>
    </VHeader>

    <div class="flex flex-row items-center">
      <div class="flex-auto">
        <a-tooltip v-if="authStore.roles.includes('order-create')">
          <template #title>
            {{ $t("form.order.new") }}
          </template>

          <a-button type="primary" @click="onAddNewItem">
            {{ $t("form.add") }}
          </a-button>
        </a-tooltip>
      </div>
      <div class="flex gap-2 items-center">
        <a-popover
          :title="$t('table.order.fields')"
          trigger="click"
          placement="topRight"
        >
          <template #content>
            <div class="flex gap-2 items-center">
              <a-select
                v-model:value="columnKeys"
                mode="multiple"
                style="width: 100%; min-width: 200px"
                :placeholder="$t('table.order.fields')"
                :max-tag-count="3"
                :removeIcon="null"
                :options="optionsForSelect"
                @change="(value: string) => onSetColumns(value,nameKeyLocalStorageColumns,columnKeys)"
              >
                <template #maxTagPlaceholder="omittedValues">
                  <span style="color: red">
                    + {{ omittedValues.length }} ...
                  </span>
                </template>
                <!-- <template #option="{ value, label }">
            {{ label }}
          </template> -->
                <!-- <a-select-option
            v-for="col in columns"
            :value="col.key"
            :label="$t(`tabs.order.${col.key}`)"
          >
            <span role="img" aria-label="Japan">🇯🇵</span>
            {{ $t(`tabs.order.${col.key}`) }}
          </a-select-option> -->
              </a-select>
            </div>
          </template>
          <a-button type="text">
            <VIcon :path="iCog" class="text-lg" />
          </a-button>
        </a-popover>
      </div>
    </div>

    <a-tabs v-model:activeKey="activeKey">
      <a-tab-pane key="all" :tab="$t('tabs.order.all')">
        <div class="flex flex-row items-center">
          <div class="flex-auto">
            <!-- <a-input
              placeholder="Текст для поиска"
              v-model:value="querySearch"
            /> -->
          </div>
          <div>
            {{ $t("form.order.rangeSearch") }}
            <a-range-picker
              v-model:value="rangeSearch"
              :format="dateFormat"
              @change="onChangeRange"
            />
          </div>
        </div>
        <!-- :row-class-name="(_record: IOrder, index: number) => (_record.priority ? 'custom cursor-pointer bg-red-500/50' : 'cursor-pointer')"
        :row-class-name="(_record: IOrder, index: number) => (_record.priority ? 'cursor-pointer font-medium text-red-500 dark:text-red-300' : 'cursor-pointer')" 
        -->
        <OrderList
          :key="rangeSearch.map((x) => x.toString()).join('-')"
          keyList="all"
          :params="{
            from: rangeSearch[0].format(),
            to: rangeSearch[1].format(),
          }"
          :columns="columns"
          @show-order-info="showOrderInfo"
          @on-otgruzka="onOtgruzka"
          @on-edit-item="onEditItem"
          @on-date-start="onDateStart"
        />
      </a-tab-pane>
      <a-tab-pane key="notWork" :tab="$t('tabs.order.notWork')">
        <OrderList
          keyList="notWork"
          :params="{ status: 0 }"
          :columns="columns"
          @show-order-info="showOrderInfo"
          @on-otgruzka="onOtgruzka"
          @on-edit-item="onEditItem"
          @on-date-start="onDateStart"
        />
      </a-tab-pane>
      <a-tab-pane key="stolyarComplete" :tab="$t('tabs.order.stolyarComplete')">
        <OrderList
          keyList="stolyarComplete"
          :params="{ stolyarComplete: 1 }"
          :columns="columns"
          @show-order-info="showOrderInfo"
          @on-otgruzka="onOtgruzka"
          @on-edit-item="onEditItem"
          @on-date-start="onDateStart"
        />
      </a-tab-pane>
      <a-tab-pane key="malyarComplete" :tab="$t('tabs.order.malyarComplete')">
        <OrderList
          keyList="malyarComplete"
          :params="{ malyarComplete: 1 }"
          :columns="columns"
          @show-order-info="showOrderInfo"
          @on-otgruzka="onOtgruzka"
          @on-edit-item="onEditItem"
          @on-date-start="onDateStart"
        />
      </a-tab-pane>
      <a-tab-pane key="goComplete" :tab="$t('tabs.order.goComplete')">
        <OrderList
          keyList="goComplete"
          :params="{ goComplete: 1, montajComplete: 0 }"
          :columns="columns"
          @show-order-info="showOrderInfo"
          @on-otgruzka="onOtgruzka"
          @on-edit-item="onEditItem"
          @on-date-start="onDateStart"
        />
      </a-tab-pane>
      <!-- <a-tab-pane key="montajComplete" :tab="$t('tabs.order.montajComplete')">
        <OrderList
          :params="{ montajComplete: 1 }"
          :columns="columns"
          @show-order-info="showOrderInfo"
          @on-otgruzka="onOtgruzka"
          @on-edit-item="onEditItem"
          @on-date-start="onDateStart"
        />
      </a-tab-pane> -->
      <a-tab-pane key="completed" :tab="$t('tabs.order.completed')">
        <OrderList
          keyList="completed"
          :params="{ status: 100 }"
          :columns="columns"
          @show-order-info="showOrderInfo"
          @on-otgruzka="onOtgruzka"
          @on-edit-item="onEditItem"
          @on-date-start="onDateStart"
        />
      </a-tab-pane>
    </a-tabs>
  </div>

  <a-modal
    v-model:open="openTaskModal"
    :destroyOnClose="true"
    :key="dataTaskForm.id"
    :maskClosable="false"
    :title="dataTaskForm.id ? $t('form.task.edit') : $t('form.task.new')"
    :ok-button-props="{ hidden: true }"
    :cancel-button-props="{ hidden: true }"
  >
    <VFormTask
      :data="dataTaskForm"
      :default-data="defaultDataTask"
      @callback="
        () => {
          openTaskModal = false;
        }
      "
    />
  </a-modal>

  <a-modal
    v-model:open="open"
    :destroyOnClose="true"
    :key="new Date().getMilliseconds()"
    :maskClosable="false"
    :title="dataForm.id ? $t('form.order.edit') : $t('form.order.new')"
    :ok-button-props="{ hidden: true }"
    :cancel-button-props="{ hidden: true }"
  >
    <VFormOrder
      :data="dataForm"
      :default-data="defaultData"
      @callback="
        () => {
          open = false;
        }
      "
    />
  </a-modal>

  <a-modal
    v-model:open="openOtgruzka"
    :destroyOnClose="true"
    :title="$t('button.otgruzka')"
    :maskClosable="false"
    :ok-button-props="{ hidden: true }"
    :cancel-button-props="{ hidden: true }"
  >
    <VFormOrderOtgruzka
      :data="dataFormOtgruzka"
      :default-data="defaultDataOtgruzka"
      @callback="
        () => {
          openOtgruzka = false;
        }
      "
    />
  </a-modal>

  <a-modal
    v-model:open="openDateStart"
    :destroyOnClose="true"
    :title="$t('button.dateStart')"
    :maskClosable="false"
    :ok-button-props="{ hidden: true }"
    :cancel-button-props="{ hidden: true }"
  >
    <VFormOrderDateStart
      :data="dateFormStart"
      :default-data="defaultDateStart"
      @callback="
        () => {
          openDateStart = false;
        }
      "
    />
  </a-modal>

  <a-modal
    v-model:open="openOrderInfo"
    width="1000px"
    :key="currentOrderInModal?.id"
    wrapClassName="b-scroll"
    :maskClosable="false"
    :ok-button-props="{ hidden: true }"
    :cancel-text="$t('button.close')"
    @cancel="
      () => {
        openOrderInfo = false;
      }
    "
  >
    <template #title>
      <p class="text-xl">
        {{ currentOrderInModal?.object?.name }} №{{
          currentOrderInModal?.number
        }}
        -
        {{ currentOrderInModal?.name }}
      </p>
    </template>
    <div v-if="currentOrderInModal" class="-mt-4 -ml-4 pl-4 py-4">
      <OrderTaskList
        :order-id="currentOrderInModal.id"
        @on-edit-task="onEditTask"
      />
      <a-button
        v-if="
          // currentOrderInModal.status < 100 &&
          authStore.roles.includes('task-create')
        "
        @click="onAddNewTask(currentOrderInModal)"
        class="mt-2"
      >
        {{ $t("form.task.add") }}
      </a-button>
    </div>
  </a-modal>
</template>

<style scoped></style>
