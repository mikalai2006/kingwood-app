<script setup lang="ts">
import { computed, h } from "vue";
import {
  CheckCircleFilled,
  CheckOutlined,
  DownOutlined,
  ReloadOutlined,
  SyncOutlined,
} from "@ant-design/icons-vue";

import { useOperationStore, useTaskStore, useUserStore } from "@/store";

const props = defineProps<{ orderId: string }>();

const taskStore = useTaskStore();
const operationStore = useOperationStore();
const userStore = useUserStore();

const tasksByOrder = computed(() => {
  return taskStore.items
    .filter((x) => x.orderId === props.orderId)
    .map((x, index) => {
      const operation = operationStore.items.find(
        (y) => y.id === x.operationId
      );
      const worker = userStore.items.find((y) => x.workerId === y.id);
      return {
        title: operation?.name,
        subTitle: "00:00:05",
        description: worker?.name,
        // icon: h(LoadingOutlined),
        // status: index == 1 ? "process" : "finish",
      };
    });
});

const innerColumns = [
  { title: "step", dataIndex: "step", key: "step" },
  { title: "Date", dataIndex: "date", key: "date" },
  { title: "Name", dataIndex: "name", key: "name" },
  { title: "Status", key: "state" },
  { title: "Upgrade Status", dataIndex: "upgradeNum", key: "upgradeNum" },
  {
    title: "Action",
    dataIndex: "operation",
    key: "operation",
  },
];
</script>
<template>
  <a-table
    :columns="innerColumns"
    :data-source="tasksByOrder"
    :pagination="false"
  >
    <template #bodyCell="{ column, index }">
      <template v-if="column.key === 'step'">
        <span class="bg-s-200 rounded-full p-2 px-4">
          {{ index }}
        </span>
      </template>
      <template v-if="column.key === 'state'">
        <span>
          <a-badge status="success" />
          Finished
        </span>
      </template>
      <template v-else-if="column.key === 'operation'">
        <span class="table-operation">
          <a>Pause</a>
          <a>Stop</a>
          <a-dropdown>
            <template #overlay>
              <a-menu>
                <a-menu-item>Action 1</a-menu-item>
                <a-menu-item>Action 2</a-menu-item>
              </a-menu>
            </template>
            <a>
              More
              <DownOutlined />
            </a>
          </a-dropdown>
        </span>
      </template>
    </template>
  </a-table>
</template>

<style scoped></style>
