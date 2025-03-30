<script setup lang="ts" async>
import { computed, onActivated, onMounted, reactive, ref, watch } from "vue";
import dayjs from "@/utils/dayjs";
import { useAuthStore, useGeneralStore } from "@/store";
import { IOrder, IOrderFilter, IOrderInput } from "@/api/order/types";
import { ITask } from "@/api/task/types";
import OrderTaskList from "@/components/Order/OrderTaskList.vue";
import { useI18n } from "vue-i18n";
import VIcon from "@/components/UI/VIcon.vue";
import { iCog, iTrashFill } from "@/utils/icons";
import { Dayjs } from "dayjs";
import VHeader from "@/components/V/VHeader.vue";
import OrderList from "@/components/Order/OrderList.vue";
import useOrder from "@/composable/useOrder";
import { Colors } from "@/utils/colors";
import {
  onBeforeRouteUpdate,
  RouteLocationNormalizedGeneric,
  useRoute,
  useRouter,
} from "vue-router";

dayjs.locale("ru");
const authStore = useAuthStore();
const generalStore = useGeneralStore();

const route = useRoute();
const router = useRouter();

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

// const dateFormat = "DD.MM.YYYY";
// const rangeSearch = ref<Dayjs[]>([
//   // dayjs("01.01.2015", dateFormat),
//   // dayjs("01.01.2015", dateFormat),

//   dayjs(`01.01.${new Date().getFullYear()}`, dateFormat),
//   dayjs(`31.12.${new Date().getFullYear()}`, dateFormat),
// ]);

const year = ref<Dayjs | null>();

const filter = ref<IOrderFilter>({
  year: year.value?.year(),
});
const onRemoveFilterKey = (key: keyof IOrderFilter) => {
  if (filter.value[key]) {
    delete filter.value[key];
  }
  if (key === "year") {
    year.value = null;
  }
  onSetFilter();
};

const nameKeyLocalFilterAll = computed(() => "filter.all");
const filterParams = ref<IOrderFilter>({});
const onSetFilter = () => {
  filterParams.value = Object.fromEntries(
    Object.entries(filter.value).filter(([k, v]) => v)
  );

  localStorage.setItem(
    nameKeyLocalFilterAll.value,
    JSON.stringify(filterParams.value)
  );
};
// watch(
//   () => year.value,
//   (o, n) => {
//     console.log("year: ", year);

//     filter.year = n.year();
//   }
// );

const activeKey = ref("inWork");

const nameKeyLocalStorageColumns = ref("order.column");

// const onChangeRange = (value: Dayjs[]) => {
//   const _range = value.map((x) => x.format());
//   // console.log("_range: ", _range);

//   localStorage.setItem(nameKeyLocalFilterAll.value, JSON.stringify(_range));
// };

const onChangeTab = (key: string) => {
  router.push({ ...route, hash: `#${key}` });
  console.log(key);
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
  const _filter = localStorage.getItem(nameKeyLocalFilterAll.value);
  if (_filter) {
    const _data = JSON.parse(_filter);
    filter.value = { ..._data };
    onSetFilter();
    if (filter.value.year) {
      year.value = dayjs().set("year", filter.value.year);
    }
  }

  onCheckHash(route);
});

onBeforeRouteUpdate((to, from) => {
  onCheckHash(to);
});

const showFilter = ref(false);

function onCheckHash(to: RouteLocationNormalizedGeneric) {
  // hash active tab.
  const _activeTabKey = to.hash.replace("#", "");
  if (_activeTabKey) {
    activeKey.value = _activeTabKey;
  }
}
</script>
<template>
  <div class="flex-auto">
    <!-- <VTitle :text="$t('page.order.title')" /> -->
    <VHeader :title="$t('page.order.title')">
      <template #back>&nbsp;</template>
      <template #header>
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
      </template>
    </VHeader>

    <a-tabs
      v-model:activeKey="activeKey"
      :key="columnKeys.length"
      destroyInactiveTabPane
      type="card"
      :tabBarStyle="{
        position: 'sticky',
        top: 0,
        'padding-left': '15px',
        margin: '0px',
        'z-index': 500,
        background:
          generalStore.themeMode === 'dark' ? Colors.g[951] : Colors.s[200],
      }"
      @change="onChangeTab"
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
                  ? Colors.s[100]
                  : Colors.g[500],
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
                  ? Colors.s[100]
                  : Colors.g[500],
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
                  ? Colors.s[100]
                  : Colors.g[500],
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
                  ? Colors.s[100]
                  : Colors.g[500],
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
                  ? Colors.s[100]
                  : Colors.g[500],
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
                  ? Colors.s[100]
                  : Colors.g[500],
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
        <OrderList
          :key="Object.keys(filterParams).join('-')"
          keyList="all"
          :keyColumns="nameKeyLocalStorageColumns"
          :params="{ ...filterParams }"
          @on-edit-item="onEditItem"
        >
          <template #header>
            <div class="p-4">
              <div class="bg-s-100 dark:bg-g-900 rounded-lg p-4">
                <!-- <a-collapse v-model:showFilter="showFilter" ghost>
                <a-collapse-panel key="1"> -->
                <!-- <template #header>
                  </template> -->
                <template v-if="Object.keys(filterParams).length">
                  <div
                    class="flex items-center gap-1 border-b border-black/10 pb-1.5 mb-1.5"
                  >
                    <div class="">
                      {{ t("button.filter") }}
                    </div>
                    <a-tag
                      color="green"
                      closable
                      class="text-md px-2 py-1"
                      v-for="[k, v] in Object.entries(filterParams)"
                      @close="() => onRemoveFilterKey(k as keyof IOrderFilter)"
                    >
                      <span> {{ $t(`form.order.${k}`) }} - {{ v }} </span>

                      <template #closeIcon>
                        <a-tooltip>
                          <template #title>
                            {{ $t("button.deleteFilter") }}
                          </template>
                          <VIcon
                            :path="iTrashFill"
                            class="inline-block text-sm text-r-500 dark:text-r-500"
                          />
                        </a-tooltip>
                      </template>
                    </a-tag>
                    <!-- <template v-else>
                    <a-alert
                    class="m-0 leading-5"
                    :message="$t('info.filterOrder')"
                    banner
                    />
                  </template> -->
                  </div>
                </template>
                <a-form layout="inline" :model="filter">
                  <!-- <a-form-item ref="object" :label="$t('form.order.object')" name="object">
                  <a-input v-model:value="formState.object" />
                </a-form-item> -->

                  <a-form-item :label="$t('form.order.number')" name="number">
                    <a-input-number v-model:value="filter.number" />
                  </a-form-item>
                  <a-form-item :label="$t('form.order.name')" name="name">
                    <a-input v-model:value="filter.name" />
                  </a-form-item>

                  <a-form-item :label="$t('form.order.year')" name="year">
                    <a-date-picker
                      v-model:value="year"
                      picker="year"
                      @change="(v:any) => {
                        filter.year = v?.year()
                        // console.log(v);
                        
                      }"
                    />
                  </a-form-item>

                  <a-form-item :wrapper-col="{ span: 14, offset: 4 }">
                    <!-- <a-button @click="resetForm">
                    {{ $t("form.reset") }}
                  </a-button> -->
                    <a-button
                      type="primary"
                      style="margin-left: 10px"
                      @click="onSetFilter"
                    >
                      {{ $t("form.search") }}
                    </a-button>
                  </a-form-item>
                  <!-- <div>
                {{ $t("form.order.rangeSearch") }}
                <a-range-picker
                  v-model:value="rangeSearch"
                  :format="dateFormat"
                  @change="onChangeRange"
                />
              </div> -->
                </a-form>
                <!-- </a-collapse-panel>
              </a-collapse> -->
              </div>
            </div>
          </template>
        </OrderList>
      </a-tab-pane>
    </a-tabs>
  </div>

  <a-modal
    v-model:open="open"
    :destroyOnClose="true"
    :maskClosable="false"
    style="top: 40px"
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

<style>
.ant-table-title {
  padding: 0 !important;
}
</style>
