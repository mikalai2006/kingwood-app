<script setup lang="ts">
import { IWorkTime } from "@/api/work_time/types";
import { useOrderStore, useWorkHistoryStore } from "@/store";
import dayjs from "@/utils/dayjs";
import { computed } from "vue";

const props = defineProps<{
  date: string;
  historyId: string;
  workTime: IWorkTime;
  widthOneMs: number;
}>();

const workHistoryStore = useWorkHistoryStore();
const orderStore = useOrderStore();

const workHistory = computed(() =>
  workHistoryStore.items.find((x) => x.id === props.historyId)
);

const order = computed(() =>
  orderStore.items.find((x) => x.id === workHistory.value?.orderId)
);

// const showFormWorkTime = ref(false);

// const defaultDataForm: IWorkTimeInput = {};

// const dataForm = ref(defaultDataForm);

// const onEditItem = (item: IWorkTime) => {
//   console.log("edit WorkTime: ", item);

//   dataForm.value = Object.assign({}, item);
//   showFormWorkTime.value = true;
// };

// const onAddItem = () => {
//   const userForPayload = userStore.items.find(
//     (x) => x.id === props.pane.workerId
//   );
//   if (!userForPayload) {
//     return;
//   }

//   const timeFrom = dayjs(props.date);
//   const timeTo = dayjs(props.date);
//   dataForm.value = Object.assign(
//     {},
//     {
//       workerId: userForPayload.id,
//       from: timeFrom.format(),
//       date: timeFrom.set("hour", 12).format(),
//       to: timeTo.endOf("day").set("seconds", 0).format(),
//       oklad: userForPayload.oklad,
//     }
//   );
//   showFormWorkTime.value = true;
// };

// const timeline = useTemplateRef<HTMLElement>("timeline");
// const widthTimeline = ref(0);
// const widthFirstTime = ref(0);
// useResizeObserver(timeline, (entries) => {
//   const entry = entries[0];
//   const child = entry.target.querySelector(".child")?.getBoundingClientRect();
//   // console.log(child?.width);
//   if (child) {
//     widthFirstTime.value = child.width;
//   }

//   const { width } = entry.contentRect;
//   widthTimeline.value = width;
// });

// const widthOneMs = computed(() => widthTimeline.value / (86400000 + 1800000));
const startDayMs = computed(() => dayjs(props.workTime.from).valueOf());
</script>

<template>
  <div
    v-if="workHistory"
    class="p-1 text-xs rounded-sm text-ellipsis overflow-hidden truncate bg-p-500"
    :style="{
      'max-width':
        Math.max(
          (dayjs(workHistory.to).valueOf() -
            dayjs(workHistory.from).valueOf()) *
            widthOneMs,
          5
        ) + 'px',
      marginLeft:
        Math.abs(startDayMs - dayjs(workHistory.from).valueOf()) * widthOneMs +
        'px',
    }"
  >
    №{{ order?.number }} {{ order?.name }}
  </div>

  <!-- <a-modal
    v-model:open="showFormWorkTime"
    :destroyOnClose="true"
    :title="$t('form.workTime.modalTitle')"
    :maskClosable="false"
    :ok-button-props="{ hidden: true }"
    :cancel-button-props="{ hidden: true }"
  >
    <VFormWorkTime
      :data="dataForm"
      :default-data="defaultDataForm"
      @callback="
        () => {
          showFormWorkTime = false;
        }
      "
    />
  </a-modal> -->
</template>
