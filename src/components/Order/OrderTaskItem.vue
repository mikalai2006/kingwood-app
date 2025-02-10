<script setup lang="ts">
import { ITask } from "@/api/task/types";
import {
  useAuthStore,
  useOperationStore,
  useOrderStore,
  usePostStore,
  useTaskStatusStore,
  useTaskStore,
  useTaskWorkerStore,
  useUserStore,
} from "@/store";
import { iPen, iPlusLg, iTrashFill, iWraningTriangle } from "@/utils/icons";
import { computed, h, ref } from "vue";
import VIcon from "../UI/VIcon.vue";
import {
  getShortFIO,
  invertColor,
  replaceSubstringByArray,
} from "@/utils/utils";
import { ITaskWorker, ITaskWorkerInput } from "@/api/task_worker/types";
import { message, Modal } from "ant-design-vue";
import { useI18n } from "vue-i18n";
import TaskWorkerStatusTag from "../Task/TaskWorkerStatusTag.vue";
import VFormTaskWorker from "../Form/VFormTaskWorker.vue";
import VImg from "../UI/VImg.vue";

const props = defineProps<{ taskId: string }>();
const emit = defineEmits(["onEditTask"]);

const authStore = useAuthStore();
const userStore = useUserStore();
const orderStore = useOrderStore();
const taskStore = useTaskStore();
const taskWorkerStore = useTaskWorkerStore();
const postStore = usePostStore();
const taskStatusStore = useTaskStatusStore();

const taskWorkers = computed(() => {
  return taskWorkerStore.items
    .filter((x) => x.taskId === props.taskId)
    .map((x) => {
      const worker = userStore.items.find((y) => y.id === x.workerId);
      const post = postStore.items.find((y) => y.id === worker?.postId);
      const statusObject = taskStatusStore.items.find(
        (z) => z.id === x?.statusId
      );
      return {
        ...x,
        worker,
        post,
        statusObject,
      };
    });
});

const task = computed(() => taskStore.items.find((x) => x.id === props.taskId));

const taskStatus = computed(() =>
  taskStatusStore.items.find((x) => x.id === task.value?.statusId)
);

const statuses = computed(() => [
  ...new Set(taskWorkers.value.map((y) => y.statusId)),
]);

// const operation = computed(() =>
//   operationStore.items.find((x) => x.id === props.tasks[0].operationId)
// );

// const tasksPopulate = computed(() =>
//   props.tasks.map((x) => {
//     const worker = userStore.items.find((y) => y.id === x.workerId);
//     return {
//       ...x,
//       worker,
//     };
//   })
// );
const { t } = useI18n();
// const trashTaskLodal = ref(false);

const onDeleteTask = (item: ITask | undefined) => {
  if (taskWorkers.value?.length) {
    Modal.warning({
      title: t("notify.warning"),
      content: t("error.noRemoveTaskWithWrokers"),
    });
    return;
  }

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
              t("form.task.delete")
            ),
            h(
              "div",
              {},
              replaceSubstringByArray(t("message.removeTask"), [
                task.value?.name,
                order.value?.number,
                order.value?.name,
                order.value?.object?.name,
              ])
            ),
          ]
        ),
      ]
    ),
    okButtonProps: { type: "primary", danger: true },
    okText: t("button.delete"),
    cancelText: t("button.cancel"),
    onOk() {
      return new Promise((resolve, reject) => {
        try {
          item?.id &&
            taskStore
              .deleteItem(item.id)
              .then((res) => {
                message.success(
                  replaceSubstringByArray(t("message.deleteTaskOk"), [
                    res?.name,
                  ])
                );
              })
              .finally(() => {
                resolve("");
              });
        } catch (e) {
          message.error("Error: delete task");
        }
      }).catch(() => console.log("Oops errors!"));
    },
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onCancel() {},
  });

  // console.log("Delete task: ", item);
  // //   await emit("onDeleteTask", item);
  // return new Promise((resolve) => {
  //   setTimeout(() => resolve(true), 3000);
  // });
};

const onDeleteTaskWorker = (item: ITaskWorker | undefined) => {
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
              t("form.taskWorker.delete")
            ),
            h(
              "div",
              {},
              replaceSubstringByArray(t("message.removeTaskWorker"), [
                item?.worker?.name,
                order.value?.number,
                order.value?.name,
              ])
            ),
          ]
        ),
      ]
    ),
    okButtonProps: { type: "primary", danger: true },
    okText: t("button.delete"),
    cancelText: t("button.cancel"),
    onOk() {
      return new Promise((resolve, reject) => {
        try {
          item?.id &&
            taskWorkerStore
              .onRemove(item.id)
              .then((res) => {
                message.success(
                  replaceSubstringByArray(t("message.deleteTaskWorkerOk"), [
                    getShortFIO(res?.worker.name),
                  ])
                );
              })
              .finally(() => {
                resolve("");
              });
        } catch (e) {
          message.error("Error: delete taskWorker");
        }
      }).catch(() => console.log("Oops errors!"));
    },
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onCancel() {},
  });

  // console.log("Delete task: ", item);
  // //   await emit("onDeleteTask", item);
  // return new Promise((resolve) => {
  //   setTimeout(() => resolve(true), 3000);
  // });
};

const order = computed(() => {
  return orderStore.items.find((x) => x.id === task.value?.orderId);
});

const openTaskModal = ref(false);

const showTaskModal = () => {
  openTaskModal.value = true;
};

const defaultDataTask: ITaskWorkerInput = {};

const dataTaskForm = ref(defaultDataTask);

const onAddNewTaskWorker = (orderId: string | undefined) => {
  if (!orderId) return;

  console.log("Add task worker: taskId=", props.taskId);

  dataTaskForm.value = {
    ...defaultDataTask,
    taskId: props.taskId,
    orderId: task.value?.orderId,
    objectId: task.value?.objectId,
    operationId: task.value?.operationId,
  };
  showTaskModal();
};

const onEditTaskWorker = (item: ITaskWorker) => {
  console.log("Edit taskWorker: ", item);

  dataTaskForm.value = Object.assign({}, item, {
    orderId: task.value?.orderId,
    objectId: task.value?.objectId,
    operationId: task.value?.operationId,
  });
  showTaskModal();
};

// const onDeleteTaskWorker = async (item: ITaskWorker) => {
//   console.log("Delete taskWorker: ", item);
//   await taskWorkerStore.onRemove(item.id);
//   return new Promise((resolve) => {
//     setTimeout(() => resolve(true), 1000);
//   });
// };
</script>

<template>
  <div class="flex flex-col items-center">
    <div
      :class="['rounded-full p-2 relative flex items-center justify-center']"
      :style="{
        background: taskStatus?.color,
        color: invertColor(taskStatus?.color, true),
      }"
    >
      <VIcon
        v-if="taskStatus?.icon"
        :path="taskStatus?.icon"
        :class="['text-xl', taskStatus.animate]"
      />
    </div>
    <div
      :class="['mt-2 -mb-2 w-[2px] flex-auto']"
      :style="{
        // background: taskWorkers[0]?.post?.color,
        // color: invertColor(taskWorkers[0]?.post?.color, true),
        background: taskStatus?.color,
        // color: invertColor(taskStatus?.color, true),
      }"
    ></div>
  </div>

  <div class="pl-2 flex-auto group pb-2">
    <div class="flex flex-row items-center gap-1">
      <div class="font-medium pb-2 text-base">
        <!-- {{ typeof task?.sortOrder == "number" && task.sortOrder + 1 }}) -->
        {{ task?.name }}
        <!-- <a-tag v-if="task?.active" color="#0d913d"> Активное задание </a-tag> -->
      </div>
      <!-- <a-popconfirm
        :cancelText="$t('button.cancel')"
        :okText="$t('button.delete')"
        :okButtonProps="{
          size: 'small',
          type: 'primary',
          danger: true,
        }"
        @confirm="onDeleteTask(task)"
      >
        <template #title>
          <div class="w-52">
            {{
              replaceSubstringByArray($t("message.removeTask"), [
                task?.name,
                order?.number,
                order?.object,
                order?.name,
              ])
            }}
          </div>
        </template>
        <template #icon>
          <VIcon :path="iWraningTriangle" class="text-2xl text-red-500" />
        </template>
      </a-popconfirm> -->
      <div class="flex flex-row items-center gap-2">
        <!-- v-if="task?.status !== 'finish'" -->
        <a-tooltip v-if="authStore.roles?.includes('task-delete')">
          <template #title>
            {{ $t("button.deleteTask") }}
          </template>
          <a-button
            size="small"
            danger
            class="hidden group-hover:block"
            @click="onDeleteTask(task)"
          >
            <div class="flex gap-1 items-center">
              <VIcon :path="iTrashFill" />
            </div>
          </a-button>
        </a-tooltip>
        <a-tooltip v-if="authStore.roles?.includes('taskWorker-patch')">
          <template #title>
            {{ $t("button.editTask") }}
          </template>
          <a-button
            size="small"
            class="hidden group-hover:block"
            @click="$emit('onEditTask', task)"
          >
            <div class="flex gap-1 items-center">
              <VIcon :path="iPen" />
            </div>
          </a-button>
        </a-tooltip>
      </div>
    </div>

    <div
      v-for="(item, key) in taskWorkers"
      class="flex flex-row items-center gap-4 py-1 px-4"
    >
      <div class="flex flex-row items-center gap-1">
        <div>
          <VImg
            :image="item.worker?.images?.[0]"
            class="w-8 h-8 rounded-full"
          />
        </div>
        <!-- <img
          src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
          class="w-8 h-8 rounded-full border-2 border-s-200"
        /> -->
        <div class="text-s-500 dark:text-s-300 flex-auto">
          {{ getShortFIO(item.worker?.name) }}
        </div>
      </div>
      <div class="self-center pl-4 hidden group-hover:flex flex-row gap-2">
        <a-tooltip v-if="authStore.roles?.includes('taskWorker-patch')">
          <template #title>
            {{ $t("button.patchTaskWorker") }}
          </template>
          <a-button size="small" @click="onEditTaskWorker(item as ITaskWorker)">
            <div class="flex gap-1 items-center">
              <VIcon :path="iPen" class="text-xs" />
              <!-- {{ $t("button.edit") }} -->
            </div>
          </a-button>
        </a-tooltip>

        <a-tooltip
          v-if="
            authStore.roles?.includes('taskWorker-delete') &&
            item.status === 'wait'
          "
        >
          <template #title>
            {{ $t("button.deleteTaskWorker") }}
          </template>
          <a-button
            size="small"
            danger
            class="hidden group-hover:block"
            @click="onDeleteTaskWorker(item as ITaskWorker)"
          >
            <div class="flex gap-1 items-center">
              <VIcon :path="iTrashFill" />
            </div>
          </a-button>
        </a-tooltip>
        <!-- <a-popconfirm
          v-if="authStore.roles?.includes('taskWorker-delete')"
          :cancelText="$t('button.cancel')"
          :okText="$t('button.delete')"
          :okButtonProps="{
            size: 'small',
            type: 'primary',
            danger: true,
          }"
          @confirm="onDeleteTaskWorker(item as ITaskWorker)"
        >
          <template #title>
            <div class="w-52">
              {{
                replaceSubstringByArray($t("message.removeTaskWorker"), [
                  item.worker?.name,
                  order?.number,
                  order?.name,
                ])
              }}
            </div>
          </template>
          <template #icon>
            <VIcon :path="iWraningTriangle" class="text-2xl text-red-500" />
          </template>
          <a-tooltip>
            <template #title>
              {{ $t("button.deleteTaskWorker") }}
            </template>
            <a-button danger size="small">
              <VIcon :path="iTrashFill" />
            </a-button>
          </a-tooltip>
        </a-popconfirm> -->
      </div>
      <div>
        <TaskWorkerStatusTag :task-worker-id="item.id" />
      </div>
    </div>

    <div
      v-if="
        authStore.roles?.includes('taskWorker-create') &&
        task?.status != 'finish'
      "
      class="flex flex-row items-center gap-4 py-1 px-4"
    >
      <div class="flex flex-row flex-auto items-center gap-1">
        <a-tooltip>
          <template #title>
            {{ $t("form.taskWorker.add") }}
          </template>
          <a-button
            shape="circle"
            type="dashed"
            size="middle"
            @click="onAddNewTaskWorker(task?.orderId)"
          >
            <div class="flex items-center justify-center">
              <VIcon :path="iPlusLg" class="text-xl" />
            </div>
          </a-button>
        </a-tooltip>
      </div>
    </div>
  </div>

  <a-modal
    v-model:open="openTaskModal"
    :destroyOnClose="true"
    :key="dataTaskForm.id"
    :title="
      dataTaskForm.id ? $t('form.taskWorker.edit') : $t('form.taskWorker.new')
    "
    :ok-button-props="{ hidden: true }"
    :cancel-button-props="{ hidden: true }"
  >
    <VFormTaskWorker
      :data="dataTaskForm"
      :default-data="defaultDataTask"
      @callback="
        () => {
          openTaskModal = false;
        }
      "
    />
  </a-modal>

  <!-- <a-modal
    v-model:open="trashTaskLodal"
    style="top: 20px"
    @ok="onDeleteTask(task)"
    transitionName=""
    :title="$t('form.task.delete')"
    :icon="iWraningTriangle"
    :okButtonProps="{ type: 'primary', danger: true }"
    :okText="$t('button.delete')"
    :cancelText="$t('button.cancel')"
  >
    <div class="w-52">
      {{
        replaceSubstringByArray($t("message.removeTask"), [
          task?.name,
          order?.number,
          order?.object,
          order?.name,
        ])
      }}
    </div>
  </a-modal> -->
</template>
