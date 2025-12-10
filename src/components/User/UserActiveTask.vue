<script setup lang="ts">
import { computed, h, onMounted, ref } from "vue";

import dayjs from "@/utils/dayjs";
import {
  useObjectStore,
  useOrderStore,
  useTaskStatusStore,
  useTaskStore,
  useTaskWorkerStore,
  useUserStore,
  useWorkHistoryStore,
} from "@/store";
import VIcon from "../UI/VIcon.vue";
import {
  getObjectId,
  getShortFIO,
  invertColor,
  replaceSubstringByArray,
} from "@/utils/utils";
import { patch } from "@/api/task_worker";
import { message, Modal } from "ant-design-vue";
import { iWraningTriangle } from "@/utils/icons";
import { useI18n } from "vue-i18n";
import { useTimerStore } from "@/store/modules/timer";
import { dateTimeFullFormat, timeFormat } from "@/utils/date";

const props = defineProps<{
  userId: string;
}>();

const taskStore = useTaskStore();
const taskWorkerStore = useTaskWorkerStore();
const orderStore = useOrderStore();
const objectStore = useObjectStore();
const taskStatusStore = useTaskStatusStore();
const workHistoryStore = useWorkHistoryStore();
const userStore = useUserStore();
const timerStore = useTimerStore();

const user = computed(() => userStore.items.find((x) => x.id == props.userId));

const activeWorkHistory = computed(() =>
  workHistoryStore.items.find(
    (x) => x.workerId === props.userId && x.status == 0
  )
);

const activeObject = computed(() => {
  return objectStore.items.find(
    (x) => x.id == activeWorkHistory.value?.objectId
  );
});

const activeTask = computed(() => {
  return taskStore.items.find((x) => x.id == activeWorkHistory.value?.taskId);
});

const activeTaskWorker = computed(() =>
  taskWorkerStore.items.find(
    (x) => x.id == activeWorkHistory.value?.taskWorkerId
  )
);

const taskStatus = computed(() =>
  getObjectId(activeTaskWorker.value?.id)
    ? taskStatusStore.items.find(
        (x) => x.id == activeTaskWorker.value?.statusId
      )
    : null
);

const order = computed(() =>
  orderStore.items.find((x) => x.id == activeWorkHistory.value?.orderId)
);

const loading = ref(false);

const { t } = useI18n();

const onEndWorkHistory = () => {
  Modal.confirm({
    // transitionName: "",
    icon: null,
    content: h(
      "div",
      {
        class: "flex flex-row items-start gap-4",
      },
      [
        h(VIcon, {
          path: iWraningTriangle,
          class: "flex-none text-4xl text-red-500 dark:text-red-400",
        }),
        h(
          "div",
          {
            class: "flex-auto",
          },
          [
            h(
              "div",
              { class: "text-lg font-bold text-red-500 dark:text-red-400" },
              t("form.order.delete")
            ),
            h(
              "div",
              {},
              replaceSubstringByArray(t("message.endWorkHistory"), [
                user.value?.name,
              ])
            ),
          ]
        ),
      ]
    ),
    okButtonProps: { type: "primary", danger: true },
    okText: t("button.yes"),
    cancelText: t("button.no"),
    // title: t("form.task.delete"),
    onOk() {
      return new Promise(async (resolve, reject) => {
        try {
          await endWorkHistory();

          resolve("");
        } catch (e) {
          message.error("Error: end workHistory");
        }
      }).catch(() => console.log("Oops errors!"));
    },
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onCancel() {},
  });
};

const endWorkHistory = async () => {
  if (!activeWorkHistory.value?.id) {
    return;
  }

  const _statusPause = taskStatusStore.items.find((x) => x.status == "pause");
  if (!_statusPause) {
    return;
  }

  if (!activeTaskWorker.value) {
    return;
  }

  loading.value = true;

  await patch(activeTaskWorker.value?.id, {
    status: _statusPause.status,
    statusId: _statusPause.id,
    workerId: props.userId,
  })
    .then((r) => {
      return r;
    })
    .finally(() => {
      loading.value = false;
    });
};

// const operation = computed(() => {
//   return operationStore.items.find(
//     (x) => x.id === activeTasks.value?.operationId
//   );
// });

// const workers = computed(() =>
//   activeTasks.value?.workerId
//     ? userStore.items.filter((x) => activeTasks.value?.workerId.includes(x.id))
//     : []
// );

onMounted(() => {
  if (activeWorkHistory.value) {
    timerStore.find({
      workerId: [activeWorkHistory.value.workerId],
      isRunning: 1,
      workHistoryId: [activeWorkHistory.value.id],
    });
  }
});

const activeTimer = computed(() => {
  return timerStore.items.find(
    (x) => x.workHistoryId == activeWorkHistory.value?.id && x.isRunning == 1
  );
});
</script>
<template>
  <template v-if="activeWorkHistory">
    <a-tag
      :bordered="false"
      class="flex items-center gap-1 leading-3 py-1"
      :style="{
        background: taskStatus?.color,
        color: taskStatus ? invertColor(taskStatus?.color, true) : '',
      }"
    >
      <VIcon
        v-if="taskStatus?.icon"
        :path="taskStatus.icon"
        :class="['text-xl', taskStatus?.animate]"
      />
      <div class="w-48">
        <p class="text-sm">
          <!-- {{ activeWorkHistory.id }} -->
          {{ activeObject?.name }}
        </p>
        <p class="text-sm truncate">
          {{ order?.number ? "№" + order?.number + " - " : "" }}
          {{ order?.name }}
        </p>
        <p v-if="taskStatus" class="text-sm truncate">
          {{ activeTask?.name }}
          <!-- : {{ taskStatus?.name }} -->
        </p>
        <template v-if="!order?.number">
          <a-button
            size="small"
            :loading="loading"
            :disabled="loading"
            @click="onEndWorkHistory"
          >
            {{ $t("button.endWorkHistory") }}
          </a-button>
        </template>
        <!-- <p>
            {{ getShortFIO(activeTaskWorker?.user?.name) }}
          </p> -->
      </div>
    </a-tag>
    <!-- <div>
      {{ dayjs(activeWorkHistory.from).format(dateTimeFullFormat) }} ->
      {{ dayjs(activeTimer?.executeAt).format(dateTimeFullFormat) }}
    </div> -->
  </template>
  <a-tag :bordered="false" v-else>
    {{ $t("table.user.isWork0") }}
  </a-tag>
</template>
