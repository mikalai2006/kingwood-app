<script setup lang="ts" async>
import { useUserStore } from "@/store/modules/user";
import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import dayjs from "@/utils/dayjs";
import {
  useObjectStore,
  useOperationStore,
  useOrderStore,
  useTaskMontajStore,
  useTaskMontajWorkerStore,
  useTaskStatusStore,
  useTaskStore,
  useTaskWorkerStore,
} from "@/store";
import { useI18n } from "vue-i18n";
import VIcon from "@/components/UI/VIcon.vue";
import { iPlusLg, iSearch } from "@/utils/icons";
import { Dayjs } from "dayjs";
import VFormTaskMontaj from "@/components/Form/VFormTaskMontaj.vue";
import { ITask, ITaskInput } from "@/api/task/types";
import MontajObjectOrders from "@/components/Montaj/MontajObjectOrders.vue";
import { ITaskWorker, ITaskWorkerInput } from "@/api/task_worker/types";
import VFormTaskMontajWorker from "@/components/Form/VFormTaskMontajWorker.vue";
import { getShortFIO, invertColor } from "@/utils/utils";
import { groupBy } from "lodash-es";
import VFormTaskWorker from "@/components/Form/VFormTaskWorker.vue";
import { IObject } from "@/api/object/types";

dayjs.locale("ru");
const userStore = useUserStore();
const orderStore = useOrderStore();
const taskStatusStore = useTaskStatusStore();
const objectStore = useObjectStore();
const taskStore = useTaskStore();
const operationStore = useOperationStore();
const taskWorkerStore = useTaskWorkerStore();

const { t } = useI18n();

orderStore.find({ stolyarComplete: 1, malyarComplete: 1, status: 1 });
// taskStore.find({ $limit: 100 });

const operationMontaj = computed(() =>
  operationStore.items.filter(
    (x) => x.name.toLowerCase().indexOf("монтаж") > -1
  )
);

const idsInstallOperation = computed(() =>
  operationStore.items.filter((x) => x.group === "install")
);

const ordersForMontaj = computed(() =>
  orderStore.items
    .filter((x) => x.stolyarComplete === 1 && x.malyarComplete === 1)
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

const defaultData: ITaskInput = {};

const dataForm = ref(defaultData);

const open = ref<boolean>(false);

const showModal = () => {
  open.value = true;
};
const onAddNewItem = () => {
  dataForm.value = defaultData;
  showModal();
};

const defaultDataTaskWorker: ITaskWorkerInput = {};

const dataFormTaskWorker = ref(defaultDataTaskWorker);

const openTaskWorker = ref<boolean>(false);

const showModalTaskWorker = () => {
  openTaskWorker.value = true;
};
const onAddNewItemTaskWorker = (
  {
    dayString,
    day,
  }: {
    dayString: string;
    day: string;
  },
  montaj: ITask
) => {
  dataFormTaskWorker.value = {
    ...defaultDataTaskWorker,
    taskId: montaj.id,
    from: day,
    objectId: montaj.objectId,
    to: dayjs(day).add(100, "day").utc().format(),
  };
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
  console.log("edit TaskWorker: ", dataFormTaskWorker.value);

  showModalTaskWorker();
};

const week = ref<Dayjs>(dayjs(new Date()));

const customDateFormat = "DD MMM, dddd, YYYY";
const dateFormat = "DD MMMM YYYY";
const weekFormat = "DD MMM YYYY";

const daysOfSelectWeek = ref<{ dayString: string; day: string }[]>([]);

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
        item: ITaskWorker;
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
          operationMontaj.value.map((x) => x.id).includes(x.operationId) &&
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
        return {
          ...y,
          user,
          taskStatus,
        };
      });

    // console.log(_allTaskWorkers);

    for (const taskW of _allTaskWorkers) {
      if (
        !_taskMontajWorkers[taskW.objectId] ||
        !_taskMontajWorkers[taskW.objectId][taskW.id]
      ) {
        const diffFrom = dayjs(taskW.from).diff(dayjs(firstDay), "day");
        const diffTo = dayjs(dayjs(taskW.to)).diff(dayjs(firstDay), "day");
        _taskMontajWorkers[taskW.objectId] = Object.assign(
          _taskMontajWorkers[taskW.objectId] || {},
          {
            [taskW.id]: {
              item: taskW,
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

onMounted(async () => {
  onCreateWeekDays(week.value.startOf("week"));

  await taskWorkerStore.find({
    date: week.value.startOf("week").utc().format(),
    operationId: operationMontaj.value.map((x) => x.id),
  });

  // setTimeout(() => {
  // }, 100);
  onSetSizeColumn();

  window.addEventListener("resize", onSetSizeColumn);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", onSetSizeColumn);
});
</script>
<template>
  <div class="h-full flex flex-row items-stretch">
    <div class="flex-auto p-4">
      <VTitle :text="$t('page.montajList.title')" />
      <div class="flex-auto">
        <a-button type="primary" @click="onAddNewItem">
          {{ $t("form.add") }}
        </a-button>
      </div>
      <div class="">
        <div class="flex flex-row items-center">
          <a-date-picker
            v-model:value="week"
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
        </div>
      </div>
      <div
        ref="tblRef"
        class="mt-4 border-t border-r border-s-200 dark:border-g-700 w-full overflow-x-auto"
      >
        <div class="flex flex-row flex-nowrap">
          <div
            class="flex-none w-64 px-4 text-normal border-l border-b border-s-200 dark:border-g-700"
          >
            Объект
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
            <p class="font-normal">
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
          <template v-for="objectMontaj in objects" :key="objectMontaj.id">
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
              <!-- <th class="py-4 border border-s-200 dark:border-g-700"></th> -->
              <!-- <th class="w-64 py-4 border border-s-200 dark:border-g-700">
              <span class="text-base font-normal leading-4">
                Исполнитель 1
              </span>
            </th> -->
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
                  v-for="(taskMW, taskMontajId, indexM) in newTaskMontajWorkers[
                    objectMontaj.id
                  ]"
                  class="text-left text-sm text-nowrap"
                >
                  <div
                    class="absolute z-50 rounded-sm"
                    :style="{
                      background: taskMW.item.taskStatus?.color,
                      color: invertColor(taskMW.item.taskStatus?.color, true),
                      left: `${taskMW.stat.startCol * sizeColumn[0] + 3}px`,
                      top: `${indexM * 35 + 3}px`,
                      width: `${taskMW.stat.length * sizeColumn[0] - 5}px`,
                    }"
                  >
                    <a-tooltip>
                      <template #title>
                        {{ $t("button.editTask") }}
                      </template>
                      <div
                        class="flex gap-1 p-1 w-32 cursor-pointer"
                        @click="onEditTaskWorker(taskMW.item, objectMontaj.id)"
                      >
                        <TaskMontajWorkerStatusTagDot
                          :task-worker-id="taskMW.item.id"
                        />
                        {{ getShortFIO(taskMW?.item?.user?.name) }}
                      </div>
                    </a-tooltip>
                  </div>
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
              </div>
            </div>
          </template>
        </div>
      </div>

      <div>
        <!-- {{ JSON.stringify(taskMontajWorkers, null, 2) }} -->
        <h4>Изделия готовые к монтажу</h4>
        <div v-for="item in ordersForMontaj">
          <a-button type="primary">
            Начать монтаж {{ item.name }}-{{ item.object?.name }}
          </a-button>
        </div>
      </div>
    </div>
  </div>

  <a-modal
    v-model:open="open"
    :key="dataForm?.id"
    :title="dataForm.id ? $t('form.montaj.edit') : $t('form.montaj.new')"
    :ok-button-props="{ hidden: true }"
    :cancel-button-props="{ hidden: true }"
    @ok="
      () => {
        open = false;
      }
    "
  >
    <VFormTaskMontaj
      :data="dataForm"
      :default-data="defaultData"
      @callback="
        () => {
          open = false;
        }
      "
    />
  </a-modal>

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
