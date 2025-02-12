<script setup lang="ts">
import { useOperationStore } from "@/store";
import { computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { IWorkHistoryStatByOrder } from "@/api/work_history/types";

const props = defineProps<{
  stat: IWorkHistoryStatByOrder;
}>();

const { t } = useI18n();

const operationStore = useOperationStore();

const operationsStat = computed(() => {
  const _list = props.stat.operations.map((x) => {
    const operation = operationStore.items.find(
      (_operation) => _operation.id === x.operationId
    );
    return {
      ...x,
      operation,
    };
  });
  return _list;
});

const innerColumns = [
  {
    title: t("table.financyOrder.operation"),
    dataIndex: "operation",
    key: "operation",
  },
  { title: t("table.financyOrder.total"), dataIndex: "total", key: "total" },
];

onMounted(() => {});
</script>

<template>
  <a-table
    :columns="innerColumns"
    :data-source="operationsStat"
    :pagination="false"
  >
    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'operation'">
        <p>
          {{ record.operation?.name }}
        </p>
      </template>
      <template v-if="column.key === 'total'">
        <p>{{ record.total.toLocaleString("ru-RU") }} ₽</p>
      </template>
    </template>
  </a-table>
</template>
