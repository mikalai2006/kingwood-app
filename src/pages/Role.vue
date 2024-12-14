<script setup lang="ts" async>
import { IRole } from "@/api/role/types";
import VFormRole from "@/components/Form/VFormRole.vue";
import { useRoleStore } from "@/store/modules/role";
import { Rule } from "ant-design-vue/es/form";
import { computed, reactive, ref, toRaw, UnwrapRef } from "vue";

const roleStore = useRoleStore();

await roleStore.find();

const columns = ref([
  { title: "Name", dataIndex: "name", key: "name", fixed: true },
  { title: "code", dataIndex: "code", key: "code", fixed: false },
  { title: "value", dataIndex: "value", key: "value", fixed: false },
  {
    title: "updatedAt",
    dataIndex: "updatedAt",
    key: "updatedAt",
    fixed: false,
  },
  {
    title: "action",
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
  return roleStore.items.map((x) => {
    return {
      ...x,
      key: x.id,
    };
  });
});
const defaultData: IRole = {
  name: "",
  code: "",
  value: [],
  sortOrder: 0,
};
const dataForm = ref(defaultData);

const onAddNewItem = () => {
  dataForm.value = defaultData;
  showModal();
};

const onEditItem = (item: IRole) => {
  console.log("item: ", item);

  dataForm.value = item;
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
      <a-button type="primary" @click="onAddNewItem">{{
        $t("form.add")
      }}</a-button>
    </div>
    <a-table :columns="columns" :data-source="columnsData">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'action'">
          <a-button @click="onEditItem(record)">
            {{ $t("button.edit") }}
          </a-button>
        </template>
        <template v-if="column.key === 'value'">
          <a-tag :bordered="false" v-for="item in record.value" :key="item">
            {{ $t(`privilege.${item}`) }}
          </a-tag>
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
    :destroyOnClose="false"
    :key="dataForm.id"
    :title="$t('form.role.new')"
    :ok-button-props="{ hidden: true }"
    :cancel-button-props="{ hidden: true }"
  >
    <VFormRole
      :data="dataForm"
      :default-data="defaultData"
      @callback="
        () => {
          // open = false;
        }
      "
    />
  </a-modal>
</template>

<style scoped></style>
