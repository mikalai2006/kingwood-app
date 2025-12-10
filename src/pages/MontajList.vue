<script setup lang="ts" async>
import { useUserStore } from "@/store/modules/user";
import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import dayjs from "@/utils/dayjs";
import {
  useObjectStore,
  useOperationStore,
  useOrderStore,
  usePostStore,
  useTaskStatusStore,
  useTaskStore,
  useTaskWorkerStore,
} from "@/store";
import { useI18n } from "vue-i18n";
import VIcon from "@/components/UI/VIcon.vue";
import { iPlusLg, iSearch } from "@/utils/icons";
import { Dayjs } from "dayjs";
import { ITask, ITaskInput } from "@/api/task/types";
import MontajObjectOrders from "@/components/Montaj/MontajObjectOrders.vue";
import { ITaskWorker, ITaskWorkerInput } from "@/api/task_worker/types";
import { groupBy } from "lodash-es";
import VFormTaskWorker from "@/components/Form/VFormTaskWorker.vue";
import { IObject } from "@/api/object/types";
import MontajListItem from "@/components/Montaj/MontajListItem.vue";
import VFormTask from "@/components/Form/VFormTask.vue";
import MontajListObject from "@/components/Montaj/MontajListObject.vue";
import MontajGroupByObject from "@/components/Montaj/MontajGroupByObject.vue";
import { IWeekDay } from "@/api/types";
import { message } from "ant-design-vue";
import { IOrder } from "@/api/order/types";

dayjs.locale("ru");
const userStore = useUserStore();
const postStore = usePostStore();
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

const idsPostMontaj = computed(() =>
  postStore.items
    .filter((x) => x.name.toLowerCase().indexOf("монтаж") > -1)
    .map((x) => x.id)
);

const montajniks = computed(() => {
  return userStore.items.filter((x) => idsPostMontaj.value.includes(x.postId));
});

const idsInstallOperation = computed(() =>
  operationStore.items.filter((x) => x.group === "5").map((x) => x.id)
);

const taskWorkersForMontaj = computed(() => {
  return taskWorkerStore.items.filter((x) =>
    idsInstallOperation.value.includes(x.operationId)
  );
});

const taskWorkerMontajGroup = computed(() =>
  groupBy(taskWorkersForMontaj.value, "objectId")
);

const idsObjectMontaj = computed(() => {
  const _ids = taskWorkersForMontaj.value.map((x) => x.objectId);
  return [...new Set([..._ids])];
});

const objectsForMontaj = computed(() => {
  const _montajObjectIds = idsObjectMontaj.value.map((x) => {
    return objectStore.items.find((y) => y.id == x);
  });
  return _montajObjectIds;
});

const ordersForMontaj = computed(() =>
  orderStore.items
    .filter(
      (x) =>
        // x.stolyarComplete === 1 &&
        // x.malyarComplete === 1 &&
        // x.shlifComplete === 1 &&
        x.goComplete === 1 && x.status === 1
    )
    .map((x) => {
      const taskMontaj = taskStore.items.filter(
        (y) => y.orderId === x.id && y.name.toLowerCase().indexOf("монтаж") > -1
      );
      return {
        ...x,
        taskMontaj,
      };
    })
);

const orderGroups = computed((x) => {
  const _groups = groupBy(ordersForMontaj.value, "objectId");
  console.log(_groups);
  return _groups;
});

const objects = computed(() => {
  const _allObjects = ordersForMontaj.value.map((x) => x.object);

  const _result: IObject[] = [];

  for (const _object of _allObjects) {
    if (_object?.id && !_result.map((x) => x.id).includes(_object.id)) {
      _result.push(_object);
    }
  }

  return _result;
});

const defaultDataTaskWorker: ITaskWorkerInput = {};

const dataFormTaskWorker = ref(defaultDataTaskWorker);

const openTaskWorker = ref<boolean>(false);

const showModalTaskWorker = () => {
  openTaskWorker.value = true;
};
const onAddNewItemTaskWorker = (_orders: IOrder[]) => {
  console.log("onAddNewItemTaskWorker", _orders);

  // {
  //     dayString,
  //     day,
  //   }: {
  //     dayString: string;
  //     day: string;
  //   },
  //   montaj: ITask
  const montajOperation = operationStore.items.find(
    (x) => x.name.toLowerCase() == "монтаж изделия"
  );

  if (montajOperation == null) {
    message.error("Не найдена операция монтажа!");
    return;
  }

  let notFoundTask = 0;
  for (let index = 0; index < _orders.length; index++) {
    const _order = _orders[index];
    const task = taskStore.items.find(
      (x) =>
        x.objectId == _order.objectId &&
        x.orderId == _order.id &&
        x.operationId == montajOperation.id
    );
    if (!task) {
      notFoundTask++;
    }
  }

  if (notFoundTask > 0) {
    message.error("Не найдено задания монтажа!");
    return;
  }

  // dataFormTaskWorker.value = {
  //   ...defaultDataTaskWorker,
  //   taskId: task.id,
  //   from: daysOfSelectWeek.value[0].day,
  //   objectId: taskWorker.objectId,
  //   typeGo: "range",
  //   operationId: montajOperation.id,
  //   to: dayjs(daysOfSelectWeek.value[0].day).add(365, "day").utc().format(),
  // };
  showModalTaskWorker();
};

const onEditTaskWorker = (data: ITaskWorker, objectId: string) => {
  dataFormTaskWorker.value = {
    ...defaultDataTaskWorker,
    ...data,
    objectId,
    // from: dayjs(data.from).format(dateFormat),
    // to: dayjs(data.to).format(dateFormat),
  };
  // console.log("edit TaskWorker: ", dataFormTaskWorker.value);

  showModalTaskWorker();
};

const week = ref<Dayjs>(dayjs(new Date()));

const customDateFormat = "DD MMM, dddd, YYYY";
const dateFormat = "DD MMMM YYYY";
const weekFormat = "DD MMM YYYY";

const daysOfSelectWeek = ref<IWeekDay[]>([]);

// const daysWeekInterpolate = [1,2,3,4,5,6,0]
const onCreateWeekDays = (startDay: Dayjs) => {
  // console.log(
  //   "startDay: ",
  //   startDay,
  //   startDay.utc(true).format()
  // );
  daysOfSelectWeek.value = Array(7)
    .fill(startDay)
    .map((el: Dayjs, idx) => {
      const newD = dayjs(el).add(idx, "day");
      // console.log("idx=", idx, newD.day());
      return {
        dayString: newD.format(customDateFormat),
        day: newD.utc(true).format(),
      };
    });
};

const onChangeWeek = (date: Dayjs, dateString: string) => {
  // console.log("onChangeWeek: ", date);

  const startDay = date.startOf("week"); //.format(weekFormat);

  onCreateWeekDays(startDay);

  onQuery();
  // const result = [];

  // for (let i = 0; i< 7; i++) {

  // }
};

const customWeekStartEndFormat = (value: Dayjs) => {
  return `${dayjs(value).startOf("week").format(weekFormat)} ~ ${dayjs(value)
    .endOf("week")
    .format(weekFormat)}`;
};

// const taskMontajWorkers = computed(() => {
//   // console.log(
//   //   'week.value.startOf("week")=',
//   //   week.value.startOf("week"),
//   //   week.value,
//   //   dayjs("2025-01-01T21:00:00Z").diff(week.value.startOf("week"), "day")
//   // );
//   const _taskMontajWorkers = {
//     list: {},
//     stat: {},
//   };
//   for (let i = 0; i < daysOfSelectWeek.value.length; i++) {
//     const diff = daysOfSelectWeek.value.length - i;
//     const d = daysOfSelectWeek.value[i];
//     const _allTaskWorkers = taskMontajWorkerStore.items
//       .filter((x) =>
//         // dayjs(x.from).diff(d.day, "day") <= 0 &&
//         // dayjs(x.to).diff(d.day, "day") <= 0
//         dayjs(d.day).isBetween(dayjs(x.from), dayjs(x.to), "day", "[]")
//       )
//       .map((y) => {
//         // console.group("isBetween: ", y.from, y.to);
//         // console.log(d.day, dayjs(d.day).isBetween(y.from, y.to, "day", "[]"));
//         // console.groupEnd();

//         const user = userStore.items.find((u) => u.id === y.workerId);
//         return {
//           ...y,
//           user,
//         };
//       });
//     _taskMontajWorkers.list[d.day] = groupBy(_allTaskWorkers, "taskId");
//   }
//   return _taskMontajWorkers; //groupBy(_taskMontajWorkers, "from");
// });

// const mapTasksByDates = computed(() => {
//   // console.log(
//   //   'week.value.startOf("week")=',
//   //   week.value.startOf("week"),
//   //   week.value,
//   //   dayjs("2025-01-01T21:00:00Z").diff(week.value.startOf("week"), "day")
//   // );
//   const firstDay = dayjs(week.value).startOf("week").startOf("day");
//   const dateWithTaskWorker: {
//     [key: string]: ITaskWorker[];
//   } = {};

//   for (let i = 0; i < daysOfSelectWeek.value.length; i++) {
//     const diff = daysOfSelectWeek.value.length - i;
//     const d = daysOfSelectWeek.value[i];
//     const _allTaskWorkers = taskWorkerStore.items
//       .filter(
//         (x) =>
//           // dayjs(x.from).diff(d.day, "day") <= 0 &&
//           // dayjs(x.to).diff(d.day, "day") <= 0
//           // dayjs(x.order.dateOtgruzka).year() != 1 &&
//           operationMontaj.value.map((xx) => xx.id).includes(x.operationId) &&
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

//     // dateWithTaskWorker[d.day] = _allTaskWorkers.map((x) => {
//     //   return {
//     //     name: x.worker.name,
//     //     from: x.from,
//     //     to: x.to,
//     //   };
//     // });

//     // for (const taskW of _allTaskWorkers) {
//     //   if (
//     //     (!_taskMontajWorkers[taskW.objectId] ||
//     //       !_taskMontajWorkers[taskW.objectId][taskW.workerId]) &&
//     //     !["finish", "autofinish"].includes(taskW.status)
//     //   ) {
//     //     const diffFrom = dayjs(taskW.from).diff(dayjs(firstDay), "day");
//     //     const diffTo = dayjs(dayjs(taskW.to)).diff(dayjs(firstDay), "day");
//     //     _taskMontajWorkers[taskW.objectId] = Object.assign(
//     //       _taskMontajWorkers[taskW.objectId] || {},
//     //       {
//     //         [taskW.workerId]: {
//     //           item: taskW,
//     //           stat: {
//     //             startCol: diffFrom > 0 ? diffFrom : 0,
//     //             length: diffTo - (diffFrom > 0 ? diffFrom : 0) + 1,
//     //             diffFrom,
//     //             diffTo,
//     //           },
//     //         },
//     //       }
//     //     );
//     //   }
//     // }
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

//   // console.log(mapTasksByDates);

//   return dateWithTaskWorker;
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
// // console.log("mapTasksByDates: ", mapTasksByDates.value);

const newTaskMontajWorkers = computed(() => {
  // console.log(
  //   'week.value.startOf("week")=',
  //   week.value.startOf("week"),
  //   week.value,
  //   dayjs("2025-01-01T21:00:00Z").diff(week.value.startOf("week"), "day")
  // );
  const firstDay = dayjs(week.value).startOf("week").startOf("day");
  const _taskMontajWorkers: {
    [key: string]: {
      [key: string]: {
        item: IObject;
        stat: { startCol: number; length: number };
      };
    };
  } = {};

  for (let i = 0; i < daysOfSelectWeek.value.length; i++) {
    const diff = daysOfSelectWeek.value.length - i;
    const d = daysOfSelectWeek.value[i];
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

    for (const taskW of _allTaskWorkers) {
      if (
        (!_taskMontajWorkers[taskW.workerId] ||
          !_taskMontajWorkers[taskW.workerId][taskW.objectId]) &&
        !["finish", "autofinish"].includes(taskW.status)
      ) {
        const diffFrom = dayjs(taskW.from).diff(dayjs(firstDay), "day");
        const diffTo = dayjs(dayjs(taskW.to)).diff(dayjs(firstDay), "day");
        _taskMontajWorkers[taskW.workerId] = Object.assign(
          _taskMontajWorkers[taskW.workerId] || {},
          {
            [taskW.objectId]: {
              item: taskW.object,
              stat: {
                startCol: diffFrom > 0 ? diffFrom : 0,
                length: diffTo - (diffFrom > 0 ? diffFrom : 0) + 1,
                diffFrom,
                diffTo,
              },
            },
          }
        );
      }
    }
  }

  // for (const objectKey in _taskMontajWorkers) {
  //   for (const taskKey in _taskMontajWorkers[objectKey]) {
  //     if (
  //       !_taskMontajWorkers[objectKey] ||
  //       !_taskMontajWorkers[taskW.objectId][taskW.id]
  //     ) {
  //       const diffFrom = dayjs(taskW.from).diff(dayjs(firstDay), "day");
  //       const diffTo = dayjs(dayjs(taskW.to)).diff(dayjs(firstDay), "day");
  //       _taskMontajWorkers[taskW.objectId] = Object.assign(
  //         _taskMontajWorkers[taskW.objectId] || {},
  //         {
  //           [taskW.id]: {
  //             item: taskW,
  //             stat: {
  //               startCol: diffFrom > 0 ? diffFrom : 0,
  //               length: diffTo - (diffFrom > 0 ? diffFrom : 0) + 1,
  //               diffFrom,
  //               diffTo,
  //             },
  //           },
  //         }
  //       );
  //     }
  //   }
  // }

  // console.log(_taskMontajWorkers);

  return _taskMontajWorkers;
  // Object.entries(_taskMontajWorkers).map(([key, el]) => {
  //   const diff = dayjs(el.from).startOf("day").diff(dayjs(firstDay), "day");
  //   return {
  //     id: key,
  //     objectId: el.objectId,
  //     from: el.from,
  //     to: el.to,
  //     name: el.user.name,
  //     diff,
  //     length: dayjs(dayjs(firstDay)).endOf("day").diff(el.to, "day"),
  //   };
  // }); //groupBy(_taskMontajWorkers, "from");
});

const newTaskMontajWorkersEveryDay = computed(() => {
  // console.log(
  //   'week.value.startOf("week")=',
  //   week.value.startOf("week"),
  //   week.value,
  //   dayjs("2025-01-01T21:00:00Z").diff(week.value.startOf("week"), "day")
  // );
  const firstDay = dayjs(week.value).startOf("week").startOf("day");
  const _taskMontajWorkers: {
    [key: string]: {
      // key = workerId
      [key: string]: {
        // key = day
        [key: string]: // key = objectId
        ITaskWorker[];
      };
    };
  } = {};

  for (let i = 0; i < daysOfSelectWeek.value.length; i++) {
    const diff = daysOfSelectWeek.value.length - i;
    const d = daysOfSelectWeek.value[i];
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

    for (const taskW of _allTaskWorkers) {
      if (!["finish", "autofinish"].includes(taskW.status)) {
        if (!_taskMontajWorkers[taskW.workerId]) {
          _taskMontajWorkers[taskW.workerId] = {};
        }

        if (!_taskMontajWorkers[taskW.workerId][d.day]) {
          _taskMontajWorkers[taskW.workerId][d.day] = {};
        }

        if (!_taskMontajWorkers[taskW.workerId][d.day][taskW.objectId]) {
          _taskMontajWorkers[taskW.workerId][d.day][taskW.objectId] = [];
        }

        _taskMontajWorkers[taskW.workerId][d.day][taskW.objectId].push(taskW);
      }
    }
  }

  // for (const objectKey in _taskMontajWorkers) {
  //   for (const taskKey in _taskMontajWorkers[objectKey]) {
  //     if (
  //       !_taskMontajWorkers[objectKey] ||
  //       !_taskMontajWorkers[taskW.objectId][taskW.id]
  //     ) {
  //       const diffFrom = dayjs(taskW.from).diff(dayjs(firstDay), "day");
  //       const diffTo = dayjs(dayjs(taskW.to)).diff(dayjs(firstDay), "day");
  //       _taskMontajWorkers[taskW.objectId] = Object.assign(
  //         _taskMontajWorkers[taskW.objectId] || {},
  //         {
  //           [taskW.id]: {
  //             item: taskW,
  //             stat: {
  //               startCol: diffFrom > 0 ? diffFrom : 0,
  //               length: diffTo - (diffFrom > 0 ? diffFrom : 0) + 1,
  //               diffFrom,
  //               diffTo,
  //             },
  //           },
  //         }
  //       );
  //     }
  //   }
  // }

  console.log(_taskMontajWorkers);

  return _taskMontajWorkers;
  // Object.entries(_taskMontajWorkers).map(([key, el]) => {
  //   const diff = dayjs(el.from).startOf("day").diff(dayjs(firstDay), "day");
  //   return {
  //     id: key,
  //     objectId: el.objectId,
  //     from: el.from,
  //     to: el.to,
  //     name: el.user.name,
  //     diff,
  //     length: dayjs(dayjs(firstDay)).endOf("day").diff(el.to, "day"),
  //   };
  // }); //groupBy(_taskMontajWorkers, "from");
});

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
    // console.log("sizeColumn.value", sizeColumn.value);
  }
};

const loading = ref(false);

const onQuery = async () => {
  loading.value = true;
  await taskWorkerStore
    .find({
      date: week.value.startOf("week").utc().format(),
      operationId: operationMontaj.value.map((x) => x.id),
      status: ["process", "wait", "pause"],
      $limit: 100,
    })
    .finally(() => {
      loading.value = false;
    });
};

onMounted(async () => {
  onCreateWeekDays(week.value.startOf("week"));

  //   await onQuery();
  //   // await orderStore.find({
  //   //   // stolyarComplete: 1,
  //   //   // shlifComplete: 1,
  //   //   // malyarComplete: 1,
  //   //   goComplete: 1,
  //   //   status: [1],
  //   // });
  //   // taskStore.find({ $limit: 100 });

  //   // setTimeout(() => {
  //   // }, 100);
  //   onSetSizeColumn();

  //   window.addEventListener("resize", onSetSizeColumn);
});

// onBeforeUnmount(() => {
//   window.removeEventListener("resize", onSetSizeColumn);
// });
</script>
<template>
  <div class="flex-auto flex flex-col w-full">
    <VHeader :title="$t('page.montajList.title')">
      <template #back>&nbsp;</template>
    </VHeader>
    <div class="flex-auto">
      <div class="flex-auto">
        <!-- <a-button type="primary" @click="onAddNewItem">
          {{ $t("form.add") }}
        </a-button> -->
      </div>
      <div class="px-4 pt-4">
        <div class="flex flex-row items-center">
          <a-date-picker
            v-model:value="week"
            :allowClear="false"
            picker="week"
            :format="customWeekStartEndFormat"
            @change="onChangeWeek"
          />
          <!-- {{ week }}
          <br /> -->
          <!-- <pre>
            {{ JSON.stringify(daysOfSelectWeek, null, 2) }}
          </pre> -->
          <!-- <pre>
            {{ JSON.stringify(orderGroups, null, 2) }}
          </pre> -->
          <!-- <pre>
            {{ Object.keys(taskWorkerMontajGroup).length }}
          </pre>
          <pre>
            object montaj:
            {{ objectsForMontaj.map((x) => x?.id) }}
          </pre> -->
        </div>
      </div>
      <div class="mt-4 p-4">
        <!-- <pre>
          {{ mapTasksByDates }}
        </pre> -->
        <div
          v-if="false"
          ref="tblRef"
          class="rounded-lg bg-white dark:bg-g-900 border-t border-r border-s-200 dark:border-g-700 w-full overflow-x-auto"
        >
          <div class="flex flex-row flex-nowrap">
            <div
              class="flex-none w-64 p-4 text-normal border-l border-b border-s-200 dark:border-g-700"
            >
              ФИО
            </div>
            <!-- <td class="px-4 text-normal border border-s-200 dark:border-g-700">
              Изделия
            </td> -->
            <!-- <td class="px-4 text-normal border border-s-200 dark:border-g-700">
              Исполнитель
            </td> -->
            <div
              v-for="day in daysOfSelectWeek"
              :key="day.day"
              class="rowBody px-4 flex-auto basis-0 text-normal border-l border-b border-s-200 dark:border-g-700"
            >
              <div>
                {{
                  day.dayString
                    .split(",")
                    .slice(0, day.dayString.split(" ").length - 3)
                    .join(" ")
                }}
              </div>
              <p class="font-normal text-s-300 dark:text-g-400">
                {{
                  day.dayString
                    .split(",")
                    .slice(1, day.dayString.split(" ").length - 2)
                    .join(" ")
                }}
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
            </div>
          </div>
          <div class="flex flex-col items-justify overflow-hidden">
            <template v-for="montajnik in montajniks" :key="montajnik.id">
              <div class="flex flex-row flex-nowrap items-stretch">
                <div
                  class="w-64 p-4 border-l border-b border-s-200 dark:border-g-700"
                >
                  <span class="text-md leading-4">
                    {{ montajnik?.name }}
                    <!-- {{ montajnik?.id }} -->
                  </span>
                  <!-- <MontajObjectOrders
                    v-if="montajnik?.id"
                    :object-id="montajnik.id"
                  /> -->
                </div>
                <!-- <div
                  v-if="montajnik?.id"
                  v-for="(day, index) in daysOfSelectWeek"
                  :key="day.dayString"
                  class="flex-auto basis-0 relative border-l border-b border-s-200 dark:border-g-700 m-0 p-0 group tdDay"
                  :style="{
                    'min-height': newTaskMontajWorkers[montajnik.id]
                      ? `${
                          Object.values(newTaskMontajWorkers[montajnik.id])
                            .length * 50
                        }px`
                      : 'auto',
                  }"
                >
                  <div
                    v-if="index === 0"
                    :key="`${obj.item.id}_${sizeColumn[0]}`"
                    v-for="(obj, objId, indexM) in newTaskMontajWorkers[
                      montajnik.id
                    ]"
                    class="text-left text-sm text-nowrap"
                  >
                    <MontajListObject
                      v-if="sizeColumn.length"
                      :index="indexM"
                      :size-column="sizeColumn[0]"
                      :object="obj"
                      :worker-id="montajnik.id"
                      @on-edit-task-worker="onEditTaskWorker"
                    />
                  </div>
                </div> -->

                <div
                  v-if="montajnik?.id"
                  v-for="(day, index) in daysOfSelectWeek"
                  :key="day.dayString"
                  class="flex-auto basis-0 relative border-l border-b border-s-200 dark:border-g-700 m-0 p-2 group tdDay"
                >
                  <div
                    v-if="newTaskMontajWorkersEveryDay[montajnik.id]"
                    v-for="(obj, objId, indexM) in newTaskMontajWorkersEveryDay[
                      montajnik.id
                    ][day.day]"
                    :key="`${day}_${montajnik.id}_${objId}`"
                    class="text-left text-sm text-nowrap"
                  >
                    <MontajListObject
                      v-if="sizeColumn.length"
                      :index="indexM"
                      :object-id="objId"
                      :worker-id="montajnik.id"
                      @on-edit-task-worker="onEditTaskWorker"
                    />
                  </div>
                </div>
              </div>
            </template>
            <!-- <template
              v-for="objectMontaj in objectsForMontaj"
              :key="objectMontaj.id"
            >
              <div class="flex flex-row flex-nowrap items-stretch">
                <div
                  class="w-64 p-4 border-l border-b border-s-200 dark:border-g-700"
                >
                  <span class="text-base font-bold leading-4">
                    {{ objectMontaj?.name }}
                  </span>
                  <MontajObjectOrders
                    v-if="objectMontaj?.id"
                    :object-id="objectMontaj.id"
                  />
                </div>
                <div
                  v-if="objectMontaj?.id"
                  v-for="(day, index) in daysOfSelectWeek"
                  :key="day.dayString"
                  class="flex-auto basis-0 relative border-l border-b border-s-200 dark:border-g-700 m-0 p-0 group tdDay"
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
                    v-if="index === 0"
                    :key="`${taskMW.item.id}_${sizeColumn[0]}`"
                    v-for="(
                      taskMW, taskMontajId, indexM
                    ) in newTaskMontajWorkers[objectMontaj.id]"
                    class="text-left text-sm text-nowrap"
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
                </div>
              </div>
            </template> -->
          </div>
        </div>

        <div class="overflow-x-auto b-scroll">
          <MontajGroupByObject
            :week-days="daysOfSelectWeek"
            @on-edit-task-worker="onEditTaskWorker"
            @on-add-new-task-worker="onAddNewItemTaskWorker"
          />
        </div>
      </div>
      <!-- <div>
        {{ JSON.stringify(taskMontajWorkers, null, 2) }}
        <h4>Изделия готовые к монтажу</h4>
        <div v-for="item in ordersForMontaj">
          <a-button type="primary">
            Начать монтаж {{ item.name }}-{{ item.object?.name }}
          </a-button>
        </div>
      </div> -->
    </div>
  </div>

  <a-modal
    v-model:open="openTaskWorker"
    :key="`${dataFormTaskWorker?.id}_${dataFormTaskWorker.from}`"
    :title="
      dataFormTaskWorker.id
        ? $t('form.taskWorker.edit')
        : $t('form.taskWorker.new')
    "
    :ok-button-props="{ hidden: true }"
    :cancel-button-props="{ hidden: true }"
    @ok="
      () => {
        openTaskWorker = false;
      }
    "
  >
    <VFormTaskWorker
      :data="dataFormTaskWorker"
      :default-data="defaultDataTaskWorker"
      @callback="
        () => {
          openTaskWorker = false;
        }
      "
    />
  </a-modal>
</template>
