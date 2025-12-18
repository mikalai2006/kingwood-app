<script setup lang="ts">
import { useSystem } from "@/composable/useSystem";
import { usePostStore, useUserStore } from "@/store";
import dayjs from "@/utils/dayjs";
import { getShortFIO } from "@/utils/utils";
import { computed } from "vue";

const props = defineProps<{
  objectsWithWork: { [key: string]: any }[];
  day: { dayString: string; day: string };
}>();

const { isElectron } = useSystem();
const userStore = useUserStore();
const postStore = usePostStore();

const idsPostMontaj = computed(() =>
  postStore.items
    .filter((x) => x.name.toLowerCase().indexOf("монтаж") > -1)
    .map((x) => x.id)
);

const existMontajnikWorkByDay = computed(() => {
  return Object.values(props.objectsWithWork).reduce((ac, current) => {
    if (!ac) {
      ac = [];
    }

    ac.push(...Object.keys(current));
    return ac;
  }, []);
});

const montajnikWithoutWorkByDay = computed(() => {
  return userStore.items.filter(
    (x) =>
      idsPostMontaj.value.includes(x.postId) &&
      !existMontajnikWorkByDay.value.includes(x.id)
  );
});

const isSameDay = computed(() => dayjs().isSame(props.day.day, "day"));

// const activeStyle = computed(() => {
//   let _style = {
//     background: "transparent",
//     color:
//       generalStore.themeMode == "dark"
//         ? isSameDay.value
//           ? "#fff"
//           : "#bbb"
//         : isSameDay.value
//         ? "#000"
//         : "#555",
//     // left: "0px",
//     // top: "0px",
//     // width: "0px",
//   };

//   if (
//     activeTaskWorker.value &&
//     isSameDay.value &&
//     ["process"].includes(activeTaskWorker.value.taskStatus.status)
//   ) {
//     _style = {
//       background: activeTaskWorker.value.taskStatus?.color,
//       color: invertColor(activeTaskWorker.value.taskStatus?.color, true),
//       // left: `${props.taskMW.stat.startCol * props.sizeColumn + 3}px`,
//       // top: `${props.index * 35 + 3}px`,
//       // width: `${props.taskMW.stat.length * props.sizeColumn - 5}px`,
//     };
//   }
//   return _style;
// });
</script>

<template>
  <div class="z-50 rounded-lg">
    <div v-for="worker in montajnikWithoutWorkByDay">
      <div
        class="flex-auto text-nowrap font-normal text-red-500 dark:text-red-200"
        :class="[{ 'text-[11px]': !isElectron }]"
      >
        {{ getShortFIO(worker?.name) }}
      </div>
    </div>
  </div>
</template>
