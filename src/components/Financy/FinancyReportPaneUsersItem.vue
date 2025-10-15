<script setup lang="ts">
import { IPaneOptionFinancy, IPaneOptionFinancyInput } from "@/api/types";
import { useUserStore, useWorkHistoryStore } from "@/store";
import dayjs from "@/utils/dayjs";
import { computed, ref } from "vue";
import UserInfoTag from "../User/UserInfoTag.vue";
import { iChevronRight } from "@/utils/icons";

const props = defineProps<{
  pane: IPaneOptionFinancy;
  workerId: string;
}>();

const emit = defineEmits({
  onChangeTabPane: (data: IPaneOptionFinancyInput) => {
    return `true`;
  },
});

const userStore = useUserStore();
const workHistoryStore = useWorkHistoryStore();

const month = ref(dayjs(props.pane.month) || "");

const currentDate = computed(() => dayjs(month.value));

const worker = computed(() =>
  userStore.items.find((x) => x.id == props.workerId)
);

const workHistorysForWorker = computed(() =>
  workHistoryStore.items.filter(
    (x) =>
      x.workerId == props.workerId &&
      dayjs(x.to).year() > 1 &&
      dayjs(x.to)
        .utc(true)
        .isBetween(
          currentDate.value.utc(true).startOf("month"),
          currentDate.value.utc(true).endOf("month"),
          "day",
          "[]"
        )
  )
);

const total = computed(() => {
  return workHistorysForWorker.value.reduce((a, e) => a + e.total, 0);
});

const totalTime = computed(() => {
  return workHistorysForWorker.value.reduce((a, e) => a + e.totalTime, 0);
});
</script>

<template>
  <div
    :to="{
      name: 'financyWorker',
      params: {
        workerId: workerId,
      },
    }"
    class="flex flex-row items-center cursor-pointer gap-3 p-2 mb-2 rounded-lg"
    :class="[
      workerId === pane.workerId
        ? 'bg-s-100 dark:bg-g-600'
        : ' cursor-pointer bg-transparent dark:bg-g-900/50 hover:bg-s-100 dark:hover:bg-g-800',
    ]"
    @click="
      emit(
        'onChangeTabPane',
        Object.assign({}, props.pane, {
          workerId,
        })
      )
    "
  >
    <div>
      <UserInfoTag :user-id="workerId" show-post />
    </div>
    <!-- <div class="flex-auto text-end">
      <div class="text-base font-medium text-p-700 dark:text-p-400">
        {{ total.toLocaleString("ru-RU") }} ₽
      </div>
    </div> -->
    <div class="flex-auto text-end">
      <a-button type="link">
        <div class="flex items-center">
          <!-- <div>
            {{ $t("page.financy.financyViewReport") }}
          </div> -->
          <div>
            <VIcon :path="iChevronRight" class="transition-all" />
            <!-- :class="[
                workerId === pane.workerId
                  ? 'text-p-500 dark:text-p-200'
                  : 'text-g-300 dark:text-g-600',
              ]" -->
          </div>
        </div>
      </a-button>
    </div>
  </div>
</template>
