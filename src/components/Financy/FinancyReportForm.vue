<script setup lang="ts">
import { computed, ref } from "vue";
import dayjs from "@/utils/dayjs";
import { IPaneOptionFinancy, IPaneOptionFinancyInput } from "@/api/types";
import { usePayStore, useWorkHistoryStore } from "@/store";

const props = defineProps<{
  pane: IPaneOptionFinancy;
}>();

const emit = defineEmits({
  onChangeTabPane: (data: IPaneOptionFinancyInput) => {
    return `true`;
  },
});

const workHistoryStore = useWorkHistoryStore();
const payStore = usePayStore();

const month = ref(dayjs(props.pane.month) || "");
const orderId = ref(props.pane.orderId);

const currentDate = computed(() => dayjs(month.value));

const countDays = computed(() =>
  month.value ? currentDate.value.daysInMonth() : 0
);

const onQuery = (isSaveOption: boolean) => {
  const data: IPaneOptionFinancyInput = {
    ...props.pane,
    month: month.value?.toString(),
    monthIndex: month.value.month(),
    orderId: orderId.value,
    // workerId: workerId.value,
    title: `${currentDate.value.format("YYYY-MM")}`,
  };
  if (isSaveOption) {
    emit("onChangeTabPane", data);
  }

  if (!month.value) {
    return;
  }
  workHistoryStore.find({
    // workerId: workerId.value ? [workerId.value] : undefined,
    from: month.value ? currentDate.value.startOf("month").format() : undefined,
    to: month.value ? currentDate.value.endOf("month").format() : undefined,
    $limit: 10000,
  });

  payStore.find({
    month: currentDate.value.month(),
    year: currentDate.value.year(),
  });
};
</script>

<template>
  <div class="p-4 bg-s-100 dark:bg-g-800 rounded-lg">
    <a-form layout="vertical" class="flex items-center gap-4">
      <!-- <a-form-item :label="$t('form.order.name')" name="orderId">
            <a-select
              v-model:value="orderId"
              :placeholder="$t('form.financy.selectOrder')"
              :options="state.data"
              @search="onFetchOrders"
              :show-search="true"
              :filter-option="false"
              :not-found-content="state.value ? undefined : null"
              @change="onQuery"
            >
            </a-select>
          </a-form-item> -->

      <!-- <a-form-item :label="$t('form.financy.workerId')" name="workerId">
        <a-select
          v-model:value="workerId"
          show-search
          allowClear
          :options="workers"
          :placeholder="$t('form.taskWorker.selectWorkerId')"
          :filter-option="filterOption"
          @change="() => onQuery(true)"
        >
          <template #option="{ value, label, post }">
            <div class="flex flex-row">
              <div class="flex-auto">
                {{ label }}
              </div>
              <div class="text-s-500">{{ post?.name }}</div>
            </div>
          </template>
        </a-select>
      </a-form-item> -->
      <div>
        {{ $t("form.financy.month") }}
      </div>
      <div>
        <a-date-picker
          v-model:value="month"
          picker="month"
          @change="() => onQuery(true)"
        />
      </div>
    </a-form>
  </div>
</template>
