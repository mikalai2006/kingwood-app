<script setup lang="ts" async>
import { computed, ref } from "vue";
import dayjs from "@/utils/dayjs";
import { useAuthStore, useOperationStore } from "@/store";
import { IOperation, IOperationInput } from "@/api/operation/types";
import { useI18n } from "vue-i18n";

dayjs.locale("ru");

const { t } = useI18n();

const authStore = useAuthStore();
const operationStore = useOperationStore();

await operationStore.find({ $limit: 200 });

const columns = ref([
  {
    title: t("table.operation.name"),
    dataIndex: "name",
    key: "name",
    fixed: true,
  },
  {
    title: t("table.operation.group"),
    dataIndex: "group",
    key: "group",
    fixed: false,
  },
  {
    title: t("table.operation.updatedAt"),
    dataIndex: "updatedAt",
    key: "updatedAt",
    fixed: false,
  },
  {
    title: t("table.operation.action"),
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
  return operationStore.items.map((x) => {
    return {
      ...x,
      key: x.id,
    };
  });
});
const defaultData: IOperationInput = {};
const dataForm = ref(defaultData);

const onAddNewItem = () => {
  dataForm.value = Object.assign({}, defaultData);
  showModal();
};

const onEditItem = (item: IOperation) => {
  console.log("Edit operation: ", item);

  dataForm.value = Object.assign({}, item);
  showModal();
};
</script>

<template>
  <div class="flex-auto p-4">
    <VTitle :text="$t('page.operation.title')" />
    <div class="my-2">
      <a-tooltip v-if="authStore.roles.includes('operation-create')">
        <template #title>
          {{ $t("form.operation.new") }}
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
            v-if="authStore.roles.includes('operation-create')"
            @click="onEditItem(record)"
          >
            {{ $t("button.edit") }}
          </a-button>
        </template>
        <template v-if="column.key === 'name'">
          <!-- :color="record.color"
            :style="{ color: invertColor(record.color, true) }" -->
          <p>
            {{ record.name }}
          </p>
        </template>
        <template v-if="column.key === 'group'">
          <p>
            {{ $t(`groupOperation.${record.group}`) }}
          </p>
        </template>
        <template v-if="column.key === 'updatedAt'">
          {{ dayjs(record.updatedAt).fromNow() }}
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
    :title="dataForm.id ? $t('form.operation.edit') : $t('form.operation.new')"
    :ok-button-props="{ hidden: true }"
    :cancel-button-props="{ hidden: true }"
  >
    <VFormOperation
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
