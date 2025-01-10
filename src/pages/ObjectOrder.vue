<script setup lang="ts" async>
import { useUserStore } from "@/store/modules/user";
import { computed, onMounted, reactive, ref } from "vue";
import dayjs from "@/utils/dayjs";
import { useObjectStore, useOrderStore, useTaskStatusStore } from "@/store";
import { IOrder, IOrderInput } from "@/api/order/types";
import { ITask, ITaskInput } from "@/api/task/types";
import OrderTaskList from "@/components/Order/OrderTaskList.vue";
import OrderActiveTask from "@/components/Order/OrderActiveTask.vue";
import { useI18n } from "vue-i18n";
import VIcon from "@/components/UI/VIcon.vue";
import { iPen, iSearch } from "@/utils/icons";
import colors from "tailwindcss/colors";
import { Dayjs } from "dayjs";
import { getShortFIO } from "@/utils/utils";
import { useRoute } from "vue-router";
import useOrder from "@/composable/useOrder";

dayjs.locale("ru");

const route = useRoute();

const { objectId } = route.params;

const userStore = useUserStore();
const orderStore = useOrderStore();
const taskStatusStore = useTaskStatusStore();
const objectStore = useObjectStore();

const { t } = useI18n();

const object = computed(() => objectStore.items.find((x) => x.id === objectId));

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
} = useOrder();

const dateFormat = "DD.MM.YYYY";
const rangeSearch = ref<[Dayjs, Dayjs]>([
  dayjs("01.01.2015", dateFormat),
  dayjs("01.01.2015", dateFormat),
]);

const state = reactive({
  searchText: "",
  searchedColumn: "",
});

const activeKey = ref("all");

const nameKeyLocalStorageColumns = ref("objectOrder.column");

onMounted(async () => {
  rangeSearch.value = [
    dayjs(`01.01.${new Date().getFullYear()}`, dateFormat),
    dayjs(`31.12.${new Date().getFullYear()}`, dateFormat),
  ];

  // sync columns from localStorage.
  const _columns = localStorage.getItem(nameKeyLocalStorageColumns.value);
  if (_columns) {
    columnKeys.value = JSON.parse(_columns);
  }
});
</script>
<template>
  <div class="p-4">
    <!-- <VTitle :text="$t('page.order.title')" /> -->
    <!-- <a-page-header
      :title="object?.name"
      :sub-title="$t('page.order.title')"
      class="border-b border-s-200 dark:border-g-700"
      @back="
        () => {
          $router.back();
        }
      "
    /> -->
    <VHeader v-if="object" :title="object.name" class="mb-4" />
    <div class="flex flex-row items-center">
      <div class="flex-auto">
        <a-button type="primary" @click="onAddNewItem">
          {{ $t("form.add") }}
        </a-button>
      </div>
      <div></div>
      <div class="flex gap-2">
        <span class="whitespace-nowrap">
          {{ $t("table.order.fields") }}
        </span>
        <a-select
          v-model:value="columnKeys"
          mode="multiple"
          style="width: 100%; min-width: 200px"
          :placeholder="$t('table.order.fields')"
          :max-tag-count="3"
          :removeIcon="null"
          :options="optionsForSelect"
          @change="(value: string) => onSetColumns(value, nameKeyLocalStorageColumns, columnKeys)"
        >
          <template #maxTagPlaceholder="omittedValues">
            <span style="color: red">+ {{ omittedValues.length }} ...</span>
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
    </div>

    <a-tabs v-model:activeKey="activeKey">
      <a-tab-pane key="all" :tab="$t('tabs.order.all')" force-render>
        <div class="flex flex-row items-center">
          <div class="flex-auto"></div>
          <div>
            <a-range-picker v-model:value="rangeSearch" :format="dateFormat" />
          </div>
        </div>
        <!-- :row-class-name="(_record: IOrder, index: number) => (_record.priority ? 'custom cursor-pointer bg-red-500/50' : 'cursor-pointer')"
        :row-class-name="(_record: IOrder, index: number) => (_record.priority ? 'cursor-pointer font-medium text-red-500 dark:text-red-300' : 'cursor-pointer')" 
        -->
        <OrderList
          :params="{ objectId: [objectId] }"
          :columns="columns"
          @show-order-info="showOrderInfo"
          @on-otgruzka="onOtgruzka"
          @on-edit-item="onEditItem"
        />
      </a-tab-pane>
      <a-tab-pane key="stolyarComplete" :tab="$t('tabs.order.stolyarComplete')">
        <OrderList
          :params="{ stolyarComplete: 1, objectId: [objectId] }"
          :columns="columns"
          @show-order-info="showOrderInfo"
          @on-otgruzka="onOtgruzka"
          @on-edit-item="onEditItem"
        />
      </a-tab-pane>
      <a-tab-pane key="malyarComplete" :tab="$t('tabs.order.malyarComplete')">
        <OrderList
          :params="{ malyarComplete: 1, objectId: [objectId] }"
          :columns="columns"
          @show-order-info="showOrderInfo"
          @on-otgruzka="onOtgruzka"
          @on-edit-item="onEditItem"
        />
      </a-tab-pane>
      <a-tab-pane key="goComplete" :tab="$t('tabs.order.goComplete')">
        <OrderList
          :params="{
            malyarComplete: 1,
            stolyarComplete: 1,
            objectId: [objectId],
          }"
          :columns="columns"
          @show-order-info="showOrderInfo"
          @on-otgruzka="onOtgruzka"
          @on-edit-item="onEditItem"
        />
      </a-tab-pane>
      <a-tab-pane key="montajComplete" :tab="$t('tabs.order.montajComplete')">
        <OrderList
          :params="{ montajComplete: 1, objectId: [objectId] }"
          :columns="columns"
          @show-order-info="showOrderInfo"
          @on-otgruzka="onOtgruzka"
          @on-edit-item="onEditItem"
        />
      </a-tab-pane>
      <a-tab-pane key="completed" :tab="$t('tabs.order.completed')">
        <OrderList
          :params="{ status: 100, objectId: [objectId] }"
          :columns="columns"
          @show-order-info="showOrderInfo"
          @on-otgruzka="onOtgruzka"
          @on-edit-item="onEditItem"
        />
      </a-tab-pane>
    </a-tabs>
  </div>

  <a-modal
    v-model:open="openTaskModal"
    :destroyOnClose="true"
    :key="dataTaskForm.id"
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
    :key="dataForm.id"
    :title="dataForm.id ? $t('form.order.edit') : $t('form.order.new')"
    :maskClosable="false"
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
        {{ currentOrderInModal?.name }}
      </p>
    </template>
    <div v-if="currentOrderInModal" class="-mt-4 -ml-4 pl-4 py-4">
      <OrderTaskList
        :order-id="currentOrderInModal.id"
        @on-edit-task="onEditTask"
      />
      <a-button @click="onAddNewTask(currentOrderInModal)" class="mt-2">
        {{ $t("form.task.add") }}
      </a-button>
    </div>
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
</template>
