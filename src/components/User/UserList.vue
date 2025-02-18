<script setup lang="ts">
import { computed, onMounted } from "vue";
import { IUser, IUserFilter } from "@/api/user/types";
import { useAuthStore, useTaskWorkerStore, useUserStore } from "@/store";
import dayjs from "@/utils/dayjs";
import sift from "sift";
import UserTask from "./UserTask.vue";

const props = defineProps<{
  keyList: string;
  params: IUserFilter;
  columns: {
    key: string;
    title: string;
    dataIndex: string;
    customFilterDropdown?: boolean;
    onFilter?: (value: any, record: IUser) => boolean;
    sorter?: (a: IUser, b: IUser) => number;
  }[];
}>();

const emit = defineEmits(["onEditItem", "onRemoveItem"]);

const userStore = useUserStore();
const authStore = useAuthStore();
const taskWorkerStore = useTaskWorkerStore();

const siftParams = computed(() => {
  const _result = Object.fromEntries(
    Object.entries(props.params)
      // .filter(([key, value]) => !["to"].includes(key))
      .map(([key, value]) => {
        if (typeof value === "object" && value?.length) {
          return [key, { $in: value }];
        } else {
          return [key, value];
        }
      })
  );
  return _result;
});

const columnsData = computed(() => {
  return userStore.items.filter(sift(siftParams.value)).map((x) => {
    const taskWorkers = taskWorkerStore.items.filter(
      (y) => y.workerId === x.id && !["finish", "autofinish"].includes(y.status)
    );
    return {
      ...x,
      key: x.id,
      taskWorkers,
    };
  });
});

onMounted(async () => {
  await userStore.find({ ...props.params });
});
</script>

<template>
  <a-table :columns="columns" :data-source="columnsData">
    <!-- :row-class-name="(_record: any, index: number) => (
      'custom ' + (
        _record.taskWorkers.length === 0
        ? 'priority bg-red-500/20 hover:!bg-red-500/40'
        : '')
      )" -->
    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'action'">
        <a-button
          v-if="authStore.roles.includes('user-patch')"
          @click="emit('onEditItem', record)"
        >
          {{ $t("button.edit") }}
        </a-button>
        <a-button
          v-if="authStore.roles.includes('user-delete')"
          @click="emit('onRemoveItem', record)"
        >
          {{ $t("button.delete") }}
        </a-button>
      </template>
      <template v-if="column.key === 'name'">
        <div>
          {{ record.name }}
        </div>
      </template>
      <template v-if="column.key === 'isWork'">
        <a-tag
          v-if="!record.isWork"
          :bordered="false"
          :color="record.isWork ? '#5ea500' : ''"
        >
          {{ $t(`table.user.isWork${record.isWork}`) }}
        </a-tag>
      </template>
      <template v-if="column.key === 'value'">
        <span
          v-for="item in record.role"
          :key="item"
          class="p-1 border border-zink-200 rounded-lg mr-1"
        >
          {{ item }}
        </span>
      </template>
      <template v-if="column.key === 'post'">
        <!-- :style="{
                  background: record.postObject.color,
                  color: invertColor(record.postObject.color, true),
                }" -->
        <a-tag :bordered="false">
          {{ record.postObject?.name }}
        </a-tag>
      </template>
      <template v-if="column.key === 'currentTask'">
        <UserTask :workerId="record.id" />
      </template>
      <template v-if="column.key === 'role'">
        <a-tag :bordered="false">{{ record.roleObject?.name }}</a-tag>
      </template>
      <template v-if="column.key === 'image'">
        <!-- <a-avatar
                class="bg-s-500 dark:bg-s-800"
                src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
              /> -->
        <div class="relative w-16 h-16">
          <VImg :image="record.images?.[0]" class="w-16 h-16 rounded-full" />
          <!-- :class="[{ 'border-4 border-green-500': record.online }]" -->
          <div
            v-if="record.online"
            class="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-green-500 border-4 border-white dark:border-g-900"
          ></div>
        </div>
      </template>
      <template v-if="column.key === 'birthday'">
        <p v-if="record.birthday">
          {{ dayjs(record.birthday, "DD.MM.YYYY").format("DD MMMM YYYY") }}
        </p>
      </template>
      <template v-if="column.key === 'typePay'">
        <p>
          {{ record.typePay ? $t(`typePay.${record.typePay}`) : "-" }}
        </p>
      </template>
      <template v-if="column.key === 'oklad'">
        <p v-if="record.oklad">{{ record.oklad }}</p>
        <p v-else>-</p>
      </template>
      <template v-if="column.key === 'lastTime'">
        <p>{{ dayjs(record.lastTime).fromNow() }}</p>
      </template>
    </template>

    <!-- <template #expandIcon="{ onExpand, record, expanded }">
            <DownOutlined
              :class="['transition-transform ', expanded ? 'rotate-180' : '']"
              @click="onExpand(record)"
            />
          </template>
          <template #expandedRowRender="{ record }">
            <p style="margin: 0">
              {{ record.description }}
            </p>
          </template>
          <template #expandColumnTitle>
            <span style="color: red">More</span>
          </template> -->
  </a-table>
</template>
