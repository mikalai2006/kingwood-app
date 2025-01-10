<script setup lang="ts" async>
import { computed, ref } from "vue";
import dayjs from "@/utils/dayjs";
import { useOperationStore } from "@/store";
import { IOperation } from "@/api/operation/types";
import { invertColor } from "@/utils/utils";

dayjs.locale("ru");

const operationStore = useOperationStore();

await operationStore.find({ $limit: 200 });

const columns = ref([
  { title: "name", dataIndex: "name", key: "name", fixed: true },
  {
    title: "group",
    dataIndex: "group",
    key: "group",
    fixed: false,
  },
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
  return operationStore.items.map((x) => {
    return {
      ...x,
      key: x.id,
    };
  });
});
const defaultData: IOperation = {
  name: "",
  color: "",
};
const dataForm = ref(defaultData);

const onAddNewItem = () => {
  dataForm.value = defaultData;
  showModal();
};

const onEditItem = (item: IOperation) => {
  console.log("Edit operation: ", item);

  dataForm.value = item;
  showModal();
};
</script>

<template>
  <div class="p-4">
    <VTitle :text="$t('page.operation.title')" />
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
        <template v-if="column.key === 'name'">
          <!-- :color="record.color"
            :style="{ color: invertColor(record.color, true) }" -->
          <a-tag :bordered="false">
            {{ record.name }}
          </a-tag>
        </template>
        <template v-if="column.key === 'group'">
          <a-tag :bordered="false">{{
            $t(`groupOperation.${record.group}`)
          }}</a-tag>
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
