<script setup lang="ts">
import useOrder from "@/composable/useOrder";
import useTaskWorker from "@/composable/useTaskWorker";
import { useTaskWorkerStore } from "@/store";
import { getObjectId } from "@/utils/utils";
import { onMounted } from "vue";

const model = defineModel();
const props = defineProps<{
  workerId: string;
}>();

const emit = defineEmits(["change"]);

const taskWorkerStore = useTaskWorkerStore();

const { onFetch, state, onSetStateData } = useTaskWorker();

onMounted(() => {
  const taskWorker = taskWorkerStore.items.find((x) => x.id === model.value);
  taskWorker?.order && onFetch(taskWorker?.order.name, props.workerId);

  // if (taskWorker?.id && getObjectId(taskWorker?.id) == "0") {
  //   onSetStateData([taskWorker]);
  // }
});
</script>

<template>
  <a-form-item :label="$t('form.workHistory.taskWorkerId')" name="objectId">
    <a-select
      v-model:value="model"
      style="width: 100%"
      :placeholder="$t('form.order.selectOrder')"
      :options="state.data"
      :show-search="true"
      :filter-option="false"
      :not-found-content="state.value ? undefined : null"
      @search="(value: string) => {
        onFetch(value, workerId)
      }"
      @change="(value: any) => {
        emit('change', value)
      }"
    >
      <template #option="option">
        <div class="flex items-center gap-2">
          <!-- <div class="text-xl font-bold">№{{ option.order.number }}</div> -->
          <div>
            <p>
              {{ option.operation?.name }},
              <span class="font-bold"> №{{ option.order.number }} </span>
              {{ option.order.name }}
            </p>
            <p class="text-g-400 dark:text-g-500">
              {{ option.order.year }}, {{ $t("form.task.statusId") }}-{{
                option.taskStatus?.name
              }}
            </p>
          </div>
        </div>
      </template>
      <template #notFoundContent>
        <div v-if="state.fetching">
          <a-spin v-if="state.fetching" size="small" />
        </div>
        <div v-else class="flex">
          <div>
            <p>{{ $t("form.object.notfound") }}: {{ state.value }}</p>
            <!-- <a-button
              type="primary"
              @click="
                () =>
                  onCreateObject((result) => {
                    model = result.id;
                  })
              "
            >
              {{ $t("form.object.add") }} {{ state.value }}
            </a-button> -->
          </div>
        </div>
      </template>
      <!-- <template #dropdownRender="{ menuNode: menu }">
            <a-space style="padding: 4px 8px">
              <a-input
                ref="inputRef"
                v-model:value="queryObject"
                placeholder="Please enter item"
              />
              <a-button type="text" @click="onFindObjects">
                <template #icon>
                  <VIcon :path="iSearch" class="inline" />
                </template>
                Search
              </a-button>
            </a-space>
            <a-divider style="margin: 4px 0" />
            <v-nodes v-if="!loading" :vnodes="menu" />
            <a-spin v-else />
          </template> -->
    </a-select>
  </a-form-item>
</template>
