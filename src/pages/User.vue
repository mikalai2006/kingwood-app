<script setup lang="ts" async>
import { IUser, IUserInput } from "@/api/user/types";
import VFormUser from "@/components/Form/VFormUser.vue";
import { useUserStore } from "@/store/modules/user";
import { computed, ref, onMounted, h } from "vue";
import dayjs from "@/utils/dayjs";
import {
  useAuthStore,
  useGeneralStore,
  usePostStore,
  useRoleStore,
  useTaskStore,
  useTaskWorkerStore,
} from "@/store";
import { replaceSubstringByArray } from "@/utils/utils";
import { useI18n } from "vue-i18n";
import UserList from "@/components/User/UserList.vue";
import { message, Modal } from "ant-design-vue";
import VIcon from "@/components/UI/VIcon.vue";
import { iCog, iWraningTriangle } from "@/utils/icons";
import { Colors } from "@/utils/colors";

dayjs.locale("ru");
const userStore = useUserStore();
const postStore = usePostStore();
const generalStore = useGeneralStore();
const roleStore = useRoleStore();

const { t } = useI18n();

const taskStore = useTaskStore();
const authStore = useAuthStore();
const taskWorkerStore = useTaskWorkerStore();

const postsFilter = computed(() => {
  return postStore.items.map((x) => {
    return {
      text: x.name,
      value: x.name,
    };
  });
});

const isWorkFilter = computed(() => {
  return [0, 1].map((x) => {
    return {
      text: t(`table.user.isWork${x}`),
      value: x,
    };
  });
});

const allColumns = computed(() => [
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
    filters: postsFilter.value,
    onFilter: (value: string, record: IUser) =>
      record.postObject.name.indexOf(value) === 0,
  },
  {
    key: "isWork",
    fixed: false,
    filters: isWorkFilter.value,
    onFilter: (value: number, record: IUser) => record.isWork === value,
    width: 300,
  },
  { key: "role" },
  { key: "birthday" },
  { key: "currentTask" },
  { key: "lastTime" },
  { key: "createdAt" },
  { key: "updatedAt" },
  { key: "typePay" },
  { key: "oklad" },
  { key: "action" },
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
  "isWork",
  "post",
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
        width: x.width,
      };
    })
);

const open = ref<boolean>(false);

const showModal = () => {
  open.value = true;
};

const defaultData: IUserInput = {
  typeWork: [],
  oklad: 0,
  birthday: "",
  phone: "",
};
const dataForm = ref(defaultData);

const onAddNewItem = () => {
  dataForm.value = Object.assign({}, defaultData);
  showModal();
};

const onRemoveItem = (item: IUser) => {
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
              t("form.task.delete")
            ),
            h(
              "div",
              {},
              replaceSubstringByArray(t("message.userRemove"), [item?.name])
            ),
          ]
        ),
      ]
    ),
    okButtonProps: { type: "primary", danger: true },
    okText: t("button.delete"),
    cancelText: t("button.cancel"),
    onOk() {
      return new Promise((resolve, reject) => {
        try {
          if (item.id) {
            userStore
              .onRemove(item.id)
              .then(() => {
                message.success(t("message.userRemoveOk"));
              })
              .catch((error: any) => {
                throw new Error(error);
              });
          }

          // setTimeout(Math.random() > 0.5 ? resolve : reject, 1000);
          resolve("");
        } catch (e: any) {
          throw new Error(e);
        }
      }).catch((e: any) => {
        throw new Error(e);
      });
    },
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onCancel() {},
  });
};

const onRemoveUser = (item: IUser) => {
  if (item.id) {
    userStore
      .onRemove(item.id)
      .then(() => {
        message.success(t("message.userRemoveOk"));
      })
      .catch((error: any) => {
        throw new Error(error);
      });
  }
};

const onEditItem = (item: IUser) => {
  // console.log("Edit user: ", item);

  dataForm.value = Object.assign({}, item);
  showModal();
};
const nameKeyLocalStorageColumns = ref("user.column");
const onSetColumns = (value: string, key: string, data: string[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};

const activeKey = ref("current");

const roleUser = computed(() =>
  roleStore.items.filter((x) => x.code === "user").map((x) => x.id)
);

onMounted(() => {
  // sync columns from localStorage.
  const _columns = localStorage.getItem(nameKeyLocalStorageColumns.value);
  if (_columns) {
    columnKeys.value = JSON.parse(_columns);
  }
});
</script>
<template>
  <div class="flex-auto">
    <VHeader :title="$t('page.user.title')">
      <template #back>&nbsp;</template>
      <template #header>
        <div class="flex flex-row items-center">
          <div class="flex-auto">
            <a-button type="primary" @click="onAddNewItem">
              {{ $t("form.add") }}
            </a-button>
          </div>
          <div class="flex gap-2">
            <a-popover
              :title="$t('table.order.fields')"
              trigger="click"
              placement="topRight"
            >
              <template #content>
                <!-- <span class="whitespace-nowrap">
                  {{ $t("table.order.fields") }}
                </span> -->
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
                    <span style="color: red"
                      >+ {{ omittedValues.length }} ...</span
                    >
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
      destroyInactiveTabPane
      type="card"
      :tabBarStyle="{
        position: 'sticky',
        top: 0,
        'padding-left': '15px',
        margin: '0px',
        'z-index': 50,
        background:
          generalStore.themeMode === 'dark' ? Colors.g[951] : Colors.s[200],
      }"
    >
      <a-tab-pane key="current" :tab="$t('tabs.user.current')">
        <UserList
          :columns="columns"
          key-list="current"
          :params="{
            blocked: 0,
            hidden: 0,
            // taskWorkers: { $gte: { $size: 1 } },
          }"
          @on-edit-item="onEditItem"
          @on-remove-item="onRemoveItem"
        />
      </a-tab-pane>
      <a-tab-pane key="notTask" :tab="$t('tabs.user.notTask')">
        <UserList
          :columns="columns"
          key-list="notTask"
          :params="{
            blocked: 0,
            hidden: 0,
            taskWorkers: { $size: 0 },
            roleId: roleUser,
          }"
          @on-edit-item="onEditItem"
          @on-remove-item="onRemoveItem"
        />
      </a-tab-pane>
      <a-tab-pane key="archive" :tab="$t('tabs.user.archive')">
        <UserList
          :columns="columns"
          key-list="archive"
          :params="{
            blocked: 1,
            hidden: 0,
          }"
          @on-edit-item="onEditItem"
          @on-remove-item="onRemoveItem"
        />
      </a-tab-pane>
      <a-tab-pane
        v-if="authStore.code === 'systemrole'"
        key="hiddden"
        :tab="$t('tabs.user.hidden')"
      >
        <UserList
          :columns="columns"
          key-list="hiddden"
          :params="{
            hidden: 1,
          }"
          @on-edit-item="onEditItem"
          @on-remove-item="onRemoveItem"
        />
      </a-tab-pane>
    </a-tabs>
  </div>

  <a-modal
    v-model:open="open"
    :destroyOnClose="true"
    :key="dataForm.id"
    :title="dataForm.id ? $t('form.user.edit') : $t('form.user.new')"
    :ok-button-props="{ hidden: true }"
    :cancel-button-props="{ hidden: true }"
    style="margin: 0 auto; width: 800px"
    wrapClassName="b-scroll modal-user"
    :bodyStyle="{ margin: 0, padding: 0 }"
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

<style>
.modal-user {
  .ant-modal-content {
    padding: 0;
  }
  .ant-modal-header {
    padding: 15px;
    margin: 0;
    background-color: #00000010 !important;
  }
  .ant-tabs-nav {
    background-color: #00000010 !important;
  }
}
</style>
