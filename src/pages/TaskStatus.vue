<script setup lang="ts" async>
import { computed, ref } from "vue";
import dayjs from "@/utils/dayjs";
import { useAuthStore, useTaskStatusStore } from "@/store";
import { invertColor } from "@/utils/utils";
import { ITaskStatus, ITaskStatusInput } from "@/api/task_status/types";
import VFormTaskStatus from "@/components/Form/VFormTaskStatus.vue";
import VTitle from "@/components/VTitle.vue";
import { useI18n } from "vue-i18n";

dayjs.locale("ru");
const { t } = useI18n();

const authStore = useAuthStore();
const taskStatusStore = useTaskStatusStore();

await taskStatusStore.find({ $limit: 200 });

const columns = ref([
  {
    title: t("table.taskStatus.name"),
    dataIndex: "name",
    key: "name",
    fixed: true,
  },
  {
    title: t("table.taskStatus.updatedAt"),
    dataIndex: "updatedAt",
    key: "updatedAt",
    fixed: false,
  },
  {
    title: t("table.taskStatus.action"),
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
  return taskStatusStore.items.map((x) => {
    return {
      ...x,
      key: x.id,
    };
  });
});
const defaultData: ITaskStatusInput = {};
const dataForm = ref(defaultData);

const onAddNewItem = () => {
  dataForm.value = Object.assign({}, defaultData);
  showModal();
};

const onEditItem = (item: ITaskStatus) => {
  console.log("edit taskStatus: ", item);

  dataForm.value = Object.assign({}, item);
  showModal();
};
</script>
<template>
  <div class="flex-auto p-4">
    <VTitle :text="$t('page.taskStatus.title')" />
    <div class="my-2">
      <a-tooltip v-if="authStore.roles.includes('taskStatus-create')">
        <template #title>
          {{ $t("form.taskStatus.new") }}
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
            v-if="authStore.roles.includes('taskStatus-patch')"
            @click="onEditItem(record)"
          >
            {{ $t("button.edit") }}
          </a-button>
        </template>
        <template v-if="column.key === 'name'">
          <a-tag
            :color="record.color"
            :style="{ color: invertColor(record.color, true) }"
          >
            {{ record.name }}
          </a-tag>
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
    :title="
      dataForm?.id ? $t('form.taskStatus.edit') : $t('form.taskStatus.new')
    "
    :ok-button-props="{ hidden: true }"
    :cancel-button-props="{ hidden: true }"
  >
    <VFormTaskStatus
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
