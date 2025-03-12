<script setup lang="ts">
import {
  useAuthStore,
  useObjectStore,
  useOperationStore,
  useOrderStore,
  useUserStore,
  useWorkHistoryStore,
} from "@/store";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { getObjectTime } from "@/utils/time";
import { IWorkHistory } from "@/api/work_history/types";
import dayjs from "@/utils/dayjs";
import { dateTimeFormat, dateTimeFullFormat, timeFormat } from "@/utils/date";
import UserInfoTag from "../User/UserInfoTag.vue";
import { Colors } from "@/utils/colors";
import UserShortInfoText from "../User/UserShortInfoText.vue";

const props = defineProps<{
  workHistoryId: string;
}>();

const { t } = useI18n();

const authStore = useAuthStore();
const userStore = useUserStore();
const workHistoryStore = useWorkHistoryStore();
const orderStore = useOrderStore();
const objectStore = useObjectStore();
const operationStore = useOperationStore();

const workHistory = computed(() =>
  workHistoryStore.items.find((x) => x.id == props.workHistoryId)
);
const workHistoryProps = computed(() => {
  const _list = workHistory.value
    ? {
        ...Object.values(workHistory.value.props),
      }
    : {};

  const _result = Object.values<{
    userId: string;
    item: IWorkHistory;
    time: string;
  }>(_list)
    .sort((a, b) => b.time.localeCompare(a.time))
    .map((x) => {
      const operation = operationStore.items.find(
        (op) => op.id === x.item.operationId
      );
      const object = objectStore.items.find((op) => op.id === x.item.objectId);
      const order = orderStore.items.find((op) => op.id === x.item.orderId);

      return {
        ...x,
        operation,
        object,
        order,
      };
    });
  return _result;
});
</script>

<template>
  <div class="p-4">
    <!-- {{ JSON.stringify(workHistoryProps[0].item) }} -->
    <div
      v-if="workHistory"
      class="flex flex-row gap-4 p-4 border-l border rounded-lg border-g-100 dark:border-g-700 bg-g-100 dark:bg-g-950/40 mb-4"
    >
      <div class="flex-auto">
        <p class="font-medium">
          {{
            workHistory?.order.number
              ? "№" + workHistory?.order.number + " - "
              : ""
          }}{{ workHistory?.order.name }}
        </p>
        <p class="text-g-500">
          {{ workHistory?.object.name }}
        </p>
        <p class="text-g-500">
          {{ dayjs(workHistory?.from).format(dateTimeFullFormat) }} ->
          {{ dayjs(workHistory?.to).format(timeFormat) }}
        </p>
      </div>
      <div class="text-end">
        <div class="text-p-700 dark:text-p-400 font-medium text-base leading-5">
          {{ workHistory?.total.toLocaleString("ru-RU") }} ₽
        </div>
        <!-- <FinancyPaneTableTotal
                  v-if="workTimes"
                  :data="workTimes"
                  :pane="pane"
                /> -->
        <TimePretty :time="getObjectTime(workHistory.totalTime)" />
      </div>
    </div>
    <a-timeline>
      <a-timeline-item
        v-for="item in workHistoryProps"
        :key="item.time"
        :color="Colors.g[500]"
      >
        <div class="flex gap-4 text-s-500 dark:text-p-200">
          <div>
            {{ dayjs(item.time).format(dateTimeFormat) }}
          </div>
          <UserShortInfoText :user-id="item.userId" />
        </div>
        <div
          class="flex flex-row items-center border border-g-50 dark:border-g-700 p-2 rounded-lg bg-g-50 dark:bg-g-500/10"
        >
          <div class="flex-auto">
            <div>
              <div class="leading-6 font-medium text-black dark:text-g-100">
                <span class="">
                  {{
                    item.order?.number ? "№" + item.order?.number + " - " : ""
                  }}
                  {{ item.order?.name }}
                </span>
              </div>
              <p class="text-g-400 dark:text-g-400">
                {{ $t("table.financy.operation") }}: {{ item.operation?.name }},
                {{ t("table.financy.object") }}:
                {{ item.object?.name }}
              </p>
            </div>
            <p class="text-g-400 dark:text-g-400">
              {{ dayjs(item.item.from).format(dateTimeFullFormat) }} ->
              {{ dayjs(item.item.to).format(timeFormat) }}
            </p>
          </div>
          <div class="flex flex-row items-center gap-4 leading-4">
            <div class="text-end">
              <div
                class="text-p-700 dark:text-p-400 font-medium text-base leading-5"
              >
                {{ item.item.total.toLocaleString("ru-RU") }} ₽
              </div>
              <TimePretty :time="getObjectTime(item.item.totalTime)" />
            </div>
          </div>
        </div>
      </a-timeline-item>
    </a-timeline>
    <!-- <a-list
      v-if="workHistoryProps"
      item-layout="horizontal"
      :data-source="Object.values(workHistoryProps)"
    >
      <template #renderItem="{ item }">
        <a-list-item>
          <a-list-item-meta>
            <template #description>
              <div class="flex flex-row items-center leading-4">
                <div class="flex-auto">
                  <div>
                    <div class="text-s-500">
                      {{ dayjs(item.time).format(dateTimeFormat) }}
                    </div>
                    <div
                      class="leading-6 font-medium text-black dark:text-g-100"
                    >
                      <span class="">
                        {{
                          item.order?.number
                            ? "№" + item.order?.number + " - "
                            : ""
                        }}
                        {{ item.order?.name }}
                      </span>
                    </div>
                    {{ $t("table.financy.operation") }}:
                    {{ item.operation?.name }}, {{ t("table.financy.object") }}:
                    {{ item.object?.name }}
                  </div>
                </div>
                <div class="flex flex-row items-center gap-4">
                  <div class="text-end">
                    <div
                      class="text-p-700 dark:text-p-400 font-medium text-base leading-5"
                    >
                      {{ item.item.total.toLocaleString("ru-RU") }} ₽
                    </div>
                    <TimePretty :time="getObjectTime(item.item.totalTime)" />
                  </div>
                </div>
              </div>
            </template>
          </a-list-item-meta>
        </a-list-item>
      </template>
    </a-list> -->
  </div>
</template>
