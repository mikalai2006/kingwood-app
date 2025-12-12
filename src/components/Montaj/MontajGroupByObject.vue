<script setup lang="ts" async>
import { useUserStore } from "@/store/modules/user";
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import dayjs from "@/utils/dayjs";
import {
  useObjectStore,
  useOperationStore,
  useOrderStore,
  useTaskStatusStore,
  useTaskStore,
  useTaskWorkerStore,
} from "@/store";
import { useI18n } from "vue-i18n";
import { Dayjs } from "dayjs";
import MontajListItemRelative from "./MontajListItemRelative.vue";
import { IWeekDay } from "@/api/types";
import { Colors } from "@/utils/colors";
import MontajListNotWorkByDay from "./MontajListNotWorkByDay.vue";
import { iChevronDown, iChevronRight } from "@/utils/icons";
import MontajObjectOrders from "./MontajObjectOrders.vue";
import MontajObjectOrdersInTable from "./MontajObjectOrdersInTable.vue";

dayjs.locale("ru");

const props = defineProps<{
  weekDays: IWeekDay[];
}>();

const emit = defineEmits(["onEditTaskWorker", "onAddNewTaskWorker"]);

const userStore = useUserStore();
const orderStore = useOrderStore();
const taskStatusStore = useTaskStatusStore();
const objectStore = useObjectStore();
const taskStore = useTaskStore();
const operationStore = useOperationStore();
const taskWorkerStore = useTaskWorkerStore();

const { t } = useI18n();

const operationMontaj = computed(() =>
  operationStore.items.filter(
    (x) => x.name.toLowerCase().indexOf("монтаж") > -1
  )
);

const idsInstallOperation = computed(() =>
  operationStore.items.filter((x) => x.group === "5").map((x) => x.id)
);

const taskWorkersForMontaj = computed(() => {
  return props.weekDays.length
    ? taskWorkerStore.items.filter(
        (x) =>
          idsInstallOperation.value.includes(x.operationId) &&
          !["finish", "autofinish"].includes(x.status) &&
          (dayjs(props.weekDays[0].day).isBetween(
            dayjs(x.from),
            dayjs(x.to),
            "day",
            "[]"
          ) ||
            dayjs(props.weekDays[props.weekDays.length - 1].day).isBetween(
              dayjs(x.from),
              dayjs(x.to),
              "day",
              "[]"
            ) ||
            dayjs(x.from).isBetween(
              dayjs(props.weekDays[0].day),
              dayjs(props.weekDays[props.weekDays.length - 1].day),
              "day",
              "[]"
            ) ||
            dayjs(x.to).isBetween(
              dayjs(props.weekDays[0].day),
              dayjs(props.weekDays[props.weekDays.length - 1].day),
              "day",
              "[]"
            ))
      )
    : [];
});

// const taskWorkerMontajGroup = computed(() =>
//   groupBy(taskWorkersForMontaj.value, "objectId")
// );

const idsObjectMontaj = computed(() => {
  const _ids = taskWorkersForMontaj.value.map((x) => x.objectId);

  // const _idsObjectGoComplete = orderStore.items
  //   .filter(
  //     (x) =>
  //       [1, 100].includes(x.status) &&
  //       x.goComplete == 1 &&
  //       x.dateOtgruzka == "0001-01-01T00:00:00Z"
  //   )
  //   .map((x) => x.objectId);

  // _ids.push(..._idsObjectGoComplete);

  return [...new Set([..._ids])];
});

const ordersGoComplete = computed(() => {
  const _ordersGoComplete = orderStore.items.filter(
    (x) =>
      [1, 100].includes(x.status) &&
      x.goComplete == 1 &&
      x.dateOtgruzka == "0001-01-01T00:00:00Z"
  );
  return _ordersGoComplete;
});

const idsObjectGoComplete = computed(() => {
  const _idsObjectGoComplete = ordersGoComplete.value.map((x) => x.objectId);

  const uniqueIds = [...new Set([..._idsObjectGoComplete])];

  return objectStore.items.filter((x) => uniqueIds.includes(x.id));
});

const objectsForMontaj = computed(() => {
  const _montajObjectIds = idsObjectMontaj.value.map((x) => {
    return objectStore.items.find((y) => y.id == x);
  });

  return _montajObjectIds;
});

// const ordersForMontaj = computed(() =>
//   orderStore.items
//     .filter(
//       (x) =>
//         // x.stolyarComplete === 1 &&
//         // x.malyarComplete === 1 &&
//         // x.shlifComplete === 1 &&
//         x.goComplete === 1 && x.status === 1
//     )
//     .map((x) => {
//       const taskMontaj = taskStore.items.filter(
//         (y) => y.orderId === x.id && y.name.toLowerCase().indexOf("монтаж") > -1
//       );
//       return {
//         ...x,
//         taskMontaj,
//       };
//     })
// );

// const orderGroups = computed((x) => {
//   const _groups = groupBy(ordersForMontaj.value, "objectId");
//   console.log(_groups);
//   return _groups;
// });

// const objects = computed(() => {
//   const _allObjects = ordersForMontaj.value.map((x) => x.object);

//   const _result: IObject[] = [];

//   for (const _object of _allObjects) {
//     if (_object?.id && !_result.map((x) => x.id).includes(_object.id)) {
//       _result.push(_object);
//     }
//   }

//   return _result;
// });

// const defaultDataTaskWorker: ITaskWorkerInput = {};

// const dataFormTaskWorker = ref(defaultDataTaskWorker);

// const openTaskWorker = ref<boolean>(false);

// const showModalTaskWorker = () => {
//   openTaskWorker.value = true;
// };
// const onAddNewItemTaskWorker = (
//   {
//     dayString,
//     day,
//   }: {
//     dayString: string;
//     day: string;
//   },
//   montaj: ITask
// ) => {
//   dataFormTaskWorker.value = {
//     ...defaultDataTaskWorker,
//     taskId: montaj.id,
//     from: day,
//     objectId: montaj.objectId,
//     to: dayjs(day).add(100, "day").utc().format(),
//   };
//   showModalTaskWorker();
// };

const week = ref<Dayjs>(dayjs(new Date()));

// const newTaskMontajWorkers = computed(() => {
//   // console.log(
//   //   'week.value.startOf("week")=',
//   //   week.value.startOf("week"),
//   //   week.value,
//   //   dayjs("2025-01-01T21:00:00Z").diff(week.value.startOf("week"), "day")
//   // );
//   const firstDay = dayjs(week.value).startOf("week").startOf("day");
//   const _taskMontajWorkers: {
//     // objectId
//     [key: string]: {
//       // workerId
//       [key: string]: {
//         item: ITaskWorker;
//         stat: { startCol: number; length: number };
//       };
//     };
//   } = {};

//   for (let i = 0; i < props.weekDays.length; i++) {
//     const diff = props.weekDays.length - i;
//     const d = props.weekDays[i];
//     const _allTaskWorkers = taskWorkerStore.items
//       .filter(
//         (x) =>
//           // dayjs(x.from).diff(d.day, "day") <= 0 &&
//           // dayjs(x.to).diff(d.day, "day") <= 0
//           // dayjs(x.order.dateOtgruzka).year() != 1 &&
//           operationMontaj.value.map((xx) => xx.id).includes(x.operationId) &&
//           !["finish", "autofinish"].includes(x.status) &&
//           dayjs(d.day).isBetween(dayjs(x.from), dayjs(x.to), "day", "[]")
//       )
//       .map((y) => {
//         // console.group("isBetween: ", y.from, y.to);
//         // console.log(d.day, dayjs(d.day).isBetween(y.from, y.to, "day", "[]"));
//         // console.groupEnd();

//         const user = userStore.items.find((u) => u.id === y.workerId);
//         const taskStatus = taskStatusStore.items.find(
//           (x) => x.id === y?.statusId
//         );
//         return {
//           ...y,
//           user,
//           taskStatus,
//         };
//       });

//     // console.log(_allTaskWorkers);

//     for (const taskW of _allTaskWorkers) {
//       if (
//         (!_taskMontajWorkers[taskW.objectId] ||
//           !_taskMontajWorkers[taskW.objectId][taskW.workerId]) &&
//         !["finish", "autofinish"].includes(taskW.status)
//       ) {
//         const diffFrom = dayjs(taskW.from).diff(dayjs(firstDay), "day");
//         const diffTo = dayjs(dayjs(taskW.to)).diff(dayjs(firstDay), "day");
//         _taskMontajWorkers[taskW.objectId] = Object.assign(
//           _taskMontajWorkers[taskW.objectId] || {},
//           {
//             [taskW.workerId]: {
//               item: taskW,
//               stat: {
//                 startCol: diffFrom > 0 ? diffFrom : 0,
//                 length: diffTo - (diffFrom > 0 ? diffFrom : 0) + 1,
//                 diffFrom,
//                 diffTo,
//               },
//             },
//           }
//         );
//       }
//     }
//   }

//   // for (const objectKey in _taskMontajWorkers) {
//   //   for (const taskKey in _taskMontajWorkers[objectKey]) {
//   //     if (
//   //       !_taskMontajWorkers[objectKey] ||
//   //       !_taskMontajWorkers[taskW.objectId][taskW.id]
//   //     ) {
//   //       const diffFrom = dayjs(taskW.from).diff(dayjs(firstDay), "day");
//   //       const diffTo = dayjs(dayjs(taskW.to)).diff(dayjs(firstDay), "day");
//   //       _taskMontajWorkers[taskW.objectId] = Object.assign(
//   //         _taskMontajWorkers[taskW.objectId] || {},
//   //         {
//   //           [taskW.id]: {
//   //             item: taskW,
//   //             stat: {
//   //               startCol: diffFrom > 0 ? diffFrom : 0,
//   //               length: diffTo - (diffFrom > 0 ? diffFrom : 0) + 1,
//   //               diffFrom,
//   //               diffTo,
//   //             },
//   //           },
//   //         }
//   //       );
//   //     }
//   //   }
//   // }

//   // console.log(_taskMontajWorkers);

//   return _taskMontajWorkers;
//   // Object.entries(_taskMontajWorkers).map(([key, el]) => {
//   //   const diff = dayjs(el.from).startOf("day").diff(dayjs(firstDay), "day");
//   //   return {
//   //     id: key,
//   //     objectId: el.objectId,
//   //     from: el.from,
//   //     to: el.to,
//   //     name: el.user.name,
//   //     diff,
//   //     length: dayjs(dayjs(firstDay)).endOf("day").diff(el.to, "day"),
//   //   };
//   // }); //groupBy(_taskMontajWorkers, "from");
// });

// console.log(newTaskMontajWorkers);

const newTaskMontajWorkersEveryDay = computed(() => {
  // console.log(
  //   'week.value.startOf("week")=',
  //   week.value.startOf("week"),
  //   week.value,
  //   dayjs("2025-01-01T21:00:00Z").diff(week.value.startOf("week"), "day")
  // );
  const firstDay = dayjs(week.value).startOf("week").startOf("day");
  const _taskMontajWorkers: {
    // key = day
    [key: string]: {
      // key = objectId
      [key: string]: {
        // key = workerId
        [key: string]: any[];
      };
    };
  } = {};

  for (let i = 0; i < props.weekDays.length; i++) {
    const diff = props.weekDays.length - i;
    const d = props.weekDays[i];
    const _allTaskWorkers = taskWorkerStore.items
      .filter(
        (x) =>
          // dayjs(x.from).diff(d.day, "day") <= 0 &&
          // dayjs(x.to).diff(d.day, "day") <= 0
          // dayjs(x.order.dateOtgruzka).year() != 1 &&
          operationMontaj.value.map((xx) => xx.id).includes(x.operationId) &&
          dayjs(d.day).isBetween(dayjs(x.from), dayjs(x.to), "day", "[]")
      )
      .map((y) => {
        // console.group("isBetween: ", y.from, y.to);
        // console.log(d.day, dayjs(d.day).isBetween(y.from, y.to, "day", "[]"));
        // console.groupEnd();

        const user = userStore.items.find((u) => u.id === y.workerId);
        const taskStatus = taskStatusStore.items.find(
          (x) => x.id === y?.statusId
        );
        const object = objectStore.items.find((x) => x.id == y.objectId);
        return {
          ...y,
          object,
          user,
          taskStatus,
        };
      });

    // console.log(_allTaskWorkers);
    if (!_taskMontajWorkers[d.day]) {
      _taskMontajWorkers[d.day] = {};
    }

    for (const taskW of _allTaskWorkers) {
      if (!["finish", "autofinish"].includes(taskW.status)) {
        if (!_taskMontajWorkers[d.day][taskW.objectId]) {
          _taskMontajWorkers[d.day][taskW.objectId] = {};
        }

        if (!_taskMontajWorkers[d.day][taskW.objectId][taskW.workerId]) {
          _taskMontajWorkers[d.day][taskW.objectId][taskW.workerId] = [];
        }

        _taskMontajWorkers[d.day][taskW.objectId][taskW.workerId].push(taskW);
      }
    }
  }

  return _taskMontajWorkers;
});
// console.log(newTaskMontajWorkersEveryDay);

const tblRef = ref<HTMLElement>();
const sizeColumn = ref<number[]>([]);
const onSetSizeColumn = () => {
  if (tblRef.value) {
    const rows = tblRef.value.getElementsByClassName("rowBody");
    // console.log("tblRef", tblRef.value, rows);
    sizeColumn.value = Array.from(rows).map((el: any) => {
      // el.offsetWidth
      const rect = el.getBoundingClientRect();

      return rect.width - 1;
    });
  }
};

const loading = ref(false);

const onQuery = async () => {
  loading.value = true;

  await orderStore.find({
    status: [1, 100],
    goComplete: 1,
    dateOtgruzka: "1",
    $limit: 0,
    $skip: 0,
  });

  await taskWorkerStore
    .find({
      date: week.value.startOf("week").utc().format(),
      operationId: operationMontaj.value.map((x) => x.id),
      status: ["process", "wait", "pause"],
      $limit: 0,
    })
    .finally(() => {
      loading.value = false;
    });
};

onMounted(async () => {
  await onQuery();
  // await orderStore.find({
  //   // stolyarComplete: 1,
  //   // shlifComplete: 1,
  //   // malyarComplete: 1,
  //   goComplete: 1,
  //   status: [1],
  // });
  // taskStore.find({ $limit: 100 });

  // setTimeout(() => {
  // }, 100);
  onSetSizeColumn();

  window.addEventListener("resize", onSetSizeColumn);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", onSetSizeColumn);
});

const openRow = ref<number>(-1);
const OnToggleRow = (indexRow: number) => {
  openRow.value = indexRow == openRow.value ? -1 : indexRow;
};
</script>
<template>
  <table
    ref="tblRef"
    class="w-full table-auto border-separate border-spacing-[0px] rounded-lg bg-white dark:bg-g-900"
  >
    <thead>
      <tr>
        <th></th>
        <th colspan="7" class="border-b border-s-200 dark:border-g-700">
          <p class="py-2 font-normal text-g-500">Дата</p>
        </th>
      </tr>
      <tr>
        <th
          class="overflow-hidden text-left text-nowrap rounded-tl-lg sticky left-0 bg-white dark:bg-g-900 font-medium flex-none px-4 text-normal border-r border-b border-s-200 dark:border-g-700"
        >
          <p class="font-normal text-g-500">Объект</p>
        </th>
        <!-- <td class="px-4 text-normal border border-s-200 dark:border-g-700">
              Изделия
            </td> -->
        <!-- <td class="px-4 text-normal border border-s-200 dark:border-g-700">
              Исполнитель
            </td> -->
        <th
          v-for="(day, index) in weekDays"
          :key="day.day"
          class="rowBody px-4 py-2 font-medium text-base border-r border-b border-s-200 dark:border-g-700"
          :class="[
            dayjs().isSame(day.day, 'day')
              ? 'bg-green-500/10 dark:bg-white/10'
              : [0, 6].includes(dayjs(day.day).day())
              ? 'bg-orange-500/15 dark:bg-orange-500/10'
              : 'bg-white dark:bg-g-900',
            // index == 6 ? 'rounded-tr-lg' : '',
          ]"
        >
          <div>
            {{
              day.dayString
                .split(",")
                .slice(0, day.dayString.split(" ").length - 3)
                .join(" ")
            }}
          </div>
          <p class="font-normal text-s-500 dark:text-p-400">
            {{
              day.dayString
                .split(",")
                .slice(1, day.dayString.split(" ").length - 2)
                .join(" ")
            }}
            <a-tag
              :color="Colors.p[600]"
              v-if="dayjs().isSame(day.day, 'day')"
              class="text-sm"
            >
              {{ "Сегодня" }}
            </a-tag>
          </p>
          <!-- <RouterLink
                :to="{
                  name: 'montajListDay',
                  params: {
                    day: day.day,
                  },
                }"
              >
                {{ $t("button.edit") }}
              </RouterLink> -->
        </th>
      </tr>
    </thead>

    <tbody>
      <!-- class="flex flex-col items-justify overflow-hidden" -->
      <template
        v-for="(objectMontaj, indexRow) in objectsForMontaj"
        :key="objectMontaj?.id"
      >
        <tr
          class="group"
          :class="[
            indexRow % 2 == 0
              ? 'bg-s-100 dark:bg-g-800 hover:bg-green-100 dark:hover:bg-g-500'
              : 'hover:bg-green-100 dark:hover:bg-g-500',
          ]"
        >
          <td
            class="sticky left-0 p-4 border-r border-b border-s-200 dark:border-g-700"
            :class="[
              indexRow == openRow
                ? 'border-l-4 border-l-p-500 dark:border-l-p-700'
                : '',
              indexRow % 2 == 0
                ? 'bg-s-100 dark:bg-g-800 group-hover:bg-green-100 dark:group-hover:bg-g-500'
                : 'bg-white dark:bg-g-900 group-hover:bg-green-100 dark:group-hover:bg-g-500',
            ]"
          >
            <RouterLink
              v-if="objectMontaj"
              :to="{
                name: 'objectOrderId',
                params: {
                  objectId: objectMontaj.id,
                },
              }"
              class="flex items-center gap-2 text-s-600 dark:text-g-200 underline underline-offset-4 hover:no-underline"
            >
              <!-- {{ record?.object?.name }} -->
              <OrderObject :object-id="objectMontaj.id" />
              <VIcon :path="iChevronRight" class="text-g-300 dark:text-g-500" />
            </RouterLink>
            <MontajObjectOrders
              v-if="objectMontaj?.id"
              :object-id="objectMontaj.id"
              @onAddNewTaskWorker="emit('onAddNewTaskWorker', $event)"
            >
              <!-- <template #addButton>
              <div class="hidden group-hover:block absolute bottom-3 right-3">
                <a-tooltip
                  placement="left"
                  @click="
                    emit('onAddNewTaskWorker', {
                      day: weekDays[0],
                      objectMontaj,
                    })
                  "
                >
                  <template #title> {{ $t("form.taskWorker.add") }} </template>
                  <a-button size="small"> + </a-button>
                </a-tooltip>
              </div>
            </template> -->
            </MontajObjectOrders>

            <div class="absolute right-3 bottom-3">
              <a-button size="small" type="text" @click="OnToggleRow(indexRow)">
                <VIcon
                  class="text-s-300 dark:text-g-500"
                  :path="iChevronDown"
                />
              </a-button>
            </div>
          </td>
          <!-- <th class="py-4 border border-s-200 dark:border-g-700"></th> -->
          <!-- <th class="w-64 py-4 border border-s-200 dark:border-g-700">
              <span class="text-base font-normal leading-4">
                Исполнитель 1
              </span>
            </th> -->
          <!-- <div
            v-if="false && objectMontaj?.id"
            v-for="(day, indexDay) in weekDays"
            :key="day.dayString"
            class="border-l border-b border-s-200 dark:border-g-700 m-0 p-0 group tdDay"
            :style="{
              'min-height': newTaskMontajWorkers[objectMontaj.id]
                ? `${
                    Object.values(newTaskMontajWorkers[objectMontaj.id])
                      .length * 50
                  }px`
                : 'auto',
            }"
          >
            <div
              v-if="indexDay === 0"
              :key="`${taskMW.item.id}_${sizeColumn[0]}`"
              v-for="(taskMW, taskMontajId, indexM) in newTaskMontajWorkers[
                objectMontaj.id
              ]"
              class="text-left text-sm"
            >
              <MontajListItem
                v-if="sizeColumn.length"
                :index="indexM"
                :size-column="sizeColumn[0]"
                :task-m-w="taskMW"
                :object-id="objectMontaj.id"
                @on-edit-task-worker="onEditTaskWorker"
              />
            </div>
            <a-tooltip>
                  <template #title>
                    {{ $t("button.addTask") }}
                  </template>
                  <a-button
                    class="absolute bottom-0 invisible group-hover:visible flex items-center justify-center"
                    shape="circle"
                    type="dashed"
                    @click="onAddNewItemTaskWorker(day, objectMontaj)"
                  >
                    <VIcon :path="iPlusLg" />
                  </a-button>
                </a-tooltip>
          </div> -->

          <td
            v-if="objectMontaj?.id"
            v-for="(day, indexDay) in weekDays"
            :key="day.dayString"
            class="m-0 py-2 px-4 border-r border-b border-s-200 dark:border-g-700 group tdDay"
            :class="[
              dayjs().isSame(day.day, 'day')
                ? 'bg-green-500/10 dark:bg-white/10'
                : [0, 6].includes(dayjs(day.day).day())
                ? 'bg-orange-500/15 dark:bg-orange-500/10'
                : '',
            ]"
          >
            <div
              v-if="newTaskMontajWorkersEveryDay[day.day][objectMontaj.id]"
              v-for="(taskMW, indexM) in Object.values(
                newTaskMontajWorkersEveryDay[day.day][objectMontaj.id]
              )"
              :key="`${taskMW[0].id}_${sizeColumn[0]}`"
              class="text-left pb-1 text-g-900 dark:text-white"
            >
              <MontajListItemRelative
                :index="indexM"
                :day="day"
                :task-m-w="taskMW[0]"
                :object-id="objectMontaj.id"
                @on-edit-task-worker="emit('onEditTaskWorker', $event)"
              />
            </div>
          </td>
          <!-- <td
          v-if="objectMontaj?.id"
          v-for="(day, indexDay) in weekDays"
          :key="day.dayString"
          class="m-0 py-2 px-4 border-r border-b border-s-200 dark:border-g-700 group tdDay"
          :class="[
            dayjs().isSame(day.day, 'day')
              ? 'bg-green-500/10 dark:bg-white/10'
              : '',
          ]"
        >
          <div
            v-for="(taskMW, taskMontajId, indexM) in newTaskMontajWorkers[
              objectMontaj.id
            ]"
            :key="`${taskMW.item.id}_${sizeColumn[0]}`"
            class="text-left pb-1 text-g-900 dark:text-white"
          >
            <MontajListItemRelative
              v-if="
                indexDay >= taskMW.stat.startCol &&
                indexDay < taskMW.stat.length
              "
              :index="indexM"
              :day="day"
              :task-m-w="taskMW"
              :object-id="objectMontaj.id"
              @on-edit-task-worker="onEditTaskWorker"
            />
          </div>
        </td> -->
        </tr>
        <tr v-show="openRow == indexRow" class="">
          <td
            colspan="8"
            class="p-2 border-b border-s-200 dark:border-g-700 border-l-4 border-l-p-500 dark:border-l-p-700"
          >
            <MontajObjectOrdersInTable
              v-if="objectMontaj?.id"
              :object-id="objectMontaj.id"
              @onAddNewTaskWorker="emit('onAddNewTaskWorker', $event)"
            />
          </td>
        </tr>
      </template>
    </tbody>

    <tfoot>
      <tr class="h-12">
        <td
          colspan="8"
          class="border-b pt-8 border-s-200 dark:border-g-700 bg-s-200 dark:bg-g-951"
        >
          Вспомогательная информация
        </td>
      </tr>
      <tr class="group">
        <td
          class="sticky left-0 p-4 border-r border-b border-s-200 dark:border-g-700 bg-s-100 dark:bg-g-900"
        >
          {{ $t("info.freeMontajniks") }}
        </td>
        <td
          v-for="day in weekDays"
          :key="day.day"
          class="m-0 py-2 px-4 border-r border-b border-s-200 dark:border-g-700 bg-s-100 dark:bg-g-900"
          :class="[dayjs().isSame(day.day, 'day') ? '' : '']"
        >
          <MontajListNotWorkByDay
            v-if="newTaskMontajWorkersEveryDay"
            :day="day"
            :objectsWithWork="
              Object.values(newTaskMontajWorkersEveryDay[day.day])
            "
          />
        </td>
      </tr>
    </tfoot>
  </table>

  <RouterLink
    :to="`/order#goComplete`"
    class="flex items-center space-x-2 py-2 px-4 transition duration-200 hover:bg-s-300 dark:hover:bg-g-700 hover:text-black dark:hover:text-white group rounded-lg"
  >
    {{ $t("info.order_plural", ordersGoComplete.length) }}
    {{ $t("info.may_plural", ordersGoComplete.length) }}
    для отгрузки:
    <br />
    <!-- {{ $t("info.object_plural", idsObjectGoComplete.length) }}  -->
    <div v-for="item in ordersGoComplete">{{ item.name }},</div>
    <!-- {{ idsObjectGoComplete.map((x) => x.name).join(", ") }} -->
  </RouterLink>

  <!-- <div class="flex flex-row flex-nowrap">
    <div
      class="flex items-center justify-left font-medium flex-none w-64 max-w-64 px-4 text-normal border-l border-b border-s-200 dark:border-g-700"
    >
      Не назначен объект
    </div>
    <div
      v-for="day in weekDays"
      :key="day.day"
      class="m-0 py-2 px-4 flex-auto basis-0 min-w-48 min-h-40 relative border-l border-b border-s-200 dark:border-g-700 group tdDay"
      :class="[
        dayjs().isSame(day.day, 'day')
          ? ' border-l-2 border-r-2 bg-green-100 dark:bg-g-950/30'
          : 'bg-s-200 dark:bg-g-950',
      ]"
    >
      <MontajListNotWorkByDay
        v-if="newTaskMontajWorkersEveryDay"
        :day="day"
        :ids-worker-with-work="
          Object.keys(newTaskMontajWorkersEveryDay[day.day])
        "
      />
    </div>
  </div> -->
  <!-- <div>
        {{ JSON.stringify(taskMontajWorkers, null, 2) }}
        <h4>Изделия готовые к монтажу</h4>
        <div v-for="item in ordersForMontaj">
          <a-button type="primary">
            Начать монтаж {{ item.name }}-{{ item.object?.name }}
          </a-button>
        </div>
      </div> -->
</template>
