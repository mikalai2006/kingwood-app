<script setup lang="ts">
import {
  useAuthStore,
  useObjectStore,
  useOperationStore,
  useOrderStore,
  useUserStore,
  useWorkHistoryStore,
} from "@/store";
import dayjs from "@/utils/dayjs";
import { computed, h, onMounted, ref } from "vue";
import FinancyPaneTableTotal, {
  IWorkHistoryExtends,
} from "./FinancyPaneTableTotal.vue";
import { useI18n } from "vue-i18n";
import { IOrder } from "@/api/order/types";
import FinancyOrder from "./FinancyOrder.vue";
import VImage from "../UI/VImage.vue";
import { getObjectTime } from "@/utils/time";
import { IPaneOptionFinancy } from "@/api/types";
import { IWorkHistory, IWorkHistoryInput } from "@/api/work_history/types";
import VFormWorkHistory from "../Form/VFormWorkHistory.vue";
import {
  iChange,
  iChanged,
  iPen,
  iPlusLg,
  iTrashFill,
  iWraningTriangle,
} from "@/utils/icons";
import FinancyWorkHistoryChanges from "./FinancyWorkHistoryChanges.vue";
import { replaceSubstringByArray } from "@/utils/utils";
import VIcon from "../UI/VIcon.vue";
import { Modal } from "ant-design-vue";
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
const workHistoryStore = useWorkHistoryStore();
const orderStore = useOrderStore();
const objectStore = useObjectStore();
const operationStore = useOperationStore();

// const idsWorkHistory = computed(() => props.workHistorys.map((x) => x.id));

const workHistory = computed(() => {
  const _list = workHistoryStore.items
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

const openFinancyOrder = ref(false);

const activeFinancyOrder = ref<IOrder | null>();

const onViewFinancyOrder = (orderId: string) => {
  const _order = orderStore.items.find((x) => x.id === orderId);

  if (_order) {
    activeFinancyOrder.value = _order;
    openFinancyOrder.value = true;
  }
};

const innerColumns = [
  { title: t("table.financy.object"), dataIndex: "object", key: "object" },
  { title: t("table.financy.order"), dataIndex: "order", key: "order" },
  { title: t("table.financy.operation"), key: "operation" },
  {
    title: t("table.financy.time"),
    dataIndex: "time",
    key: "time",
  },
];

const showFormWorkHistory = ref(false);

const defaultDataForm: IWorkHistoryInput = {};

const dataForm = ref(defaultDataForm);

// const onAddNewItem = () => {
//   dataForm.value = Object.assign({}, defaultData);
//   showModal();
// };

const onEditItem = (item: IWorkHistory) => {
  import.meta.env.VIEW_CONSOLE && console.log("edit WorkHistory: ", item);

  dataForm.value = Object.assign({}, item);
  showFormWorkHistory.value = true;
};

const onDeleteWorkHistory = (item: IWorkHistoryInput) => {
  import.meta.env.VIEW_CONSOLE && console.log("delete WorkHistory: ", item);

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
              t("form.workHistory.delete")
            ),
            h(
              "div",
              {},
              replaceSubstringByArray(t("message.deleteWorkHistory"), [
                item.order?.name,
              ])
            ),
          ]
        ),
      ]
    ),
    okButtonProps: { type: "primary", danger: true },
    okText: t("button.ok"),
    cancelText: t("button.cancel"),
    onOk() {
      return new Promise(async (resolve, reject) => {
        try {
          if (!item.id) {
            throw null;
          }

          await workHistoryStore.onRemove(item.id);

          resolve("");
        } catch (e: any) {
          throw new Error(e);
        }
      }).catch((e: any) => {
        throw new Error(e);
      });
    },
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onCancel() {},
  });
};

const onAddItem = () => {
  const userForPayload = userStore.items.find(
    (x) => x.id === props.pane.workerId
  );
  if (!userForPayload) {
    return;
  }

  const timeFrom = dayjs(props.date);
  const timeTo = dayjs(props.date);
  dataForm.value = Object.assign(
    {},
    {
      workerId: userForPayload.id,
      from: timeFrom.format(),
      date: timeFrom.set("hour", 12).format(),
      to: timeTo.endOf("day").set("seconds", 0).format(),
      oklad: userForPayload.oklad,
      workTimeId: props.workHistorys[0].id,
    }
  );
  showFormWorkHistory.value = true;
};

const workHistoryViewChangedId = ref("");
const showWorkHistoryChanged = ref(false);
const onViewChanged = (item: IWorkHistory) => {
  workHistoryViewChangedId.value = item.id;
  showWorkHistoryChanged.value = true;
};

onMounted(() => {});
</script>

<template>
  <a-list item-layout="horizontal" :data-source="workHistory">
    <template #footer>
      <a-tooltip
        v-if="authStore.roles.includes('workHistory-create') && showButtonAdd"
      >
        <template #title>
          {{ $t("button.addWorkHistory") }}
        </template>
        <a-button
          @click="(e: Event) => {onAddItem(); e.preventDefault(); e.stopPropagation()}"
        >
          <div class="flex gap-2 items-center">
            <VIcon :path="iPlusLg" class="text-g-400 dark:text-g-300" />
            <div>
              {{ $t("button.addWorkHistory") }}
            </div>
          </div>
        </a-button>
      </a-tooltip>
    </template>
    <template #renderItem="{ item }">
      <a-list-item>
        <a-list-item-meta>
          <!-- <template #title>
              <button
                type="button"
                class="bg-transparent"
                @click="onViewFinancyOrder(item.order.id)"
              >
                <span class="underline">
                  {{
                    item.order?.number ? "№" + item.order?.number + " - " : ""
                  }}
                  {{ item.order?.name }}
                </span>
              </button>
            </template> -->
          <template #description>
            <div class="flex flex-row items-center leading-4 group">
              <div class="flex-auto">
                <!-- {{ item.workerId }} -->
                <a-tooltip>
                  <template #title>
                    {{ $t("table.financy.viewReport") }}
                  </template>
                  <button
                    type="button"
                    class="bg-transparent leading-4 font-medium text-black dark:text-g-100 group text-left"
                    @click="onViewFinancyOrder(item.order.id)"
                  >
                    <span class="no-underline group-hover:underline">
                      {{
                        item.order?.number
                          ? "№" + item.order?.number + " - "
                          : ""
                      }}
                      {{ item.order?.name }}
                    </span>
                  </button>
                </a-tooltip>

                <div>
                  {{ $t("table.financy.operation") }}:
                  {{ item.operation?.name }}, {{ t("table.financy.object") }}:
                  {{ item.object?.name }}
                </div>
              </div>
              <div class="flex flex-row items-center gap-4">
                <div class="flex flex-row gap-2">
                  <a-tooltip>
                    <template #title>
                      {{ $t("button.edit") }}
                    </template>
                    <a-button
                      type="text"
                      class="invisible group-hover:visible"
                      @click="
                        () => {
                          onEditItem(item);
                        }
                      "
                    >
                      <VIcon :path="iPen" />
                    </a-button>
                  </a-tooltip>

                  <a-tooltip
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
                  </a-tooltip>

                  <a-tooltip>
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
                  </a-tooltip>
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
  <!-- <a-table
    :columns="innerColumns"
    :data-source="workHistory"
    :pagination="false"
  >
    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'object'">
        <p>
          {{ record.object?.name }}
        </p>
      </template>
      <template v-if="column.key === 'order'">
        <a-button type="link" @click="onViewFinancyOrder(record.order.id)">
          <span class="underline">
            №{{ record.order?.number }} - {{ record.order?.name }}
          </span>
        </a-button>
      </template>
      <template v-if="column.key === 'operation'">
        <p>
          {{ record.operation?.name }}
        </p>
      </template>
      <template v-if="column.key === 'time'">
        <TimePretty :time="getObjectTime(record.totalMinutes)" />
      </template>
    </template>
  </a-table> -->

  <a-modal
    v-model:open="openFinancyOrder"
    width="70%"
    style="margin: 0 auto"
    :key="activeFinancyOrder?.id"
    wrapClassName="b-scroll full-modal"
    :bodyStyle="{ margin: 0, padding: 0 }"
    :destroyOnClose="true"
    :maskClosable="false"
    :ok-button-props="{ hidden: true }"
    :cancel-button-props="{ hidden: true }"
    :cancel-text="$t('button.close')"
    @cancel="
      () => {
        activeFinancyOrder = null;
      }
    "
  >
    <template #title>
      <p class="text-xl leading-6 px-4 py-2">
        {{ $t("page.financyOrder.title") }} №{{ activeFinancyOrder?.number }}
        -
        {{ activeFinancyOrder?.name }}
      </p>
    </template>
    <div v-if="activeFinancyOrder" class="">
      <FinancyOrder :order-id="activeFinancyOrder.id" />
    </div>
  </a-modal>

  <a-modal
    v-model:open="showFormWorkHistory"
    :style="{ width: '800px' }"
    :destroyOnClose="true"
    :title="$t('form.workHistory.modalTitle')"
    :maskClosable="false"
    :ok-button-props="{ hidden: true }"
    :cancel-button-props="{ hidden: true }"
  >
    <VFormWorkHistory
      :data="dataForm"
      :default-data="defaultDataForm"
      @callback="
        () => {
          showFormWorkHistory = false;
        }
      "
    />
  </a-modal>

  <a-modal
    v-model:open="showWorkHistoryChanged"
    :style="{ width: '800px' }"
    :destroyOnClose="true"
    :title="$t('modal.changedTitle')"
    :maskClosable="false"
    :ok-button-props="{ hidden: true }"
    :cancel-button-props="{ hidden: true }"
  >
    <FinancyWorkHistoryChanges :work-history-id="workHistoryViewChangedId" />
  </a-modal>
</template>
