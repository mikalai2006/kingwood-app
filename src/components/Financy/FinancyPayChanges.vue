<script setup lang="ts">
import {
  useAuthStore,
  useObjectStore,
  useOperationStore,
  useOrderStore,
  usePayStore,
  useUserStore,
  useWorkHistoryStore,
} from "@/store";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { getObjectTime } from "@/utils/time";
import dayjs from "@/utils/dayjs";
import { dateTimeFormat, dateTimeFullFormat, timeFormat } from "@/utils/date";
import { Colors } from "@/utils/colors";
import UserShortInfoText from "../User/UserShortInfoText.vue";
import { IPay } from "@/api/pay/types";
import UserInfoTag from "../User/UserInfoTag.vue";

const props = defineProps<{
  payId: string;
}>();

const { t } = useI18n();

const authStore = useAuthStore();
const userStore = useUserStore();
const payStore = usePayStore();

const pay = computed(() => payStore.items.find((x) => x.id == props.payId));
const payProps = computed(() => {
  const _list = pay.value
    ? {
        ...Object.values(pay.value.props),
      }
    : {};

  const _result = Object.values<{
    userId: string;
    item: IPay;
    time: string;
  }>(_list)
    .sort((a, b) => b.time.localeCompare(a.time))
    .map((x) => {
      return {
        ...x,
      };
    });
  return _result;
});
</script>

<template>
  <div class="p-4">
    <!-- {{ JSON.stringify(workHistoryProps[0].item) }} -->
    <div
      v-if="pay"
      class="flex flex-row gap-4 p-4 border-l border rounded-lg border-g-100 dark:border-g-700 bg-g-100 dark:bg-g-950/40 mb-4"
    >
      <div>
        <UserInfoTag :user-id="pay.userId" />
      </div>
      <div class="">
        <p class="font-medium">
          {{ pay.name }}
          <span class="text-g-500">
            | {{ pay.month }}-{{ pay.year }}
            <!-- {{ dayjs(workHistory?.to).format(timeFormat) }} -->
          </span>
        </p>
        <!-- <p class="text-g-500">
          {{ workHistory?.object.name }}
        </p> -->
      </div>
      <div class="text-end">
        <UserShortInfoText :user-id="pay.workerId" />
        <!-- 
        <TimePretty :time="getObjectTime(workHistory.totalTime)" /> -->
      </div>
      <div
        class="flex-auto text-end text-p-700 dark:text-p-400 font-medium text-base leading-5"
      >
        {{ pay?.total.toLocaleString("ru-RU") }} ₽
      </div>
    </div>
    <a-timeline>
      <a-timeline-item
        v-for="item in payProps"
        :key="item.time"
        :color="Colors.g[500]"
      >
        <div class="flex gap-4 text-s-500 dark:text-p-200">
          <div>
            {{ dayjs(item.time).format(dateTimeFormat) }}
          </div>
          <!-- <UserShortInfoText :user-id="item.userId" /> -->
        </div>
        <div class="flex gap-3 flex-row items-center">
          <div>
            <UserInfoTag :user-id="item.userId" />
          </div>
          <div
            class="flex-auto flex gap-3 border border-g-50 dark:border-g-700 p-2 rounded-lg bg-g-50 dark:bg-g-500/10"
          >
            <div class="flex-auto">
              <div class="leading-6 font-medium text-black dark:text-g-100">
                <span class="">
                  {{ item.item.name }}
                </span>
              </div>
              <p class="text-g-400 dark:text-g-400">
                {{ item.item.month }}-{{ item.item.year }}
              </p>
            </div>
            <!-- <p class="text-g-400 dark:text-g-400">
              {{ dayjs(item.item.from).format(dateTimeFullFormat) }} ->
              {{ dayjs(item.item.to).format(timeFormat) }}
            </p> -->
            <div class="flex flex-row items-center gap-4 leading-4">
              <div class="text-end">
                <div
                  class="text-p-700 dark:text-p-400 font-medium text-base leading-5"
                >
                  {{ item.item.total.toLocaleString("ru-RU") }} ₽
                </div>
                <!-- <TimePretty :time="getObjectTime(item.item.totalTime)" /> -->
              </div>
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
