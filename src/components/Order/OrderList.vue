<script setup lang="ts">
import { computed, h, onMounted, reactive, ref, watch } from "vue";
import dayjs from "@/utils/dayjs";

import { IOrder, IOrderFilter } from "@/api/order/types";
import {
  useAuthStore,
  useGeneralStore,
  useObjectStore,
  useOrderStore,
  useUserStore,
} from "@/store";
import {
  iCheckLg,
  iChevronRight,
  iPen,
  iTrashFill,
  iWraningTriangle,
} from "@/utils/icons";
import { dateFormat } from "@/utils/date";
import { replaceSubstringByArray } from "@/utils/utils";
import colors from "tailwindcss/colors";
import sift from "sift";
import OrderGroupBadge from "./OrderGroupBadge.vue";
import { message, Modal } from "ant-design-vue";
import VIcon from "../UI/VIcon.vue";
import { useI18n } from "vue-i18n";
import useOrder from "@/composable/useOrder";
import OrderObject from "./OrderObject.vue";
import { Colors } from "@/utils/colors";
import OrderMessages from "./OrderMessages.vue";
import OrderTaskList from "./OrderTaskList.vue";
import FinancyOrder from "../Financy/FinancyOrder.vue";
import { ITaskWorker } from "@/api/task_worker/types";
import UserFIO from "../User/UserFIO.vue";
import OrderListButtonCompleted from "./OrderListButtonCompleted.vue";

export interface IConfigTable {
  sort: { field: string; order: number; key: string }[];
  filterColumn: {
    [key: string]: any;
  };
  pagination: {
    total: number;
    current: number;
    pageSize: number;
  };
}

const props = defineProps<{
  keyList: string;
  params: IOrderFilter;
  // columns: {
  //   key: string;
  //   title: string;
  //   dataIndex: string;
  //   customFilterDropdown?: boolean;
  //   onFilter?: (value: string, record: IOrder) => boolean;
  //   sorter?: (a: IOrder, b: IOrder) => number;
  // }[];
  keyColumns: string;
}>();

const emit = defineEmits([
  // "showOrderInfo",
  "onEditItem",
  // "onOtgruzka",
  // "onDateStart",
]);

const { t } = useI18n();

const generalStore = useGeneralStore();

const nameKeyLocalStorage = computed(
  () => `tableConfig.order.${props.keyList}`
);

const {
  columnKeys,
  sort,
  filtersColumn,
  columns,

  openTaskModal,
  dataTaskForm,
  defaultDataTask,
  // open,
  // dataForm,
  // defaultData,
  openOtgruzka,
  dataFormOtgruzka,
  defaultDataOtgruzka,
  openOrderInfo,
  currentOrderInModal,
  currentOrderObjectInModal,
  onAddNewTask,
  onEditTask,
  dateFormStart,
  openDateStart,
  defaultDateStart,

  onCheckComplete,

  showOrderInfo,
  onOtgruzka,
  // onEditItem,
  onDateStart,
} = useOrder();

const authStore = useAuthStore();
const orderStore = useOrderStore();
const objectStore = useObjectStore();
const userStore = useUserStore();

const siftParams = computed(() => {
  const _result = Object.fromEntries(
    Object.entries({ ...props.params, ...filtersColumn.value })
      .filter(([key, value]) => !["to"].includes(key))
      .map(([key, value]) => {
        if (typeof value === "object" && value?.length) {
          return [key, { $in: value }];
        } else if (["dateOtgruzka"].includes(key) && typeof value == "string") {
          return [
            "dateOtgruzka",
            { $lte: dayjs(0).add(parseInt(value), "year").utc().format() },
          ];
        } else if (["countTaskMontaj"].includes(key)) {
          return ["countTaskMontaj", { $gt: value }];
        } else if (["name"].includes(key)) {
          return ["name", { $regex: value, $options: "i" }];
        } else if (["from"].includes(key)) {
          return ["createdAt", { $gte: value, $lte: props.params.to }];
        } else {
          return [key, value];
        }
      })
  );
  _result.id = { $ne: "000000000000000000000000" };
  return _result;
});
// console.log("siftParams: ", siftParams.value);

const idsCurentPage = ref<string[]>([]);

const columnsData = computed(() => {
  // return items.value;
  // return orderStore.items.filter(sift(siftParams.value)).map((x) => {
  //   const object = objectStore.items.find((y) => y.id === x.objectId);

  //   return {
  //     object,
  //     ...x,
  //     key: x.id,
  //   };
  // });
  return orderStore.items
    .filter((x) => idsCurentPage.value.includes(x.id))
    .filter(sift(siftParams.value))
    .map((x) => {
      const object = objectStore.items.find((y) => y.id === x.objectId);

      return {
        object,
        ...x,
        key: x.id,
      };
    });
});

const state = reactive({
  searchText: "",
  searchedColumn: "",
});

const searchInput = ref();

const handleSearch = (selectedKeys: any, confirm: any, dataIndex: string) => {
  confirm();
  state.searchText = selectedKeys[0];
  state.searchedColumn = dataIndex;
};

const handleReset = (clearFilters: any) => {
  clearFilters({ confirm: true });
  state.searchText = "";
};

const loading = ref(true);
const pagination = ref({
  total: 10,
  current: 1,
  pageSize: 20,
});

const onChangePagintaion = async (_page: number, _pageSize: number) => {
  // console.log("load ", _page, _pageSize, _pageSize * _page - 1);
  pagination.value.current = _page;
  pagination.value.pageSize = _pageSize;
  // onQueryData();
};

const onQueryData = async () => {
  loading.value = true;

  await orderStore
    .find({
      ...props.params,
      ...filtersColumn.value,
      $limit: pagination.value.pageSize,
      $skip: Math.max(
        pagination.value.pageSize * (pagination.value.current - 1) - 1,
        0
      ),
      $sort: sort.value?.length
        ? sort.value.map((x) => {
            return {
              key: x.field,
              value: x.order,
            };
          })
        : undefined,
    })
    .then((result) => {
      if (result.data) {
        idsCurentPage.value = result.data.map((x) => x.id);
        // const ids = result.data.map((x) => x.id);
        // const data = orderStore.items.filter((x) => ids.includes(x.id));
        // items.value = data;

        pagination.value.total = result.total;

        localStorage.setItem(
          nameKeyLocalStorage.value,
          JSON.stringify(
            Object.assign(
              {},
              { sort: sort.value, pagination: pagination.value }
              // { filtersColumn: filtersColumn.value }
            )
          )
        );
      } else {
        idsCurentPage.value = [];
      }
    })
    .finally(() => {
      loading.value = false;
    });
};

const handleTableChange: any = async (
  //TableProps["onChange"]
  pag: { pageSize: number; current: number },
  filters: any,
  sorter: any
) => {
  // console.log("sorter", sorter);
  // console.log("filters", filters);

  if (Object.values(sorter).length > 0) {
    sort.value = sorter.order
      ? [
          {
            field: sorter.field === "objectId" ? "object.name" : sorter.field,
            order: sorter.order == "ascend" ? 1 : -1,
            key: sorter.field,
          },
        ]
      : [];
  } else {
    sort.value = [];
  }

  const objFilters: any = {};
  for (const key in filters) {
    if (filters[key]) {
      objFilters[key] = filters[key];
    }
  }

  if (Object.values(objFilters).length > 0) {
    filtersColumn.value = Object.assign({}, objFilters);
  } else {
    filtersColumn.value = {};
  }

  await onQueryData();
  // console.log({
  //   sorter,
  //   ...filters,
  // });

  // run({
  //   results: pag.pageSize,
  //   page: pag?.current,
  //   sortField: sorter.field,
  //   sortOrder: sorter.order,
  //   ...filters,
  // });
  setTimeout(() => {
    document.getElementById("main")?.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }, 300);
};

const onDeleteOrder = async (input: IOrder) => {
  return await orderStore.deleteItem(input.id).then((r) => {
    message.success(
      replaceSubstringByArray(t("message.deleteOrderOk"), [
        `№${input.number}-${input.name}`,
      ])
    );
    return r;
  });
};

const onHideOrderInfo = () => {
  openOrderInfo.value = false;
  activeKey.value = "list";
};

const onDeleteAlert = (record: IOrder) => {
  Modal.confirm({
    // transitionName: "",
    icon: null,
    content: h(
      "div",
      {
        class: "flex flex-row items-start gap-4",
      },
      [
        h(VIcon, {
          path: iWraningTriangle,
          class: "flex-none text-4xl text-red-500 dark:text-red-400",
        }),
        h(
          "div",
          {
            class: "flex-auto",
          },
          [
            h(
              "div",
              { class: "text-lg font-bold text-red-500 dark:text-red-400" },
              t("form.order.delete")
            ),
            h(
              "div",
              {},
              replaceSubstringByArray(t("message.removeOrder"), [
                record?.name,
                record?.number,
                record?.name,
              ])
            ),
          ]
        ),
      ]
    ),
    okButtonProps: { type: "primary", danger: true },
    okText: t("button.delete"),
    cancelText: t("button.cancel"),
    // title: t("form.task.delete"),
    onOk() {
      return new Promise(async (resolve, reject) => {
        try {
          await onDeleteOrder(record);

          onHideOrderInfo();
          resolve("");
        } catch (e) {
          message.error("Error: delete order");
        }
      }).catch(() => console.log("Oops errors!"));
    },
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onCancel() {},
  });

  // console.log("Delete task: ", item);
  // //   await emit("onDeleteTask", item);
  // return new Promise((resolve) => {
  //   setTimeout(() => resolve(true), 3000);
  // });
};

onMounted(async () => {
  // sync columnKeys from localStorage.
  const _columns = localStorage.getItem(props.keyColumns);
  if (_columns) {
    columnKeys.value = JSON.parse(_columns);
  }

  // sync columns from localStorage.
  const _configTable = localStorage.getItem(nameKeyLocalStorage.value);
  if (_configTable) {
    const _config = JSON.parse(_configTable) as IConfigTable;
    pagination.value = _config.pagination;
    sort.value = _config.sort;
    // filtersColumn.value = _config.filterColumn;

    if (Object.keys(props.params).length > 0) {
      pagination.value.current = 1;
    }
  }

  await onQueryData();
});

// watch(
//   () => props.params,
//   (o, n) => {
//     console.log(o, n);

//     console.log(props.params);
//     console.log(siftParams.value);

//     onQueryData();
//   },
//   {
//     immediate: false,
//   }
// );

const activeKey = ref("list");
</script>

<template>
  <a-table
    :columns="columns"
    :data-source="columnsData"
    expandRowByClick
    :loading="loading"
    size="small"
    class="table_order"
    @change="handleTableChange"
    :row-class-name="(_record: IOrder, index: number) => (_record.status == 200 ? 'custom priority cursor-pointer !bg-green-500/40 hover:!bg-green-500/70' : _record.priority ? 'custom priority cursor-pointer bg-red-500/30 hover:!bg-red-500/40' :  'cursor-pointer')"
    :customRow="
            (record: IOrder) => {
              return {
                // xxx, // props
                onClick: () => {
                  showOrderInfo(record)
                }, // click row
                // onDblclick: (event) => {}, // double click row
                // onContextmenu: (event) => {}  // right button click row
                // onMouseenter: (event) => {}   // mouse enter row
                // onMouseleave: (event) => {}   // mouse leave row
              };
            }
          "
    :pagination="
      pagination.total > 10
        ? {
            ...pagination,
            disabled: loading,
            onChange: onChangePagintaion,
            showSizeChanger: true,
            position: ['bottomCenter'],
          }
        : false
    "
  >
    <template #title>
      <slot name="header"> </slot>
    </template>
    <template #bodyCell="{ column, record }">
      <!-- <template v-if="record"></template> -->
      <template v-if="column.key === 'action'">
        <div v-if="record.status != 200" class="flex gap-0 items-center">
          <OrderListButtonCompleted
            v-if="authStore.roles.includes('order-completed')"
            :order-id="record.id"
            @on-check-complete="onCheckComplete"
          />

          <a-tooltip
            v-if="authStore.roles.includes('order-patch')"
            placement="topRight"
          >
            <template #title>
              {{ $t("button.edit") }}
            </template>
            <a-button
              type="text"
              @click="(e: Event) => {emit('onEditItem',record); e.preventDefault(); e.stopPropagation()}"
            >
              <VIcon :path="iPen" />
            </a-button>
          </a-tooltip>

          <!-- <a-tooltip>
          <template #title>
            {{ $t("button.delete") }}
          </template>
          <a-button type="link" danger @click="">
            <VIcon :path="iPen" class="text-s-400 dark:text-g-300" />
          </a-button>
        </a-tooltip> -->
        </div>
        <div v-else>
          <!-- <a-tag
            :color="Colors.green[500]"
            class="text-base flex gap-1 items-center"
          >
            <VIcon :path="iCheckLg" color="#fff" />
            completed
          </a-tag> -->
        </div>
      </template>
      <template v-if="column.key === 'image'">
        <a-avatar
          class="bg-s-500 dark:bg-s-800 border-0"
          src="https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png"
        />
      </template>

      <!-- <template v-if="column.key === 'name'">
        <span class="font-medium">
          {{ record.name }}
        </span>
      </template> -->

      <template v-if="column.key === 'group'">
        <a-tag
          v-for="item in record.group"
          :key="item"
          :bordered="false"
          class="text-md"
        >
          {{ $t(`groupOperation.${item}`) }}
        </a-tag>
      </template>

      <template v-if="column.key === 'stolyarComplete'">
        <OrderGroupBadge
          :orderId="record.id"
          group="2"
          :status="!!record.stolyarComplete"
        />
      </template>

      <template v-if="column.key === 'malyarComplete'">
        <OrderGroupBadge
          :orderId="record.id"
          group="3"
          :status="!!record.malyarComplete"
        />
      </template>

      <template v-if="column.key === 'montajComplete'">
        <OrderGroupBadge
          :orderId="record.id"
          group="5"
          :status="!!record.montajComplete"
        />
      </template>

      <template v-if="column.key === 'shlifComplete'">
        <OrderGroupBadge
          :orderId="record.id"
          group="6"
          :status="!!record.shlifComplete"
        />
      </template>

      <template v-if="column.key === 'goComplete'">
        <div
          v-if="record.goComplete && record.status != 200"
          class="relative min-w-32 min-h-16 rounded-md bg-green-600 dark:bg-green-700 flex items-center justify-center"
        >
          <div
            class="absolute w-2 h-2 top-1 left-1/2 bg-white dark:bg-g-900 rounded-full z-10"
          ></div>
          <div
            class="p-2 pt-4 text-white dark:text-white text-center leading-5"
          >
            <template
              v-if="
                dayjs(record.dateOtgruzka).year() == 1 && record.status != 200
              "
            >
              <div>
                {{ $t("groupOperation.4") }}
              </div>
              <a-button
                v-if="authStore.roles.includes('order-otgruzka')"
                size="small"
                class="bg-purple-500 text-white"
                @click="
                  (e: Event) => {
                    onOtgruzka(record);
                    e.preventDefault();
                    e.stopPropagation();
                  }
                "
              >
                {{ $t("button.otgruzka") }}
              </a-button>
            </template>
            <template v-else-if="dayjs(record.dateOtgruzka).year() != 1">
              {{ $t("info.otgruzkaYes") }}:<br />
              {{ dayjs(record.dateOtgruzka).utc(true).format(dateFormat) }}
            </template>
            <!-- <OrderGroupBadge
                    :orderId="record.id"
                    group="3"
                    :status="!!record.malyarComplete"
                  /> -->
          </div>
        </div>
        <div v-else>
          <OrderGroupBadge
            :orderId="record.id"
            group="4"
            :status="!!record.goComplete"
          />
        </div>
      </template>

      <template v-if="column.key === 'userId'">
        <p class="text-nowrap">
          <UserFIO :user-id="record.userId" />
        </p>
      </template>

      <template v-if="column.key === 'constructorId'">
        <p class="text-nowrap">
          <!-- {{
            getObjectId(record.constructorId) != "0"
              ? getShortFIO(
                  userStore.items.find((x) => x.id === record.constructorId)
                    ?.name
                )
              : "-"
          }} -->
          <UserFIO :user-id="record.constructorId" />
        </p>
      </template>

      <template v-if="column.key === 'activeOperation'">
        <OrderActiveTask :order-id="record.id" />
        <!-- <OrderGroupInfo :order-id="record.id" /> -->
      </template>

      <template v-if="column.key === 'name'">
        <div class="flex gap-2 items-center">
          <span class="leading-4">
            {{ record.name }}
          </span>
          <VIcon :path="iChevronRight" class="text-g-300 dark:text-g-500" />
        </div>
        <a-tag
          v-if="record.priority"
          :bordered="false"
          :color="colors.red[500]"
        >
          {{ $t("table.order.priority") }}
        </a-tag>
      </template>

      <template v-if="column.key === 'objectId'">
        <RouterLink
          :to="{
            name: 'objectOrderId',
            params: {
              objectId: record.objectId,
            },
          }"
          class="flex items-center gap-2 text-s-600 dark:text-g-200 underline underline-offset-4 hover:no-underline"
        >
          <!-- {{ record?.object?.name }} -->
          <OrderObject :object-id="record.objectId" />
          <VIcon :path="iChevronRight" class="text-g-300 dark:text-g-500" />
        </RouterLink>
      </template>

      <template v-if="column.key === 'term'">
        <div>
          {{ dayjs(record.term).year() > 1 ? dayjs().to(record.term) : "-" }}
        </div>

        <a-tag
          v-if="record.priority"
          :bordered="false"
          :color="colors.red[500]"
        >
          {{ $t("table.order.priority") }}
        </a-tag>
      </template>

      <template v-if="column.key === 'dateStart'">
        <div
          v-if="dayjs(record.dateStart).year() != 1"
          class="flex flex-row gap-1"
        >
          <!-- <div>
            {{ $t("info.designFrom") }}
          </div> -->
          <VIcon :path="iCheckLg" class="text-xl text-green-500" />
          {{ dayjs(record.dateStart).format(dateFormat) }}
        </div>
        <div>
          <a-tooltip
            v-if="
              authStore.roles.includes('order-add-design') &&
              dayjs(record.dateStart).year() == 1 &&
              record.status != 200
            "
          >
            <template #title>
              {{ $t("info.dateStart") }}
            </template>
            <a-button
              type="primary"
              size="small"
              @click="
                    (e: Event) => {
                      onDateStart(record);
                      e.preventDefault();
                      e.stopPropagation();
                    }
                  "
            >
              {{
                dayjs(record.dateStart).year() == 1
                  ? $t("button.dateStart")
                  : $t("button.dateStartEdit")
              }}
            </a-button>
          </a-tooltip>
        </div>
      </template>

      <template v-if="column.key === 'createdAt'">
        {{ dayjs(record.updatedAt).format("DD MMM YYYY") }}
        {{ dayjs(record.updatedAt).fromNow() }}
      </template>

      <template v-if="column.key === 'number'">
        <div class="text-center">{{ record.number }}</div>
      </template>
    </template>

    <!-- <template
      #customFilterDropdown="{
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
        column,
      }"
    >
      <div style="padding: 8px">
        <a-input
          ref="searchInput"
          :placeholder="`Search ${column.dataIndex}`"
          :value="selectedKeys[0]"
          style="width: 188px; margin-bottom: 8px; display: block"
          @change="
                  (e: any) => setSelectedKeys(e.target.value ? [e.target.value] : [])
                "
          @pressEnter="handleSearch(selectedKeys, confirm, column.dataIndex)"
        />
        <a-button
          type="primary"
          size="small"
          style="width: 90px; margin-right: 8px"
          @click="handleSearch(selectedKeys, confirm, column.dataIndex)"
        >
          <template #icon>
            <VIcon :path="iSearch" />
          </template>
          Search
        </a-button>
        <a-button
          size="small"
          style="width: 90px"
          @click="handleReset(clearFilters)"
        >
          Reset
        </a-button>
      </div>
    </template> -->
    <!-- <template #customFilterIcon="{ filtered }">
      <VIcon
        :path="iSearch"
        :style="{ color: filtered ? '#108ee9' : undefined }"
      />
    </template> -->

    <!-- <template #expandIcon="{ onExpand, record, expanded }">
            <DownOutlined
              :class="['transition-transform ', expanded ? 'rotate-180' : '']"
              @click="onExpand(record)"
            />
          </template>
          <template
            #expandedRowRender="{ record }"
            v-slot:expandIcon="DownOutlined"
          >
            <div class="-mt-4 -ml-4 pl-4 py-4">
              <OrderTaskList :order-id="record.id" @on-edit-task="onEditTask" />
              <a-button @click="onAddNewTask(record.id)" class="mt-2">
                {{ $t("form.task.add") }}
              </a-button>
            </div>
          </template>
          <template #expandColumnTitle>
            <span style="color: red">More</span>
          </template> -->
  </a-table>

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
    :title="$t('table.order.dateStart')"
    :key="`dateStart_${dateFormStart?.id || '0'}`"
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
    width="50%"
    style="margin: 0 auto"
    :key="currentOrderInModal?.id"
    wrapClassName="b-scroll full-modal"
    :bodyStyle="{
      margin: 0,
      padding: 0,
      paddingTop: 10,
      overflow: 'hidden',
      background:
        generalStore.themeMode === 'dark' ? Colors.g[900] : Colors.s[100],
    }"
    :destroyOnClose="true"
    :maskClosable="false"
    :ok-button-props="{ hidden: true }"
    :cancel-button-props="{ hidden: true }"
    :cancel-text="$t('button.close')"
    @cancel="onHideOrderInfo"
  >
    <template #title>
      <div class="text-xl leading-6 bg-s-200 dark:bg-g-900 px-4 py-2">
        {{ currentOrderObjectInModal?.name }}, №{{
          currentOrderInModal?.number
        }}
        -
        {{ currentOrderInModal?.name }}
      </div>
    </template>
    <div v-if="currentOrderInModal" class="h-[95vh] overflow-auto b-scroll">
      <a-tabs
        v-model:activeKey="activeKey"
        destroyInactiveTabPane
        :tabBarStyle="{
          position: 'sticky',
          top: 0,
          'padding-left': '15px',
          margin: '0px',
          'z-index': 50,
          background:
            generalStore.themeMode === 'dark' ? Colors.g[900] : Colors.s[200],
        }"
      >
        <a-tab-pane key="list" :tab="$t('tabs.task.list')">
          <template v-if="authStore.roles.includes('task-list')">
            <div class="px-4 h-full overflow-auto">
              <OrderTaskList
                :order-id="currentOrderInModal.id"
                @on-edit-task="onEditTask"
              />
              <a-button
                v-if="authStore.roles.includes('task-create')"
                @click="onAddNewTask(currentOrderInModal)"
                class="mt-4 mb-8"
              >
                {{ $t("form.task.add") }}
              </a-button>
            </div>
          </template>
          <template v-else>
            <a-alert :message="$t('info.notPermission')" banner />
          </template>
        </a-tab-pane>
        <a-tab-pane key="message" :tab="$t('tabs.task.message')">
          <OrderMessages :orderId="currentOrderInModal.id" />
        </a-tab-pane>
        <a-tab-pane
          v-if="authStore.roles.includes('financy-list')"
          key="financy"
          :tab="$t('tabs.order.financy')"
        >
          <FinancyOrder :order-id="currentOrderInModal.id" />
        </a-tab-pane>
        <a-tab-pane key="actions" :tab="$t('tabs.order.actions')">
          <div class="p-4">
            <a-tooltip v-if="authStore.roles.includes('order-delete')">
              <template #title>
                {{ $t("button.delete") }}
              </template>
              <a-button
                danger
                type="primary"
                @click="(e: Event) => {
                if (currentOrderInModal) {
                  onDeleteAlert(currentOrderInModal); e.preventDefault(); e.stopPropagation()
              }}"
              >
                <div class="flex items-center gap-2">
                  <VIcon :path="iTrashFill" />
                  {{ $t("button.delete") }}
                  <!-- {{ $t("button.delete") }} -->
                </div>
              </a-button>
            </a-tooltip>
          </div>
        </a-tab-pane>
      </a-tabs>
    </div>
  </a-modal>
</template>

<style>
.full-modal {
  .ant-modal {
    max-width: 100%;
    top: 0;
    padding-bottom: 0;
    margin: 0;
    height: calc(100vh);
  }
  .ant-modal-content {
    display: flex;
    flex-direction: column;
    height: calc(100vh);
  }
  .ant-modal-body {
    flex: 1;
    padding: 15px;
  }
  .ant-modal-content {
    padding: 0;
    border-radius: 0 !important;
  }
  .ant-modal-header {
    margin: 0;
    padding: 15px;
    padding-bottom: 0;
    margin: 0;
    padding: 0;
  }
  .ant-modal-footer {
    display: none;
  }
  .ant-modal-close {
    top: 30px !important;
  }

  .ant-tabs-card .ant-tabs-tab-active,
  .ant-tabs-card .ant-tabs-tab-active {
    background: v-bind("Colors.s[300]") !important;
    border-color: transparent !important;
  }
}

.table_order thead {
  position: sticky;
  top: 35px;
  z-index: 100;
}
</style>
