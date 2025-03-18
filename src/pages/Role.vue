<script setup lang="ts" async>
import { IRole, IRoleInput } from "@/api/role/types";
import VFormRole from "@/components/Form/VFormRole.vue";
import { useRoleStore } from "@/store/modules/role";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import dayjs from "@/utils/dayjs";
import { useAuthStore } from "@/store";

const { t } = useI18n();

const roleStore = useRoleStore();
const authStore = useAuthStore();

await roleStore.find();

const columns = ref([
  { title: t("table.role.name"), dataIndex: "name", key: "name", fixed: true },
  { title: t("table.role.code"), dataIndex: "code", key: "code", fixed: false },
  {
    title: t("table.role.value"),
    dataIndex: "value",
    key: "value",
    fixed: false,
  },
  {
    title: t("table.role.updatedAt"),
    dataIndex: "updatedAt",
    key: "updatedAt",
    fixed: false,
  },
  {
    title: t("table.role.action"),
    dataIndex: "action",
    key: "action",
    fixed: false,
  },
]);

const open = ref<boolean>(false);

const showModal = () => {
  open.value = true;
};

const columnsData = computed(() => {
  return roleStore.items
    .filter((x) => !x.hidden || authStore.code === "systemrole")
    .map((x) => {
      return {
        ...x,
        key: x.id,
      };
    });
});
const defaultData: IRoleInput = {
  value: [],
  sortOrder: 0,
};
const dataForm = ref(defaultData);

const onAddNewItem = () => {
  dataForm.value = Object.assign({}, defaultData);
  showModal();
};

const onEditItem = (item: IRole) => {
  import.meta.env.VIEW_CONSOLE && console.log("item: ", item);

  dataForm.value = Object.assign({}, item);
  showModal();
};
// const handleOk = (e: MouseEvent) => {
//   console.log(e);
//   open.value = false;
// };
</script>
<template>
  <div class="p-4">
    <VTitle :text="$t('page.role.title')" />
    <!-- <div>{{ JSON.stringify(roleStore.roles) }}</div> -->
    <div class="my-2">
      <a-tooltip v-if="authStore.roles.includes('role-create')">
        <template #title>
          {{ $t("form.role.new") }}
        </template>
        <a-button type="primary" @click="onAddNewItem">
          {{ $t("form.add") }}
        </a-button>
      </a-tooltip>
    </div>
    <a-table :columns="columns" :data-source="columnsData">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'action'">
          <a-button
            v-if="authStore.roles.includes('role-patch')"
            @click="onEditItem(record)"
          >
            {{ $t("button.edit") }}
          </a-button>
        </template>
        <template v-if="column.key === 'value'">
          <a-tag :bordered="false" v-for="item in record.value" :key="item">
            {{ $t(`privilege.${item}`) }}
          </a-tag>
          <!-- <div>
            {{
              record.value
                .map((item: string) => $t(`privilege.${item}`))
                .join(", ")
            }}
          </div> -->
        </template>

        <template v-if="column.key === 'createdAt'">
          {{ dayjs(record.createdAt).fromNow() }}
        </template>
      </template>
      <!-- <template #expandedRowRender="{ record }">
        <p style="margin: 0">
          {{ record.description }}
        </p>
      </template>
      <template #expandColumnTitle>
        <span style="color: red">More</span>
      </template> -->
    </a-table>
  </div>

  <a-modal
    v-model:open="open"
    :destroyOnClose="true"
    :key="dataForm.id"
    :title="dataForm?.id ? $t('form.role.edit') : $t('form.role.new')"
    :ok-button-props="{ hidden: true }"
    :cancel-button-props="{ hidden: true }"
  >
    <VFormRole
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
