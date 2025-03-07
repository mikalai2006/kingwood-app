<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import draggable from "vuedraggable";
import {
  useGeneralStore,
  useOperationStore,
  useTaskStore,
  useUserStore,
} from "@/store";
import OrderTaskItem from "./OrderTaskItem.vue";
import { ITask } from "@/api/task/types";
import { sort } from "@/api/task";
import { message } from "ant-design-vue";

const props = defineProps<{ orderId: string }>();
const emit = defineEmits(["onEditTask"]);

const taskStore = useTaskStore();
const operationStore = useOperationStore();
const userStore = useUserStore();
const generalStore = useGeneralStore();

const tasksByOrder = computed<ITask[]>({
  get() {
    return taskStore.items
      .filter((x) => x.orderId === props.orderId && x.statusId !== "finish")
      .sort((a, b) => a.sortOrder - b.sortOrder);
  },
  set(value) {},
});
const taskNotCompleted = computed(() =>
  taskStore.items.filter(
    (x) => x.orderId === props.orderId && x.statusId !== "finish"
  )
);
const tasksCompleted = computed(() =>
  taskStore.items.filter(
    (x) => x.orderId === props.orderId && x.statusId === "finish"
  )
);

const operationMontaj = computed(() =>
  operationStore.items.filter(
    (x) => x.name.toLowerCase().indexOf("монтаж") > -1
  )
);

onMounted(() => {
  tasksByOrder.value = taskStore.items
    .filter((x) => x.orderId === props.orderId && x.statusId !== "finish")
    .sort((a, b) => a.sortOrder - b.sortOrder);
});

const loading = ref(false);
const onSaveSortOrder = async () => {
  loading.value = true;
  const data = tasksByOrder.value.map((x, index) => {
    return {
      id: x.id,
      name: x.name,
      sortOrder: index + tasksCompleted.value.length,
    };
  });

  await sort(data)
    .then((r: any) => {
      r.forEach((element: ITask) => {
        taskStore.onAddItemToStore(element);
      });
      message.success("Порядок задач успешно изменен!");
    })
    .catch((e) => {
      message.error(e.message);
    })
    .finally(() => {
      loading.value = false;
    });
  console.log("data: ", data);
};

// () => {
//   return taskStore.items.filter((x) => x.orderId === props.orderId);
//   //   .map((x, index) => {
//   //     const operation = operationStore.items.find(
//   //       (y) => y.id === x.operationId
//   //     );
//   //     const worker = userStore.items.find((y) => y.id === x.workerId);
//   //     // .filter((y) => x.workerId.includes(y.id));
//   //     return {
//   //       ...x,
//   //       operation,
//   //       worker,
//   //       // title: operation?.name,
//   //       // subTitle: "00:00:05",
//   //       // description: workers.map((u) => u.name).join(", "),
//   //       // content: h(StepOperation),
//   //       // // icon: h(LoadingOutlined),
//   //       // // status: index == 1 ? "process" : "finish",
//   //     };
//   //   });

//   // const _group = Object.groupBy(_tasks, ({ operationId }) => operationId);

//   // const result = {};
//   // for (const key in _group) {
//   //   console.log("key=", key);

//   //   // for (const item in _group[key]) {
//   //   //   _items.push({
//   //   //     ...item,

//   //   //   })
//   //   // }
//   //   // const status = new Set(_group[key]?.map((x) => x.status));
//   //   result[key] = {
//   //     items: _group[key],
//   //     sortOrder: 1,
//   //   };
//   // }
//   // return result;
// }
// );

const activeKey = ref("list");
</script>
<template>
  <div class="b-scroll">
    <!-- <a-steps
      direction="vertical"
      inline
      :current="1"
      responsive
      :items="tasksByOrder"
    >
      <a-step v-for="item in tasksByOrder">
        <template #default>
          <StepOperation
            :operation-id="item.operationId"
            :order-id="item.id"
            :task-id="item.orderId"
          />
        </template>
      </a-step>
    </a-steps> -->
    <div class="flex flex-col gap-1">
      <!-- <pre>{{ JSON.stringify(Object.values(tasksByOrder), null, 2) }}</pre> -->
      <!-- <div
        v-for="(items, operationId) in tasksByOrder"
        class="flex flex-row hover:bg-s-100"
      > -->

      <!-- <a-tabs
        v-model:activeKey="activeKey"
        :tabBarStyle="{
          position: 'sticky',
          top: 0,
          'z-index': 50,
          background:
            generalStore.themeMode === 'dark' ? Colors.g[900] : Colors.white,
        }"
      >
        <a-tab-pane key="list" :tab="$t('tabs.task.list')" force-render> -->
      <div v-if="tasksByOrder.length === 0" class="text-g-500 dark:text-g-300">
        {{ $t("info.notFoundTasks") }}
      </div>
      <div
        v-for="task in tasksCompleted"
        class="p-2 flex flex-row hover:bg-black/5 dark:hover:bg-black/10"
      >
        <OrderTaskItem
          :taskId="task.id"
          @on-edit-task="emit('onEditTask', task)"
        />
      </div>
      <draggable
        :list="tasksByOrder"
        item-key="name"
        :disabled="false"
        @end="onSaveSortOrder"
      >
        <template #item="{ element }">
          <div class="p-2 flex flex-row">
            <!-- <template
                  v-if="
                    operationMontaj
                      .map((x) => x.id)
                      .includes(element.operationId)
                  "
                >
                  <OrderTaskItemMontaj
                    :objectId="element.objectId"
                    :taskId="element.id"
                    @on-edit-task="emit('onEditTask', element)"
                  />
                </template>
                <template v-else>
                </template> -->
            <OrderTaskItem
              :taskId="element.id"
              @on-edit-task="emit('onEditTask', element)"
            />
          </div>
        </template>
      </draggable>
      <!-- </a-tab-pane>
        <a-tab-pane key="history" :tab="$t('tabs.task.log')"> </a-tab-pane>
      </a-tabs> -->

      <!-- </div> -->
    </div>
    <!-- <a-list :data-source="tasksByOrder">
      <template #renderItem="{ item, index }">
        <a-list-item>
          <a-list-item-meta>
            <template #title>
              <a href="https://www.antdv.com/">{{ item.title }}</a>
            </template>
            <template #description>
              <a-button type="default">edit</a-button>
            </template>
            <template #avatar>
              <SyncOutlined v-if="index === 1" spin style="font-size: 20px" />
              <CheckOutlined v-else-if="index === 0" style="font-size: 20px" />
              <p v-else>{{ index }}</p>
            </template>
          </a-list-item-meta>
          <a-steps
            style="margin-top: 8px"
            type="inline"
            :current="item.current"
            :status="item.status"
            :items="tasksByOrder"
          />
        </a-list-item>
      </template>
    </a-list> -->
  </div>
  <div
    v-if="loading"
    class="bg-white/95 dark:bg-s-900/95 absolute inset-0 flex items-center justify-center"
  >
    <a-spin />
  </div>
</template>

<style scoped></style>
