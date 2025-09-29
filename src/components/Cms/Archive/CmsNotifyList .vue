<script setup lang="ts">
import { computed, onMounted, ref, Transition, watch } from "vue";
import { useAppErrorStore, useAuthStore, useNotifyStore } from "@/store";
import dayjs from "@/utils/dayjs";
import { iCheckLg } from "@/utils/icons";
import VIcon from "@/components/UI/VIcon.vue";
import { useI18n } from "vue-i18n";
import sift from "sift";
import { dateTimeFormat } from "@/utils/date";
import UserInfo from "@/components/User/UserInfo.vue";
import { INotify, INotifyFilter } from "@/api/notify/types";
import { IConfigTable } from "./ArchiveOrderList.vue";

const props = defineProps<{
  keyList: string;
  items: INotify[];
  params: INotifyFilter;
  columns: {
    key: string;
    title: string;
    dataIndex: string;
    showSorterTooltip: boolean;
    customFilterDropdown?: boolean;
    onFilter?: (value: any, record: INotify) => boolean;
    sorter?: (a: INotify, b: INotify) => number;
  }[];
}>();

const { t } = useI18n();

const emit = defineEmits([
  "onRemoveItem",
  "onViewItem",
  "onSetItems",
  "onRemoveList",
]);

const appErrorStore = useAppErrorStore();

const authStore = useAuthStore();

const notifyStore = useNotifyStore();

// const siftParams = computed(() => {
//   const _result = Object.fromEntries(
//     Object.entries(props.params)
//       // .filter(([key, value]) => !["to"].includes(key))
//       .map(([key, value]) => {
//         if (typeof value === "object" && value?.length) {
//           return [key, { $in: value }];
//         } else {
//           return [key, value];
//         }
//       })
//   );
//   return _result;
// });
const loading = ref(false);

const columnsData = computed(() => {
  return props.items;
  // notifyStore.items.filter(sift(siftParams.value)).map((x) => {
  //   return {
  //     ...x,
  //     key: x.id,
  //   };
  // });
});

const nameKeyLocalStorage = computed(
  () => `tableConfig.Notify.${props.keyList}`
);

const pagination = ref({
  total: 10,
  current: 1,
  pageSize: 10,
});

const onChangePagintaion = async (_page: number, _pageSize: number) => {
  pagination.value.current = _page;
  pagination.value.pageSize = _pageSize;
};

const sort = ref([{ field: "createdAt", order: 1, key: "createdAt" }]);

const onQueryData = async () => {
  loading.value = true;
  await await notifyStore
    .find({
      ...props.params,
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
    .then((r) => {
      // notifys.value = r?.data;
      if (r.data) {
        const ids = r?.data.map((x) => x.id);
        const data = notifyStore.items.filter((x) => ids.includes(x.id));
        emit("onSetItems", data);
        pagination.value.total = r.total;
        localStorage.setItem(
          nameKeyLocalStorage.value,
          JSON.stringify(
            Object.assign(
              {},
              { sort: sort.value, pagination: pagination.value }
            )
          )
        );
      }
    })
    .finally(() => {
      loading.value = false;
    });
};

const handleTableChange: any = (
  //TableProps["onChange"]
  pag: { pageSize: number; current: number },
  filters: any,
  sorter: any
) => {
  // console.log("sorter", sorter);

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

// const selectedIds = ref<(string | number)[]>([]);
const rowSelection = ref({
  checkStrictly: false,
  selectedRowKeys: [] as (string | number)[],
  onChange: (selectedRowKeys: (string | number)[], selectedRows: INotify[]) => {
    // console.log(
    //   `selectedRowKeys: ${selectedRowKeys}`,
    //   "selectedRows: ",
    //   selectedRows
    // );
    rowSelection.value.selectedRowKeys = selectedRows.map((x) => x.id);
  },
  onSelect: (record: INotify, selected: boolean, selectedRows: INotify[]) => {
    rowSelection.value.selectedRowKeys = selectedRows.map((x) => x.id);
    // console.log(record, selected, selectedRows);
  },
  onSelectAll: (
    selected: boolean,
    selectedRows: INotify[],
    changeRows: INotify[]
  ) => {
    rowSelection.value.selectedRowKeys = selectedRows.map((x) => x.id);
    // console.log(selected, selectedRows, changeRows);
  },
});

const OnRemoveSelected = () => {
  // console.log(`Remove ${selectedIds.value}`);
  emit("onRemoveList", {
    id: rowSelection.value.selectedRowKeys,
  });
  pagination.value.current = pagination.value.current - 1;
  rowSelection.value.selectedRowKeys = [];
};

watch(
  () => columnsData.value,
  () => {
    if (columnsData.value.length == 0) {
      onQueryData();
    }
  }
);

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
</script>

<template>
  <Transition name="height">
    <div
      v-show="rowSelection.selectedRowKeys.length"
      class="mb-4 absolute top-0 bg-s-200 dark:bg-g-951 p-4"
    >
      <a-button
        type="primary"
        :disabled="!rowSelection.selectedRowKeys.length"
        :loading="loading"
        @click="OnRemoveSelected"
      >
        {{ $t("button.delete") }}
      </a-button>
      <span style="margin-left: 8px">
        <template v-if="rowSelection.selectedRowKeys.length">
          {{ `Selected ${rowSelection.selectedRowKeys.length} items` }}
        </template>
      </span>
    </div>
  </Transition>
  <a-table
    :columns="columns"
    :data-source="columnsData"
    :row-selection="rowSelection"
    :loading="loading"
    rowKey="id"
    size="small"
    :customRow="
            (record: INotify) => {
              return {
                // xxx, // props
                onClick: () => {
                  emit('onViewItem',record)
                }, // click row
                // onDblclick: (event) => {}, // double click row
                // onContextmenu: (event) => {}  // right button click row
                // onMouseenter: (event) => {}   // mouse enter row
                // onMouseleave: (event) => {}   // mouse leave row
              };
            }
          "
    @change="handleTableChange"
    :pagination="{
      ...pagination,
      disabled: loading,
      onChange: onChangePagintaion,
      showSizeChanger: true,
      position: ['bottomCenter'],
    }"
  >
    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'action'">
        <div class="flex gap-0">
          <!-- <a-tooltip v-if="authStore.roles.includes('user-patch')">
            <template #title>
              {{ $t("button.edit") }}
            </template>
            <a-button
              type="text"
              @click="(e: Event) => {emit('onEditItem', record); e.preventDefault(); e.stopPropagation()}"
            >
              <VIcon :path="iPen" />
            </a-button>
          </a-tooltip> -->
          <!-- <a-button
            v-if="authStore.roles.includes('user-patch')"
            @click="emit('onEditItem', record)"
          >
            {{ $t("button.edit") }}
          </a-button> -->
          <a-button
            v-if="authStore.code == 'systemrole'"
            :loading="loading"
            :disabled="loading"
            @click="(e: Event) => {
              e.stopPropagation()
              e.preventDefault();
              emit('onRemoveItem', record)
            }"
          >
            {{ $t("button.delete") }}
          </a-button>
        </div>
      </template>
      <template v-if="column.key === 'status'">
        <a-tag
          v-if="!record.status"
          :bordered="false"
          :color="record.status ? '#5ea500' : ''"
        >
          {{ $t(`error.status.${record.status}`) }}
        </a-tag>
      </template>
      <template v-if="column.key === 'userTo'">
        <UserInfo :user-id="record.userTo" />
      </template>
      <template v-if="column.key === 'userId'">
        <UserInfo :user-id="record.userId" />
      </template>
      <template v-if="column.key === 'createdAt'">
        <p>{{ dayjs(record.createdAt).fromNow() }}</p>
        <p>{{ dayjs(record.createdAt).format(dateTimeFormat) }}</p>
      </template>
    </template>
  </a-table>
</template>
