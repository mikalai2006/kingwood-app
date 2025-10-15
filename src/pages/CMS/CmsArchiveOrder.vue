<script setup lang="ts" async>
import { computed, onActivated, onMounted, reactive, ref, watch } from "vue";
import dayjs from "@/utils/dayjs";
import { useAuthStore, useGeneralStore } from "@/store";
import { IOrder, IOrderFilter, IOrderInput } from "@/api/order/types";
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
import ArchiveOrderList from "@/components/Cms/Archive/ArchiveOrderList.vue";

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

const nameKeyLocalFilterAll = computed(() => "archive.order.filter.all");
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

const nameKeyLocalStorageColumns = ref("archive.order.column");

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
});

const showFilter = ref(false);
</script>
<template>
  <div class="flex-auto">
    <!-- <VTitle :text="$t('page.order.title')" /> -->
    <VHeader :title="$t('cms.page.cms-archive-order')">
      <template #back>
        <div class="pl-4">
          <span class="bg-r-600 px-2 py-0.5 text-white rounded-lg">
            {{ $t("cms.archive") }}
          </span>
        </div>
      </template>
      <template #header>
        <div class="flex flex-row items-center">
          <div class="flex-auto"></div>
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

    <ArchiveOrderList
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
                  :allowClear="false"
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
    </ArchiveOrderList>
  </div>
</template>

<style>
.ant-table-title {
  padding: 0 !important;
}
</style>
