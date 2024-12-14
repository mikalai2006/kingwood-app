<script setup lang="ts" async>
import { computed, ref } from "vue";
import dayjs from "@/utils/dayjs";
import { useTaskStatusStore } from "@/store";
import { invertColor } from "@/utils/utils";
import { ITaskStatus } from "@/api/task_status/types";
import VFormTaskStatus from "@/components/Form/VFormTaskStatus.vue";
import VTitle from "@/components/VTitle.vue";

dayjs.locale("ru");
const taskStatusStore = useTaskStatusStore();

await taskStatusStore.find({ $limit: 200 });

const columns = ref([
  { title: "name", dataIndex: "name", key: "name", fixed: true },
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
  return taskStatusStore.items.map((x) => {
    return {
      ...x,
      key: x.id,
    };
  });
});
const defaultData: ITaskStatus = {};
const dataForm = ref(defaultData);

const onAddNewItem = () => {
  dataForm.value = defaultData;
  showModal();
};

const onEditItem = (item: ITaskStatus) => {
  console.log("edit taskStatus: ", item);

  dataForm.value = item;
  showModal();
};
</script>
<template>
  <div class="p-4">
    <VTitle :text="$t('page.task_status.title')" />
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
          <a-tag
            :color="record.color"
            :style="{ color: invertColor(record.color, true) }"
          >
            {{ record.name }}
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
    :title="$t('form.user.new')"
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
