<script setup lang="ts" async>
import { useUserStore } from "@/store/modules/user";
import { computed, onMounted, reactive, ref } from "vue";
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
import { useRoute } from "vue-router";
import useOrder from "@/composable/useOrder";
import OrderList from "@/components/Order/OrderList.vue";

dayjs.locale("ru");

const route = useRoute();

const { objectId } = route.params;

const objectIds = computed(() =>
  typeof objectId !== "string" ? objectId : [objectId]
);

const authStore = useAuthStore();
const userStore = useUserStore();
const orderStore = useOrderStore();
const taskStatusStore = useTaskStatusStore();
const objectStore = useObjectStore();

const { t } = useI18n();

const object = computed(() =>
  objectStore.items.find((x) => objectIds.value.includes(x.id))
);

const {
  onEditItem,
  open,
  dataForm,
  defaultData,
  columnKeys,
  optionsForSelect,
  onSetColumns,
  onAddNewItem,
} = useOrder();

const dateFormat = "DD.MM.YYYY";
const rangeSearch = ref<Dayjs[]>([
  dayjs(`01.01.${new Date().getFullYear()}`, dateFormat),
  dayjs(`31.12.${new Date().getFullYear()}`, dateFormat),
]);

const state = reactive({
  searchText: "",
  searchedColumn: "",
});

const activeKey = ref("all");

const nameKeyLocalStorageColumns = ref("objectOrder.column");
const nameKeyLocalStorageRange = computed(() => "range.objectOrder");

const onChangeRange = (value: Dayjs[]) => {
  const _range = value.map((x) => x.format());
  console.log("_range: ", _range);

  localStorage.setItem(nameKeyLocalStorageRange.value, JSON.stringify(_range));
};

onMounted(async () => {
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
  <div class="flex-auto p-4">
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

    <a-tabs
      v-model:activeKey="activeKey"
      :key="columnKeys.length"
      destroyInactiveTabPane
    >
      <a-tab-pane key="inWork" :tab="$t('tabs.order.inWork')">
        <OrderList
          keyList="inWork"
          :keyColumns="nameKeyLocalStorageColumns"
          :params="{ status: 1 }"
          @on-edit-item="onEditItem"
        />
      </a-tab-pane>
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
          :keyColumns="nameKeyLocalStorageColumns"
          :params="{
            from: rangeSearch[0].format(),
            to: rangeSearch[1].format(),
          }"
          @on-edit-item="onEditItem"
        />
      </a-tab-pane>
      <a-tab-pane key="notWork" :tab="$t('tabs.order.notWork')">
        <OrderList
          keyList="notWork"
          :keyColumns="nameKeyLocalStorageColumns"
          :params="{ status: 0 }"
          @on-edit-item="onEditItem"
        />
      </a-tab-pane>
      <a-tab-pane key="stolyarComplete" :tab="$t('tabs.order.stolyarComplete')">
        <OrderList
          keyList="stolyarComplete"
          :keyColumns="nameKeyLocalStorageColumns"
          :params="{ stolyarComplete: 1 }"
          @on-edit-item="onEditItem"
        />
      </a-tab-pane>
      <a-tab-pane key="shlifComplete" :tab="$t('tabs.order.shlifComplete')">
        <OrderList
          keyList="shlifComplete"
          :keyColumns="nameKeyLocalStorageColumns"
          :params="{ shlifComplete: 1 }"
          @on-edit-item="onEditItem"
        />
      </a-tab-pane>
      <a-tab-pane key="malyarComplete" :tab="$t('tabs.order.malyarComplete')">
        <OrderList
          keyList="malyarComplete"
          :keyColumns="nameKeyLocalStorageColumns"
          :params="{ malyarComplete: 1 }"
          @on-edit-item="onEditItem"
        />
      </a-tab-pane>
      <a-tab-pane key="goComplete" :tab="$t('tabs.order.goComplete')">
        <OrderList
          keyList="goComplete"
          :keyColumns="nameKeyLocalStorageColumns"
          :params="{ goComplete: 1, montajComplete: 0 }"
          @on-edit-item="onEditItem"
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
          :keyColumns="nameKeyLocalStorageColumns"
          :params="{ status: 100 }"
          @on-edit-item="onEditItem"
        />
      </a-tab-pane>
    </a-tabs>
  </div>

  <a-modal
    v-model:open="open"
    :destroyOnClose="true"
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

  <!-- <a-modal
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
        {{ currentOrderInModal?.object?.name }}, №{{
          currentOrderInModal?.number
        }}
        -
        {{ currentOrderInModal?.name }}
      </p>
    </template>
    <div v-if="currentOrderInModal" class="-mt-4 -ml-4 pl-4 py-4">
      <template v-if="authStore.roles.includes('task-list')">
        <OrderTaskList
          :order-id="currentOrderInModal.id"
          @on-edit-task="onEditTask"
        />
      </template>
      <template v-else>
        <a-alert :message="$t('info.notPermission')" banner />
      </template>
      <a-button
        v-if="authStore.roles.includes('task-create')"
        type="primary"
        class="mt-4"
        @click="onAddNewTask(currentOrderInModal)"
      >
        {{ $t("form.task.add") }}
      </a-button>
    </div>
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
  </a-modal> -->
</template>
