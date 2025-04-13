<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useAuthStore } from "@/store";
import dayjs from "@/utils/dayjs";
import { iCheckLg } from "@/utils/icons";
import VIcon from "@/components/UI/VIcon.vue";
import { useI18n } from "vue-i18n";
import sift from "sift";
import { dateTimeFormat } from "@/utils/date";
import UserInfo from "@/components/User/UserInfo.vue";
import { IArchiveNotify, IArchiveNotifyFilter } from "@/api/archive/types";
import { findArchiveNotify } from "@/api/archive";
import { IConfigTable } from "./ArchiveOrderList.vue";

const props = defineProps<{
  keyList: string;
  items: IArchiveNotify[];
  params: IArchiveNotifyFilter;
  columns: {
    key: string;
    title: string;
    dataIndex: string;
    showSorterTooltip: boolean;
    customFilterDropdown?: boolean;
    onFilter?: (value: any, record: IArchiveNotify) => boolean;
    sorter?: (a: IArchiveNotify, b: IArchiveNotify) => number;
  }[];
}>();

const { t } = useI18n();

const emit = defineEmits(["onRemoveItem", "onViewItem", "onSetItems"]);

const authStore = useAuthStore();

const siftParams = computed(() => {
  const _result = Object.fromEntries(
    Object.entries(props.params)
      // .filter(([key, value]) => !["to"].includes(key))
      .map(([key, value]) => {
        if (typeof value === "object" && value?.length) {
          return [key, { $in: value }];
        } else {
          return [key, value];
        }
      })
  );
  return _result;
});
const loading = ref(false);

const columnsData = computed(() => {
  return props.items.filter(sift(siftParams.value)).map((x) => {
    return {
      ...x,
      key: x.id,
    };
  });
});
const nameKeyLocalStorage = computed(
  () => `tableConfig.archiveNotify.${props.keyList}`
);

const pagination = ref({
  total: 10,
  current: 1,
  pageSize: 20,
});

const onChangePagintaion = async (_page: number, _pageSize: number) => {
  pagination.value.current = _page;
  pagination.value.pageSize = _pageSize;
};

const sort = ref([{ field: "createdAt", order: 1, key: "createdAt" }]);

const onQueryData = async () => {
  loading.value = true;
  await findArchiveNotify({
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
      emit("onSetItems", r.data);
      pagination.value.total = r.total;
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
  <a-table
    :columns="columns"
    :data-source="columnsData"
    size="small"
    :loading="loading"
    :customRow="
            (record: IArchiveNotify) => {
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
    <!-- :row-class-name="(_record: any, index: number) => (
      'custom ' + (
        _record.taskWorkers.length === 0
        ? 'priority bg-red-500/20 hover:!bg-red-500/40'
        : '')
      )" -->
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
              e.stopPropagation();
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
