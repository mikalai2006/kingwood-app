<script setup lang="ts">
import {
  useAuthStore,
  useObjectStore,
  useOperationStore,
  useOrderStore,
  useUserStore,
} from "@/store";
import dayjs from "@/utils/dayjs";
import { computed, h, onMounted, ref } from "vue";
import { IWorkHistoryExtends } from "./FinancyPaneTableTotal.vue";
import { useI18n } from "vue-i18n";
import FinancyOrder from "./FinancyOrder.vue";
import { getObjectTime } from "@/utils/time";
import { IPaneOptionFinancy } from "@/api/types";
import VFormWorkHistory from "../Form/VFormWorkHistory.vue";
import { iChange, iPen, iPlusLg, iTrashFill } from "@/utils/icons";
import FinancyWorkHistoryChanges from "./FinancyWorkHistoryChanges.vue";
import VIcon from "../UI/VIcon.vue";
import { findArchiveWorkHistory } from "@/api/archive";
import { IArchiveWorkHistory } from "@/api/archive/types";

const props = defineProps<{
  workHistorys: IWorkHistoryExtends[];
  date: string;
  fullDate: string;
  pane: IPaneOptionFinancy;
  showButtonAdd?: boolean;
}>();

const { t } = useI18n();

const authStore = useAuthStore();
const userStore = useUserStore();
const orderStore = useOrderStore();
const objectStore = useObjectStore();
const operationStore = useOperationStore();

const historyItems = ref<IArchiveWorkHistory[]>([]);
const archiveWorkHistory = computed(() => {
  const _list = historyItems.value
    // .filter((x) => idsWorkHistory.value.includes(x.workTimeId))
    .filter(
      (x) =>
        props.pane.workerId == x.workerId &&
        dayjs(x.date).date().toString() == props.date &&
        dayjs(x.to).year() != 1
    )
    .map((x) => {
      // console.log("x.workHistory: ", x.workHistory);

      const dayTo = dayjs(x.to);
      // console.log(dayTo.year(), dayTo.diff(x.from));

      const _totalMinutes = dayTo.year() != 1 ? dayTo.diff(x.from) : 0;

      const order = orderStore.items.find((_order) => _order.id === x.orderId);
      const object = objectStore.items.find(
        (_object) => _object.id === x.objectId
      );
      const operation = operationStore.items.find(
        (_operation) => _operation.id === x.operationId
      );
      return {
        ...x,
        totalMinutes: _totalMinutes,
        order,
        object,
        operation,
      };
    });
  return _list;
});

const onFindArchiveWorkHistory = async () => {
  await findArchiveWorkHistory({
    workerId: props.pane.workerId ? [props.pane.workerId] : undefined,
    from: props.fullDate || undefined,
    to: props.fullDate
      ? dayjs(props.fullDate).endOf("day").format()
      : undefined,
    $limit: 1000,
  }).then((r) => {
    if (r.data) {
      historyItems.value = r.data;
    }
  });
};

onMounted(() => {
  onFindArchiveWorkHistory();
});
</script>

<template>
  <a-list item-layout="horizontal" :data-source="archiveWorkHistory">
    <template #footer> </template>
    <template #renderItem="{ item }">
      <a-list-item>
        <a-list-item-meta>
          <template #title> </template>
          <template #description>
            <div class="flex flex-row items-center leading-4 group">
              <div class="flex-auto">
                <!-- {{ item.workerId }} -->
                <button
                  type="button"
                  class="bg-transparent leading-4 font-medium text-g-300 dark:text-g-500 group text-left"
                  @click="
                    () => {
                      //onViewFinancyOrder(item.order.id)
                    }
                  "
                >
                  <span class="">
                    {{
                      item.order?.number ? "№" + item.order?.number + " - " : ""
                    }}
                    {{ item.order?.name }}
                  </span>
                </button>

                <div>
                  {{ $t("table.financy.operation") }}:
                  {{ item.operation?.name }}, {{ t("table.financy.object") }}:
                  {{ item.object?.name }}
                </div>
              </div>
              <div class="flex flex-row items-center gap-4">
                <div class="flex flex-row gap-2">
                  <!-- <a-tooltip
                      v-if="authStore.roles.includes('workHistory-delete')"
                    >
                      <template #title>
                        {{ $t("button.delete") }}
                      </template>
                      <a-button
                        danger
                        type="link"
                        class="invisible group-hover:visible"
                        @click="(e: Event) => {onDeleteWorkHistory(item); e.preventDefault(); e.stopPropagation()}"
                      >
                        <VIcon :path="iTrashFill" />
                      </a-button>
                    </a-tooltip> -->

                  <!-- <a-tooltip>
                      <template #title>
                        {{ $t("modal.changedView") }}
                      </template>
                      <a-button
                        v-if="
                          item.props &&
                          Object.values(item.props).length &&
                          authStore.roles.includes('workHistory-view-changes')
                        "
                        type="text"
                        class="p-0"
                        @click="
                          () => {
                            onViewChanged(item);
                          }
                        "
                      >
                        <a-badge :count="Object.values(item.props).length">
                          <div class="flex gap-2 px-2.5">
                            <VIcon :path="iChange" />
                          </div>
                        </a-badge>
                      </a-button>
                    </a-tooltip> -->
                </div>
                <div class="text-end">
                  <div
                    class="text-p-700 dark:text-p-400 font-medium text-base leading-5"
                  >
                    {{ item.total.toLocaleString("ru-RU") }} ₽
                  </div>
                  <!-- <FinancyPaneTableTotal
                  v-if="workTimes"
                  :data="workTimes"
                  :pane="pane"
                /> -->
                  <TimePretty :time="getObjectTime(item.totalMinutes)" />
                </div>
              </div>
            </div>
          </template>
          <!-- <template #avatar>
              <VImage
                class="w-10 h-10 object-cover rounded-full"
                :image="item.order.images ? item.order.images[0] : null"
              />
            </template> -->
        </a-list-item-meta>
      </a-list-item>
    </template>
  </a-list>
</template>
