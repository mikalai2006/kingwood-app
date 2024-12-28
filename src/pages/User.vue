<script setup lang="ts" async>
import { IUser, IUserInput } from "@/api/user/types";
import VFormUser from "@/components/Form/VFormUser.vue";
import { useUserStore } from "@/store/modules/user";
import { computed, reactive, ref, toRaw, UnwrapRef } from "vue";
import dayjs from "@/utils/dayjs";
import { DownOutlined } from "@ant-design/icons-vue";
import { usePostStore, useTaskStore, useTaskWorkerStore } from "@/store";
import UserTask from "@/components/User/UserTask.vue";
import { invertColor } from "@/utils/utils";
import { useI18n } from "vue-i18n";
import VImg from "@/components/UI/VImg.vue";

dayjs.locale("ru");
const userStore = useUserStore();
const postStore = usePostStore();

const { t } = useI18n();

await userStore.find({ hidden: 1 });
const taskStore = useTaskStore();
const taskWorkerStore = useTaskWorkerStore();

const postsFilter = computed(() => {
  return postStore.items.map((x) => {
    return {
      text: x.name,
      value: x.name,
    };
  });
});

const allColumns = ref([
  { key: "image" },
  {
    key: "name",
    sorter: (a: IUser, b: IUser) => a.name.localeCompare(b.name),
  },
  {
    key: "post",
    fixed: false,
    sorter: (a: IUser, b: IUser) =>
      a.postObject.name.localeCompare(b.postObject.name),
    filters: [...postsFilter.value],
    onFilter: (value: string, record: IUser) =>
      record.postObject.name.indexOf(value) === 0,
  },

  { key: "role" },
  { key: "birthday" },
  { key: "currentTask" },
  { key: "lastTime" },
  { key: "createdAt" },
  { key: "updatedAt" },
  { key: "action" },
  { key: "typePay" },
  { key: "oklad" },
]);
const optionsForSelect = computed(() =>
  allColumns.value.map((x) => {
    return {
      label: t(`table.user.${x.key}`),
      value: x.key,
    };
  })
);

const columnKeys = ref([
  "image",
  "name",
  "post",
  "currentTask",
  "lastTime",
  "action",
]);

const columns = computed(() =>
  allColumns.value
    .filter((x) => columnKeys.value.includes(x.key))
    .map((x) => {
      return {
        title: t(`table.user.${x.key}`),
        dataIndex: x.key,
        key: x.key,
        sorter: x.sorter,
        filters: x?.filters,
        onFilter: x?.onFilter,
        fixed: x.fixed,
      };
    })
);

// const columns = ref([
//   { title: "image", dataIndex: "image", key: "image", fixed: true },
//   {
//     title: "name",
//     dataIndex: "name",
//     key: "name",
//     fixed: true,
//     sorter: (a: IUser, b: IUser) => a.name.localeCompare(b.name),
//   },
//   {
//     title: "post",
//     dataIndex: "post",
//     key: "post",
//     fixed: false,
//     sorter: (a: IUser, b: IUser) =>
//       a.postObject.name.localeCompare(b.postObject.name),
//     filters: [...postsFilter.value],
//     onFilter: (value: string, record: IUser) =>
//       record.postObject.name.indexOf(value) === 0,
//   },
//   // { title: "phone", dataIndex: "phone", key: "phone", fixed: false },
//   { title: "role", dataIndex: "role", key: "role", fixed: false },
//   { title: "birthday", dataIndex: "birthday", key: "birthday", fixed: false },
//   { title: "lastTime", dataIndex: "lastTime", key: "lastTime", fixed: false },
//   {
//     title: "currentTask",
//     dataIndex: "currentTask",
//     key: "currentTask",
//     fixed: false,
//   },
//   {
//     title: "updatedAt",
//     dataIndex: "updatedAt",
//     key: "updatedAt",
//     fixed: false,
//   },
//   {
//     title: "action",
//     dataIndex: "action",
//     key: "action",
//     fixed: false,
//   },
// ]);

const open = ref<boolean>(false);

const showModal = () => {
  open.value = true;
};

const columnsData = computed(() => {
  return userStore.items
    .filter((x) => x.hidden === 1)
    .map((x) => {
      const taskWorkers = taskWorkerStore.items.filter(
        (y) => y.workerId === x.id
      );
      return {
        ...x,
        key: x.id,
        taskWorkers,
      };
    });
});
const defaultData: IUserInput = {
  name: "",
  phone: "",
  roleId: "",
  postId: "",
  birthday: "",
  typeWork: [],
};
const dataForm = ref(defaultData);

const onAddNewItem = () => {
  dataForm.value = defaultData;
  showModal();
};

const onEditItem = (item: IUser) => {
  console.log("item: ", item);

  dataForm.value = item;
  showModal();
};

const activeKey = ref("current");
</script>
<template>
  <div class="p-4">
    <VTitle :text="$t('page.user.title')" />
    <div class="flex flex-row items-center">
      <div class="flex-auto">
        <a-button type="primary" @click="onAddNewItem">
          {{ $t("form.add") }}
        </a-button>
      </div>
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
      <a-tab-pane key="current" :tab="$t('tabs.user.current')" force-render>
        <a-table
          :columns="columns"
          :data-source="columnsData"
          :row-class-name="(_record: IUser, index: number) => (_record.taskWorkers.length === 0 ? 'custom priority cursor-pointer bg-s-500/30 hover:!bg-s-500/40' : 'cursor-pointer')"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'action'">
              <a-button @click="onEditItem(record)">
                {{ $t("button.edit") }}
              </a-button>
            </template>
            <template v-if="column.key === 'value'">
              <span
                v-for="item in record.role"
                :key="item"
                class="p-1 border border-zink-200 rounded-lg mr-1"
              >
                {{ item }}
              </span>
            </template>
            <template v-if="column.key === 'post'">
              <!-- :style="{
                  background: record.postObject.color,
                  color: invertColor(record.postObject.color, true),
                }" -->
              <a-tag :bordered="false">
                {{ record.postObject?.name }}
              </a-tag>
            </template>
            <template v-if="column.key === 'currentTask'">
              <UserTask :workerId="record.id" />
            </template>
            <template v-if="column.key === 'role'">
              <a-tag>{{ record.roleObject?.name }}</a-tag>
            </template>
            <template v-if="column.key === 'image'">
              <!-- <a-avatar
                class="bg-s-500 dark:bg-s-800"
                src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
              /> -->
              <div class="relative w-12 h-12">
                <VImg :image="record.images?.[0]" class="w-full h-full" />
                <div
                  v-if="record.online"
                  class="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-green-500 border-4 border-white dark:border-s-800"
                ></div>
              </div>
            </template>
            <template v-if="column.key === 'birthday'">
              <p>{{ dayjs(record.birthday).format("DD MMMM YYYY") }}</p>
            </template>
            <template v-if="column.key === 'typePay'">
              <a-tag>
                {{ record.typePay ? $t(`typePay.${record.typePay}`) : "?" }}
              </a-tag>
            </template>
            <template v-if="column.key === 'lastTime'">
              <p>{{ dayjs(record.lastTime).fromNow() }}</p>
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
      </a-tab-pane>
      <a-tab-pane key="archive" :tab="$t('tabs.user.archive')" force-render>
      </a-tab-pane>
    </a-tabs>
  </div>

  <a-modal
    v-model:open="open"
    :destroyOnClose="false"
    :key="dataForm.id"
    :title="dataForm.id ? $t('form.user.edit') : $t('form.user.new')"
    :ok-button-props="{ hidden: true }"
    :cancel-button-props="{ hidden: true }"
  >
    <VFormUser
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

<style scoped></style>
