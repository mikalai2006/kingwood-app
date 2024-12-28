<script setup lang="ts" async>
import { useUserStore } from "@/store/modules/user";
import { computed, onMounted, reactive, ref } from "vue";
import dayjs from "@/utils/dayjs";
import { useObjectStore, useOrderStore, useTaskStatusStore } from "@/store";
import { IOrder, IOrderInput } from "@/api/order/types";
import { ITask, ITaskInput } from "@/api/task/types";
import OrderTaskList from "@/components/Order/OrderTaskList.vue";
import OrderActiveTask from "@/components/Order/OrderActiveTask.vue";
import { useI18n } from "vue-i18n";
import VIcon from "@/components/UI/VIcon.vue";
import { iPen, iSearch } from "@/utils/icons";
import colors from "tailwindcss/colors";
import { Dayjs } from "dayjs";
import { getShortFIO } from "@/utils/utils";
import { useRoute } from "vue-router";

dayjs.locale("ru");

const route = useRoute();

const { objectId } = route.params;

const userStore = useUserStore();
const orderStore = useOrderStore();
const taskStatusStore = useTaskStatusStore();
const objectStore = useObjectStore();

const { t } = useI18n();

const object = computed(() => objectStore.items.find((x) => x.id === objectId));

const allColumns = ref([
  { key: "number" },
  {
    key: "name",
    sorter: (a: IOrder, b: IOrder) => a.name.localeCompare(b.name),
    customFilterDropdown: true,
    onFilter: (value: string, record: IOrder) =>
      record.name.toLowerCase().indexOf(value.toLowerCase()),
  },
  {
    key: "objectId",
    sorter: (a: IOrder, b: IOrder) => a.objectId.localeCompare(b.objectId),
    customFilterDropdown: true,
    onFilter: (value: string, record: IOrder) =>
      record.objectId.toLowerCase().indexOf(value.toLowerCase()),
  },
  {
    key: "term",
    sorter: (a: IOrder, b: IOrder) => dayjs(a.term).diff(dayjs(b.term)),
  },
  {
    key: "constructorId",
    customFilterDropdown: true,
    onFilter: (value: string, record: IOrder) => {
      const user = userStore.items.find((x) => x.id === record.constructorId);
      return user?.name.indexOf(value) === 0;
    },
  },
  { key: "group" },
  { key: "image" },
  { key: "activeOperation" },
  { key: "createdAt" },
  { key: "updatedAt" },
  { key: "action" },
]);
const optionsForSelect = computed(() =>
  allColumns.value.map((x) => {
    return {
      label: t(`table.order.${x.key}`),
      value: x.key,
    };
  })
);

const columnKeys = ref([
  "number",
  "name",
  "objectId",
  "term",
  "group",
  "activeOperation",
  "action",
]);

const columns = computed(
  () =>
    allColumns.value
      .filter((x) => columnKeys.value.includes(x.key))
      .map((x) => {
        return {
          title: t(`table.order.${x.key}`),
          dataIndex: x.key,
          key: x.key,
          sorter: x.sorter,
          onFilter: x?.onFilter,
          customFilterDropdown: x?.customFilterDropdown,
          // fixed: true
        };
      })
  // {
  //   title: "№",
  //   dataIndex: "number",
  //   key: "number",
  //   fixed: true,
  // },
  // {
  //   title: "name",
  //   dataIndex: "name",
  //   key: "name",
  //   fixed: true,
  // },
  // {
  //   title: "object",
  //   dataIndex: "object",
  //   key: "object",
  //   fixed: false,
  // },
  // // { title: "image", dataIndex: "image", key: "image", fixed: false },
  // {
  //   title: "term",
  //   dataIndex: "term",
  //   key: "term",
  //   fixed: false,
  // },
  // {
  //   title: "constructorId",
  //   dataIndex: "constructorId",
  //   key: "constructorId",
  //   fixed: false,
  // },
  // {
  //   title: "activeOperation",
  //   dataIndex: "activeOperation",
  //   key: "activeOperation",
  //   fixed: false,
  // },
  // // { title: "userId", dataIndex: "userId", key: "userId", fixed: false },
  // {
  //   title: "action",
  //   dataIndex: "action",
  //   key: "action",
  //   fixed: false,
  // },
  // ]
);

const columnsData = computed(() => {
  return orderStore.items
    .filter((x) => x.objectId === objectId)
    .map((x) => {
      const object = objectStore.items.find((y) => y.id === x.objectId);

      return {
        object,
        ...x,
        key: x.id,
      };
    });
});
const defaultData: IOrderInput = {};

const dataForm = ref(defaultData);

const open = ref<boolean>(false);

const showModal = () => {
  open.value = true;
};

const openOrderInfo = ref(false);

const showOrderInfo = (order: IOrder) => {
  openOrderInfo.value = true;
  currentOrderInModal.value = order;
};

const currentOrderInModal = ref<IOrder | null>(null);

const onAddNewItem = () => {
  dataForm.value = defaultData;
  showModal();
};

const onEditItem = (item: IOrder) => {
  console.log("edit order: ", item);

  dataForm.value = item;
  showModal();
};

const openTaskModal = ref(false);

const showTaskModal = () => {
  openTaskModal.value = true;
};

const defaultDataTask: ITaskInput = {};

const dataTaskForm = ref(defaultDataTask);

const onAddNewTask = (orderId: string) => {
  // console.log("orderId: ", orderId);

  const status = taskStatusStore.items.find((x) => x.start);

  dataTaskForm.value = {
    ...defaultDataTask,
    orderId,
  };

  if (status) {
    dataTaskForm.value.statusId = status?.id;
  }

  showTaskModal();
};

const onEditTask = (item: ITask) => {
  console.log("Edit task: ", item);

  dataTaskForm.value = Object.assign({}, item);
  showTaskModal();
};

// const onDeleteTask = (item: ITask) => {
//   console.log("Delete task: ", item);

//   // dataTaskForm.value = Object.assign({}, item);
//   // showTaskModal();

//   return new Promise((resolve) => {
//     setTimeout(() => resolve(true), 3000);
//   });
// };
// const showExpandIcon = (record) => {
//     const { expanded, onExpand } = record;
//     if(expanded){
//         return <DownOutlined onClick={e=>{onExpand(record, e)}}/>
//     }
//     else{
//         return <SomeOtherCustomIcon onClick={e=>{onExpand(record, e)}}
//     }
//   }
const dateFormat = "DD.MM.YYYY";
const rangeSearch = ref<[Dayjs, Dayjs]>([
  dayjs("01.01.2015", dateFormat),
  dayjs("01.01.2015", dateFormat),
]);

const state = reactive({
  searchText: "",
  searchedColumn: "",
});

const searchInput = ref();

const handleSearch = (selectedKeys, confirm, dataIndex) => {
  confirm();
  state.searchText = selectedKeys[0];
  state.searchedColumn = dataIndex;
};

const handleReset = (clearFilters) => {
  clearFilters({ confirm: true });
  state.searchText = "";
};

const activeKey = ref("inwork");

onMounted(async () => {
  await orderStore.find({ $limit: 100, objectIds: [objectId] });
});
</script>
<template>
  <div class="p-4">
    <!-- <VTitle :text="$t('page.order.title')" /> -->
    <a-page-header
      :title="object?.name"
      :sub-title="$t('page.order.title')"
      class="border-b border-s-200 dark:border-g-700"
      @back="
        () => {
          $router.back();
        }
      "
    />
    <div class="flex flex-row items-center">
      <div class="flex-auto">
        <a-button type="primary" @click="onAddNewItem">{{
          $t("form.add")
        }}</a-button>
      </div>
      <div>
        <a-range-picker v-model:value="rangeSearch" :format="dateFormat" />
      </div>
      <div class="flex gap-2">
        <span class="whitespace-nowrap">
          {{ $t("table.order.fields") }}
        </span>
        <a-select
          v-model:value="columnKeys"
          mode="multiple"
          style="width: 100%; min-width: 200px"
          :placeholder="$t('table.order.fields')"
          :max-tag-count="3"
          :removeIcon="null"
          :options="optionsForSelect"
        >
          <template #maxTagPlaceholder="omittedValues">
            <span style="color: red">+ {{ omittedValues.length }} ...</span>
          </template>
          <!-- <template #option="{ value, label }">
            {{ label }}
          </template> -->
          <!-- <a-select-option
            v-for="col in columns"
            :value="col.key"
            :label="$t(`tabs.order.${col.key}`)"
          >
            <span role="img" aria-label="Japan">🇯🇵</span>
            {{ $t(`tabs.order.${col.key}`) }}
          </a-select-option> -->
        </a-select>
      </div>
    </div>

    <a-tabs v-model:activeKey="activeKey">
      <a-tab-pane key="inwork" :tab="$t('tabs.order.inwork')" force-render>
        <!-- :row-class-name="(_record: IOrder, index: number) => (_record.priority ? 'custom cursor-pointer bg-red-500/50' : 'cursor-pointer')"
        :row-class-name="(_record: IOrder, index: number) => (_record.priority ? 'cursor-pointer font-medium text-red-500 dark:text-red-300' : 'cursor-pointer')" 
        -->
        <a-table
          :columns="columns"
          :data-source="columnsData"
          expandRowByClick
          size="middle"
          rowClassName="cursor-pointer"
          :row-class-name="(_record: IOrder, index: number) => (_record.group?.includes('create_complete') ? 'custom priority cursor-pointer bg-green-500/40 hover:!bg-green-500/50' : _record.priority ? 'custom priority cursor-pointer bg-red-500/30 hover:!bg-red-500/40' :  'cursor-pointer')"
          :customRow="
            (record: IOrder) => {
              return {
                // xxx, // props
                onClick: () => {
                  showOrderInfo(record)
                }, // click row
                // onDblclick: (event) => {}, // double click row
                // onContextmenu: (event) => {}  // right button click row
                // onMouseenter: (event) => {}   // mouse enter row
                // onMouseleave: (event) => {}   // mouse leave row
              };
            }
          "
        >
          <template #bodyCell="{ column, record }">
            <!-- <template v-if="record"></template> -->
            <template v-if="column.key === 'action'">
              <a-tooltip>
                <template #title>
                  {{ $t("button.edit") }}
                </template>
                <a-button
                  type="link"
                  @click="(e: Event) => {onEditItem(record); e.preventDefault(); e.stopPropagation()}"
                >
                  <VIcon :path="iPen" class="text-s-400 dark:text-g-300" />
                </a-button>
              </a-tooltip>
            </template>
            <!-- <template v-if="column.key === 'name'">
              <div>
                {{ record.name }}
              </div>
            </template> -->
            <template v-if="column.key === 'image'">
              <a-avatar
                class="bg-s-500 dark:bg-s-800 border-0"
                src="https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png"
              />
            </template>
            <template v-if="column.key === 'group'">
              <a-tag
                v-for="item in record.group"
                :key="item"
                :bordered="false"
                class="text-md"
              >
                {{ $t(`groupOperation.${item}`) }}
              </a-tag>
            </template>
            <template v-if="column.key === 'constructorId'">
              <p class="text-nowrap">
                {{
                  getShortFIO(
                    userStore.items.find((x) => x.id === record.constructorId)
                      ?.name
                  )
                }}
              </p>
            </template>
            <template v-if="column.key === 'activeOperation'">
              <OrderActiveTask :order-id="record.id" />
              <!-- <OrderGroupInfo :order-id="record.id" /> -->
            </template>
            <template v-if="column.key === 'objectId'">
              {{ record.object?.name }}
            </template>
            <template v-if="column.key === 'term'">
              <div>
                {{ dayjs().to(record.term) }}
              </div>

              <a-tag
                v-if="record.priority"
                :bordered="false"
                :color="colors.red[500]"
              >
                {{ $t("table.order.priority") }}
              </a-tag>
            </template>
            <template v-if="column.key === 'createdAt'">
              {{ dayjs(record.updatedAt).format("DD MMM YYYY") }}
              {{ dayjs(record.updatedAt).fromNow() }}
            </template>
            <!-- <template v-if="column.key === 'name'">
          <a-tag :color="record.color">{{ record.name }}</a-tag>
        </template> -->
          </template>

          <template
            #customFilterDropdown="{
              setSelectedKeys,
              selectedKeys,
              confirm,
              clearFilters,
              column,
            }"
          >
            <div style="padding: 8px">
              <a-input
                ref="searchInput"
                :placeholder="`Search ${column.dataIndex}`"
                :value="selectedKeys[0]"
                style="width: 188px; margin-bottom: 8px; display: block"
                @change="
                  (e: any) => setSelectedKeys(e.target.value ? [e.target.value] : [])
                "
                @pressEnter="
                  handleSearch(selectedKeys, confirm, column.dataIndex)
                "
              />
              <a-button
                type="primary"
                size="small"
                style="width: 90px; margin-right: 8px"
                @click="handleSearch(selectedKeys, confirm, column.dataIndex)"
              >
                <template #icon>
                  <VIcon :path="iSearch" />
                </template>
                Search
              </a-button>
              <a-button
                size="small"
                style="width: 90px"
                @click="handleReset(clearFilters)"
              >
                Reset
              </a-button>
            </div>
          </template>
          <template #customFilterIcon="{ filtered }">
            <VIcon
              :path="iSearch"
              :style="{ color: filtered ? '#108ee9' : undefined }"
            />
          </template>

          <!-- <template #expandIcon="{ onExpand, record, expanded }">
            <DownOutlined
              :class="['transition-transform ', expanded ? 'rotate-180' : '']"
              @click="onExpand(record)"
            />
          </template>
          <template
            #expandedRowRender="{ record }"
            v-slot:expandIcon="DownOutlined"
          >
            <div class="-mt-4 -ml-4 pl-4 py-4">
              <OrderTaskList :order-id="record.id" @on-edit-task="onEditTask" />
              <a-button @click="onAddNewTask(record.id)" class="mt-2">
                {{ $t("form.task.add") }}
              </a-button>
            </div>
          </template>
          <template #expandColumnTitle>
            <span style="color: red">More</span>
          </template> -->
        </a-table>
      </a-tab-pane>
      <a-tab-pane key="future" :tab="$t('tabs.order.future')">
        Content of Tab Pane 2
      </a-tab-pane>
      <a-tab-pane key="completed" :tab="$t('tabs.order.completed')">
        Content of Tab Pane 3
      </a-tab-pane>
    </a-tabs>
  </div>

  <a-modal
    v-model:open="openTaskModal"
    :destroyOnClose="true"
    :key="dataTaskForm.id"
    :title="dataTaskForm.id ? $t('form.task.edit') : $t('form.task.new')"
    :ok-button-props="{ hidden: true }"
    :cancel-button-props="{ hidden: true }"
  >
    <VFormTask
      :data="dataTaskForm"
      :default-data="defaultDataTask"
      @callback="
        () => {
          openTaskModal = false;
        }
      "
    />
  </a-modal>

  <a-modal
    v-model:open="open"
    :destroyOnClose="true"
    :key="dataForm.id"
    :title="dataForm.id ? $t('form.order.edit') : $t('form.order.new')"
    :ok-button-props="{ hidden: true }"
    :cancel-button-props="{ hidden: true }"
  >
    <VFormOrder
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
    v-model:open="openOrderInfo"
    width="1000px"
    :key="currentOrderInModal?.id"
    @ok=""
  >
    <template #title>
      <p class="text-xl">
        {{ currentOrderInModal?.name }}
      </p>
    </template>
    <div v-if="currentOrderInModal" class="-mt-4 -ml-4 pl-4 py-4">
      <OrderTaskList
        :order-id="currentOrderInModal.id"
        @on-edit-task="onEditTask"
      />
      <a-button @click="onAddNewTask(currentOrderInModal.id)" class="mt-2">
        {{ $t("form.task.add") }}
      </a-button>
    </div>
  </a-modal>
</template>
