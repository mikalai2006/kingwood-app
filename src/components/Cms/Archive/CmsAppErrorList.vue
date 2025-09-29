<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useAppErrorStore, useAuthStore } from "@/store";
import dayjs from "@/utils/dayjs";
import { iCheckLg } from "@/utils/icons";
import VIcon from "@/components/UI/VIcon.vue";
import { useI18n } from "vue-i18n";
import { IAppError, IAppErrorFilter } from "@/api/app_error/types";
import sift from "sift";
import { dateTimeFormat } from "@/utils/date";
import UserInfo from "@/components/User/UserInfo.vue";

const props = defineProps<{
  keyList: string;
  params: IAppErrorFilter;
  columns: {
    key: string;
    title: string;
    dataIndex: string;
    showSorterTooltip: boolean;
    customFilterDropdown?: boolean;
    onFilter?: (value: any, record: IAppError) => boolean;
    sorter?: (a: IAppError, b: IAppError) => number;
  }[];
}>();

const { t } = useI18n();

const emit = defineEmits([
  "onRemoveItem",
  "onPatchItem",
  "onViewItem",
  "onRemoveList",
]);

const appErrorStore = useAppErrorStore();

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
  return appErrorStore.items.filter(sift(siftParams.value)).map((x) => {
    return {
      ...x,
      key: x.id,
    };
  });
});

const rowSelection = ref({
  checkStrictly: false,
  selectedRowKeys: [] as (string | number)[],
  onChange: (
    selectedRowKeys: (string | number)[],
    selectedRows: IAppError[]
  ) => {
    // console.log(
    //   `selectedRowKeys: ${selectedRowKeys}`,
    //   "selectedRows: ",
    //   selectedRows
    // );
    rowSelection.value.selectedRowKeys = selectedRows.map((x) => x.id);
  },
  onSelect: (
    record: IAppError,
    selected: boolean,
    selectedRows: IAppError[]
  ) => {
    rowSelection.value.selectedRowKeys = selectedRows.map((x) => x.id);
    // console.log(record, selected, selectedRows);
  },
  onSelectAll: (
    selected: boolean,
    selectedRows: IAppError[],
    changeRows: IAppError[]
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
  rowSelection.value.selectedRowKeys = [];
};

onMounted(async () => {
  await appErrorStore.find({ ...props.params });
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
    size="small"
    :customRow="
            (record: IAppError) => {
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
  >
    <!-- :row-class-name="(_record: any, index: number) => (
      'custom ' + (
        _record.taskWorkers.length === 0
        ? 'priority bg-red-500/20 hover:!bg-red-500/40'
        : '')
      )" -->
    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'pushToken'">
        <a-tooltip v-if="record.auth.pushToken">
          <template #title>
            {{ record.auth.pushToken }}
          </template>

          <VIcon :path="iCheckLg" class="text-xl text-green-500" />
        </a-tooltip>
      </template>
      <template v-if="column.key === 'action'">
        <!-- <div>
          {{ record.auth?.pushToken }}
        </div> -->
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
      <template v-if="column.key === 'name'">
        <div>
          {{ record.name }}
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
      <template v-if="column.key === 'userId'">
        <UserInfo :user-id="record.userId" />
      </template>
      <template v-if="column.key === 'createdAt'">
        <p>{{ dayjs(record.createdAt).fromNow() }}</p>
        <p>{{ dayjs(record.createdAt).format(dateTimeFormat) }}</p>
      </template>
    </template>

    <!-- <template #expandIcon="{ onExpand, record, expanded }">
            <DownOutlined
              :class="['transition-transform ', expanded ? 'rotate-180' : '']"
              @click="onExpand(record)"
            />
          </template>
          <template #expandedRowRender="{ record }">
            <p style="margin: 0">
              {{ record.description }}
            </p>
          </template>
          <template #expandColumnTitle>
            <span style="color: red">More</span>
          </template> -->
  </a-table>
</template>
