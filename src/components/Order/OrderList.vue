<script setup lang="ts">
import { computed, h, onMounted, reactive, ref, watch } from "vue";
import dayjs from "@/utils/dayjs";

import { IOrder, IOrderFilter } from "@/api/order/types";
import {
  useAuthStore,
  useObjectStore,
  useOrderStore,
  useUserStore,
} from "@/store";
import {
  iChevronRight,
  iPen,
  iSearch,
  iTrashFill,
  iWraningTriangle,
} from "@/utils/icons";
import { dateFormat, dateTimeFormat } from "@/utils/date";
import { getShortFIO, replaceSubstringByArray } from "@/utils/utils";
import colors from "tailwindcss/colors";
import sift from "sift";
import OrderGroupBadge from "./OrderGroupBadge.vue";
import { message, Modal, TableProps } from "ant-design-vue";
import VIcon from "../UI/VIcon.vue";
import { useI18n } from "vue-i18n";

export interface IConfigTable {
  sort: { field: string; order: number }[];
  pagination: {
    total: number;
    current: number;
    pageSize: number;
  };
}

const props = defineProps<{
  keyList: string;
  params: IOrderFilter;
  columns: {
    key: string;
    title: string;
    dataIndex: string;
    customFilterDropdown?: boolean;
    onFilter?: (value: string, record: IOrder) => boolean;
    sorter?: (a: IOrder, b: IOrder) => number;
  }[];
}>();

const emit = defineEmits([
  "showOrderInfo",
  "onEditItem",
  "onOtgruzka",
  "onDateStart",
]);

const nameKeyLocalStorage = computed(
  () => `tableConfig.order.${props.keyList}`
);

const { t } = useI18n();

const authStore = useAuthStore();
const orderStore = useOrderStore();
const objectStore = useObjectStore();
const userStore = useUserStore();

const siftParams = computed(() => {
  const _result = Object.fromEntries(
    Object.entries(props.params)
      .filter(([key, value]) => !["to"].includes(key))
      .map(([key, value]) => {
        if (typeof value === "object" && value?.length) {
          return [key, { $in: value }];
        }
        // else if (["$sort"].includes(key)) {
        //   return [];
        // }
        else if (["from"].includes(key)) {
          return ["createdAt", { $gte: value, $lte: props.params.to }];
        } else {
          return [key, value];
        }
      })
  );
  return _result;
});

const columnsData = computed(() => {
  return orderStore.items.filter(sift(siftParams.value)).map((x) => {
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

const handleSearch = (selectedKeys, confirm, dataIndex) => {
  confirm();
  state.searchText = selectedKeys[0];
  state.searchedColumn = dataIndex;
};

const handleReset = (clearFilters) => {
  clearFilters({ confirm: true });
  state.searchText = "";
};

const loading = ref(true);
const sort = ref([{ field: "number", order: 1 }]);
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
      $limit: pagination.value.pageSize,
      $skip: Math.max(
        pagination.value.pageSize * (pagination.value.current - 1) - 1,
        0
      ),
      $sort: sort.value.map((x) => {
        return {
          key: x.field,
          value: x.order,
        };
      }),
    })
    .then((result) => {
      pagination.value.total = result.total;
      localStorage.setItem(
        nameKeyLocalStorage.value,
        JSON.stringify(
          Object.assign({}, { sort: sort.value, pagination: pagination.value })
        )
      );
    })
    .finally(() => {
      loading.value = false;
    });
};

const handleTableChange: TableProps["onChange"] = (
  pag: { pageSize: number; current: number },
  filters: any,
  sorter: any
) => {
  console.log("sorter", sorter);

  if (Object.values(sorter).length > 0) {
    sort.value = [
      {
        field: sorter.field === "objectId" ? "object.name" : sorter.field,
        order: sorter.order == "ascend" ? 1 : -1,
      },
    ];
  }
  onQueryData();
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
};

const onDeleteOrder = (input: IOrder) => {
  orderStore.deleteItem(input.id);
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
      return new Promise((resolve, reject) => {
        try {
          onDeleteOrder(record);

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
  // sync columns from localStorage.
  const _configTable = localStorage.getItem(nameKeyLocalStorage.value);
  if (_configTable) {
    const _config = JSON.parse(_configTable) as IConfigTable;
    pagination.value = _config.pagination;
    sort.value = _config.sort;
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
</script>

<template>
  <a-table
    :columns="columns"
    :data-source="columnsData"
    expandRowByClick
    :loading="loading"
    size="small"
    @change="handleTableChange"
    :row-class-name="(_record: IOrder, index: number) => (_record.group?.includes('create_complete') ? 'custom priority cursor-pointer bg-green-500/40 hover:!bg-green-500/50' : _record.priority ? 'custom priority cursor-pointer bg-red-500/30 hover:!bg-red-500/40' :  'cursor-pointer')"
    :customRow="
            (record: IOrder) => {
              return {
                // xxx, // props
                onClick: () => {
                  emit('showOrderInfo', record)
                }, // click row
                // onDblclick: (event) => {}, // double click row
                // onContextmenu: (event) => {}  // right button click row
                // onMouseenter: (event) => {}   // mouse enter row
                // onMouseleave: (event) => {}   // mouse leave row
              };
            }
          "
    :pagination="{
      ...pagination,
      disabled: loading,
      onChange: onChangePagintaion,
    }"
  >
    <template #bodyCell="{ column, record }">
      <!-- <template v-if="record"></template> -->
      <template v-if="column.key === 'action'">
        <div class="flex gap-0">
          <a-tooltip v-if="authStore.roles.includes('order-patch')">
            <template #title>
              {{ $t("button.edit") }}
            </template>
            <a-button
              type="link"
              @click="(e: Event) => {emit('onEditItem', record); e.preventDefault(); e.stopPropagation()}"
            >
              <VIcon :path="iPen" class="text-s-400 dark:text-g-300" />
            </a-button>
          </a-tooltip>

          <a-tooltip v-if="authStore.roles.includes('order-delete')">
            <template #title>
              {{ $t("button.delete") }}
            </template>
            <a-button
              danger
              type="link"
              @click="(e: Event) => {onDeleteAlert(record); e.preventDefault(); e.stopPropagation()}"
            >
              <!-- {{ $t("button.delete") }} -->
              <VIcon :path="iTrashFill" />
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
      </template>
      <template v-if="column.key === 'image'">
        <a-avatar
          class="bg-s-500 dark:bg-s-800 border-0"
          src="https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png"
        />
      </template>
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

      <template v-if="column.key === 'goComplete'">
        <div
          v-if="record.goComplete"
          class="relative min-w-32 min-h-16 rounded-md bg-green-600 dark:bg-green-700 flex items-center justify-center"
        >
          <div
            class="absolute w-2 h-2 top-1 left-1/2 bg-white dark:bg-g-900 rounded-full z-10"
          ></div>
          <div class="p-2 pt-4 text-white text-center">
            <template v-if="dayjs(record.dateOtgruzka).year() == 1">
              <div>
                {{ $t("groupOperation.4") }}
              </div>
              <a-button
                v-if="authStore.roles.includes('order-otgruzka')"
                size="small"
                @click="
                  (e: Event) => {
                    emit('onOtgruzka', record);
                    e.preventDefault();
                    e.stopPropagation();
                  }
                "
              >
                {{ $t("button.otgruzka") }}
              </a-button>
            </template>
            <template v-else>
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
        <div v-else></div>
      </template>

      <template v-if="column.key === 'constructorId'">
        <p class="text-nowrap">
          {{
            getShortFIO(
              userStore.items.find((x) => x.id === record.constructorId)?.name
            )
          }}
        </p>
      </template>

      <template v-if="column.key === 'activeOperation'">
        <OrderActiveTask :order-id="record.id" />
        <!-- <OrderGroupInfo :order-id="record.id" /> -->
      </template>

      <template v-if="column.key === 'name'">
        <p class="">
          {{ record.name }}
        </p>
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
              objectId: record?.object.id,
            },
          }"
          class="flex items-center gap-2"
        >
          {{ record?.object?.name }}
          <VIcon :path="iChevronRight" />
        </RouterLink>
      </template>

      <template v-if="column.key === 'term'">
        <div>
          {{ dayjs().to(record.term) }}
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
        <div v-if="dayjs(record.dateStart).year() != 1">
          <div>
            {{ $t("info.designFrom") }}
          </div>
          {{ dayjs(record.dateStart).format(dateFormat) }}
        </div>
        <div v-else>
          <a-button
            v-if="authStore.roles.includes('order-add-design')"
            size="small"
            @click="
                  (e: Event) => {
                    emit('onDateStart', record);
                    e.preventDefault();
                    e.stopPropagation();
                  }
                "
          >
            {{ $t("button.dateStart") }}
          </a-button>
        </div>
      </template>

      <template v-if="column.key === 'createdAt'">
        {{ dayjs(record.updatedAt).format("DD MMM YYYY") }}
        {{ dayjs(record.updatedAt).fromNow() }}
      </template>
      <!-- <template v-if="column.key === 'name'">
          <a-tag :color="record.color">{{ record.name }}</a-tag>
        </template> -->
    </template>

    <template
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
    </template>
    <template #customFilterIcon="{ filtered }">
      <VIcon
        :path="iSearch"
        :style="{ color: filtered ? '#108ee9' : undefined }"
      />
    </template>

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
</template>
