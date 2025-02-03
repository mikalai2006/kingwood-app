<script setup lang="ts" async>
import { computed, onMounted, ref } from "vue";
import dayjs from "@/utils/dayjs";
import { useAuthStore, useGeneralStore } from "@/store";
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
import { Colors } from "@/utils/colors";

dayjs.locale("ru");
const authStore = useAuthStore();
const generalStore = useGeneralStore();

const { t } = useI18n();

const {
  // onAddNewItem,
  // showOrderInfo,
  // onOtgruzka,
  // openTaskModal,
  // dataTaskForm,
  // defaultDataTask,
  onEditItem,
  open,
  dataForm,
  defaultData,
  columnKeys,
  optionsForSelect,
  onSetColumns,
  // columns,
  // openOtgruzka,
  // dataFormOtgruzka,
  // defaultDataOtgruzka,
  // openOrderInfo,
  // currentOrderInModal,
  // onAddNewTask,
  // onEditTask,

  // openTaskModal,
  // dataTaskForm,
  // defaultDataTask,
  // open,
  // dataForm,
  // defaultData,
  // openOtgruzka,
  // dataFormOtgruzka,
  // defaultDataOtgruzka,
  // openOrderInfo,
  // currentOrderInModal,
  // onAddNewTask,
  // onEditTask,
  // dateFormStart,
  // openDateStart,
  // defaultDateStart,
  // onDateStart,
  onAddNewItem,
  counter,
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

const activeKey = ref("inWork");

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

    <a-tabs
      v-model:activeKey="activeKey"
      :key="columnKeys.length"
      destroyInactiveTabPane
    >
      <a-tab-pane key="inWork">
        <template #tab>
          {{ $t("tabs.order.inWork") }}
          <a-badge
            v-if="counter.inWork.length"
            :count="counter.inWork.length"
            :number-style="{
              backgroundColor:
                generalStore.themeMode !== 'dark'
                  ? Colors.s[200]
                  : Colors.p[500],
              color: Colors.black,
            }"
          />
        </template>
        <OrderList
          keyList="inWork"
          :keyColumns="nameKeyLocalStorageColumns"
          :params="{ status: 1 }"
          @on-edit-item="onEditItem"
        />
      </a-tab-pane>
      <a-tab-pane key="notWork">
        <template #tab>
          {{ $t("tabs.order.notWork") }}
          <a-badge
            v-if="counter.notWork.length"
            :count="counter.notWork.length"
            :number-style="{
              backgroundColor:
                generalStore.themeMode !== 'dark'
                  ? Colors.s[200]
                  : Colors.p[500],
              color: Colors.black,
            }"
          />
        </template>
        <OrderList
          keyList="notWork"
          :keyColumns="nameKeyLocalStorageColumns"
          :params="{ status: 0 }"
          @on-edit-item="onEditItem"
        />
      </a-tab-pane>
      <a-tab-pane key="stolyarComplete">
        <template #tab>
          {{ $t("tabs.order.stolyarComplete") }}
          <a-badge
            v-if="counter.stolyarComplete.length"
            :count="counter.stolyarComplete.length"
            :number-style="{
              backgroundColor:
                generalStore.themeMode !== 'dark'
                  ? Colors.s[200]
                  : Colors.p[500],
              color: Colors.black,
            }"
          />
        </template>
        <OrderList
          keyList="stolyarComplete"
          :keyColumns="nameKeyLocalStorageColumns"
          :params="{
            status: 1,
            stolyarComplete: 1,
            dateOtgruzka: '1',
            // shlifComplete: 0,
            // malyarComplete: 0,
            // goComplete: 0,
            // montajComplete: 0,
          }"
          @on-edit-item="onEditItem"
        />
      </a-tab-pane>
      <a-tab-pane key="shlifComplete">
        <template #tab>
          {{ $t("tabs.order.shlifComplete") }}
          <a-badge
            v-if="counter.shlifComplete.length"
            :count="counter.shlifComplete.length"
            :number-style="{
              backgroundColor:
                generalStore.themeMode !== 'dark'
                  ? Colors.s[200]
                  : Colors.p[500],
              color: Colors.black,
            }"
          />
        </template>
        <OrderList
          keyList="shlifComplete"
          :keyColumns="nameKeyLocalStorageColumns"
          :params="{
            status: 1,
            // stolyarComplete: 1,
            shlifComplete: 1,
            dateOtgruzka: '1',
            // malyarComplete: 0,
            // goComplete: 0,
            // montajComplete: 0,
          }"
          @on-edit-item="onEditItem"
        />
      </a-tab-pane>
      <a-tab-pane key="malyarComplete">
        <template #tab>
          {{ $t("tabs.order.malyarComplete") }}
          <a-badge
            v-if="counter.malyarComplete.length"
            :count="counter.malyarComplete.length"
            :number-style="{
              backgroundColor:
                generalStore.themeMode !== 'dark'
                  ? Colors.s[200]
                  : Colors.p[500],
              color: Colors.black,
            }"
          />
        </template>
        <OrderList
          keyList="malyarComplete"
          :keyColumns="nameKeyLocalStorageColumns"
          :params="{
            status: 1,
            // stolyarComplete: 1,
            malyarComplete: 1,
            dateOtgruzka: '1',
            // shlifComplete: 1,
            // goComplete: 0,
            // montajComplete: 0,
          }"
          @on-edit-item="onEditItem"
        />
      </a-tab-pane>
      <a-tab-pane key="goComplete">
        <template #tab>
          {{ $t("tabs.order.goComplete") }}
          <a-badge
            v-if="counter.goComplete.length"
            :count="counter.goComplete.length"
            :number-style="{
              backgroundColor:
                generalStore.themeMode !== 'dark'
                  ? Colors.s[200]
                  : Colors.p[500],
              color: Colors.black,
            }"
          />
        </template>
        <OrderList
          keyList="goComplete"
          :keyColumns="nameKeyLocalStorageColumns"
          :params="{
            status: 1,
            // stolyarComplete: 1,
            // shlifComplete: 1,
            // malyarComplete: 1,
            goComplete: 1,
            dateOtgruzka: '1',
            // montajComplete: 0,
          }"
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
</template>
