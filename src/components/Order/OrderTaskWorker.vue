<script setup lang="ts">
import { ITask } from "@/api/task/types";
import {
  useOperationStore,
  useOrderStore,
  useTaskStore,
  useTaskWorkerStore,
  useUserStore,
} from "@/store";
import {
  iCheckLg,
  iSpinThree,
  iTimerGlass,
  iWraningTriangle,
} from "@/utils/icons";
import { computed, ref } from "vue";
import VIcon from "../UI/VIcon.vue";
import { invertColor, replaceSubstringByArray } from "@/utils/utils";

const props = defineProps<{ taskId: string }>();
const emit = defineEmits(["onEditTask"]);

const operationStore = useOperationStore();
const userStore = useUserStore();
const orderStore = useOrderStore();
const taskStore = useTaskStore();
const taskWorkerStore = useTaskWorkerStore();

const taskWorkers = computed(() => {
  return taskWorkerStore.items
    .filter((x) => x.taskId === props.taskId)
    .map((x) => {
      const worker = userStore.items.find((y) => y.id === x.workerId);

      return {
        ...x,
        worker,
      };
    });
});

const task = computed(() => taskStore.items.find((x) => x.id === props.taskId));

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

const onDeleteTask = (item: any) => {
  import.meta.env.VIEW_CONSOLE && console.log("Delete task: ", item);
  //   await emit("onDeleteTask", item);
  return new Promise((resolve) => {
    setTimeout(() => resolve(true), 3000);
  });
};

const order = computed(() => {
  return orderStore.items.find((x) => x.id === task.value?.orderId);
});
</script>

<template>
  <div class="flex flex-col items-center">
    <div
      :class="[
        'rounded-full w-6 h-6 relative flex items-center justify-center',
        {
          'bg-zinc-200': statuses?.includes('wait'),
        },
        // { '': item.status === 'process' },
        {
          'bg-green-500': statuses?.includes('finish') && statuses.length === 1,
        },
        // { 'bg-zinc-200': !item.status },
      ]"
    >
      <VIcon
        v-if="statuses?.includes('wait')"
        :path="iTimerGlass"
        class="text-s-400 text-md"
      />
      <VIcon
        v-else-if="statuses?.includes('process')"
        :path="iSpinThree"
        class="text-md animate-spin2"
      />
      <VIcon
        v-else-if="statuses?.includes('finish') && statuses.length === 1"
        :path="iCheckLg"
        class="text-white text-xl"
      />
    </div>
    <div
      :class="[
        'mt-1 w-[2px] flex-auto',
        statuses?.includes('finish1') ? ' bg-teal-500 ' : ' bg-s-200 ',
      ]"
    ></div>
  </div>

  <div class="pl-2 flex-auto">
    <div class="flex flex-row">
      <div class="font-medium">
        {{ task?.name }}
      </div>
    </div>

    <div
      v-for="(item, key) in taskWorkers"
      class="flex flex-row items-center gap-4 py-1 px-4"
    >
      <div class="flex flex-row flex-auto items-center gap-1">
        <img
          src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
          class="w-8 h-8 rounded-full border-2 border-s-200"
        />
        <div class="text-s-500">
          {{ item.worker?.name }}
        </div>
      </div>
      <div class="self-center pl-4">
        <a-popconfirm
          :cancelText="$t('button.cancel')"
          :okText="$t('button.delete')"
          :okButtonProps="{
            size: 'small',
            type: 'primary',
            danger: true,
          }"
          @confirm="onDeleteTask(item)"
        >
          <!-- <template #okButton>
            <a-button
              type="primary"
              danger
              size="small"
              @click="onDeleteTask(item)"
            >
              {{ $t("button.delete") }}
            </a-button>
          </template> -->
          <template #title>
            <div class="w-52">
              {{
                replaceSubstringByArray($t("message.removeTask"), [
                  item.worker?.name,
                  order?.number,
                  order?.objectId,
                  order?.name,
                ])
              }}
            </div>
          </template>
          <template #icon>
            <VIcon :path="iWraningTriangle" class="text-2xl text-red-500" />
          </template>
          <a-button>
            {{ $t("button.delete") }}
          </a-button>
        </a-popconfirm>
        <a-button
          class="hidden group-hover:block"
          @click="$emit('onEditTask', item)"
        >
          {{ $t("button.edit") }}
        </a-button>
      </div>
    </div>
  </div>
</template>
