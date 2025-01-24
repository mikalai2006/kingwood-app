import { computed, reactive, ref } from "vue";

import { message } from "ant-design-vue";
import { debounce } from "lodash-es";
import { IOrder, IOrderInput } from "@/api/order/types";
import { ITask, ITaskInput } from "@/api/task/types";
import { useOrderStore, useTaskStatusStore, useUserStore } from "@/store";
import dayjs from "@/utils/dayjs";
import { useI18n } from "vue-i18n";

const useOrder = () => {
  const { t } = useI18n();

  const taskStatusStore = useTaskStatusStore();
  const userStore = useUserStore();
  const orderStore = useOrderStore();

  const openOtgruzka = ref<boolean>(false);

  const showModalOtgruzka = () => {
    openOtgruzka.value = true;
  };

  const defaultDataOtgruzka: IOrderInput = {};

  const dataFormOtgruzka = ref(defaultDataOtgruzka);

  const onOtgruzka = (order: IOrder) => {
    dataFormOtgruzka.value = Object.assign({}, defaultDataOtgruzka, order);
    showModalOtgruzka();
  };

  const sort = ref([{ field: "number", order: 1, key: "number" }]);

  // dateStart
  const openDateStart = ref<boolean>(false);

  const showModalDateStart = () => {
    openDateStart.value = true;
  };

  const defaultDateStart: IOrderInput = {};

  const dateFormStart = ref(defaultDateStart);

  const onDateStart = (order: IOrder) => {
    dateFormStart.value = Object.assign({}, defaultDateStart, order);
    showModalDateStart();
  };

  // general
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
    dataForm.value = Object.assign({}, defaultData);
    showModal();
  };

  const onEditItem = (item: IOrder) => {
    console.log("edit order: ", item);

    dataForm.value = Object.assign({}, item);
    showModal();
  };

  const openTaskModal = ref(false);

  const showTaskModal = () => {
    openTaskModal.value = true;
  };

  const defaultDataTask: ITaskInput = {};

  const dataTaskForm = ref(defaultDataTask);

  const onAddNewTask = (order: IOrder) => {
    // console.log("orderId: ", orderId);

    const status = taskStatusStore.items.find((x) => x.status === "wait");

    dataTaskForm.value = {
      ...defaultDataTask,
      orderId: order.id,
      objectId: order.objectId,
    };

    if (status) {
      dataTaskForm.value.statusId = status?.id;
    }

    showTaskModal();
  };

  const onEditTask = (item: ITask) => {
    console.log("Edit task: ", item);

    dataTaskForm.value = Object.assign({}, item, {
      objectId: currentOrderInModal.value?.objectId,
    });
    // console.log("Edit task2: ", dataTaskForm.value);
    showTaskModal();
  };

  const onSetColumns = (value: string, key: string, data: string[]) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  const allColumns = ref([
    { key: "number", sorter: (a: IOrder, b: IOrder) => a.number - b.number },
    {
      key: "objectId",
      sorter: (a: IOrder, b: IOrder) =>
        a.object && b.object ? a.object?.name.localeCompare(b.object?.name) : 0,
      // customFilterDropdown: true,
      // onFilter: (value: string, record: IOrder) =>
      //   record.objectId.toLowerCase().indexOf(value.toLowerCase()),
    },
    {
      key: "name",
      sorter: (a: IOrder, b: IOrder) => a.name.localeCompare(b.name),
      // defaultSortOrder: "descend" as const,
      // customFilterDropdown: true,
      // onFilter: (value: string, record: IOrder) =>
      //   record.name.toLowerCase().indexOf(value.toLowerCase()),
    },
    {
      key: "term",
      sorter: (a: IOrder, b: IOrder) => dayjs(a.term).diff(dayjs(b.term)),
    },
    {
      key: "constructorId",
      // customFilterDropdown: true,
      onFilter: (value: string, record: IOrder) => {
        const user = userStore.items.find((x) => x.id === record.constructorId);
        return user?.name.indexOf(value) === 0;
      },
    },
    { key: "group" },
    { key: "image" },
    { key: "dateStart" },
    { key: "activeOperation" },
    { key: "stolyarComplete" },
    { key: "shlifComplete" },
    { key: "malyarComplete" },
    { key: "goComplete" },
    { key: "montajComplete" },
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
    "objectId",
    "name",
    "term",
    "group",
    // "activeOperation",
    "action",
  ]);

  const columns = computed(
    () =>
      allColumns.value
        .filter((x) => columnKeys.value.includes(x.key))
        .map((x) => {
          const isExistSort = sort.value.find((y) => y.key === x.key);
          // isExistSort && console.log("isExistSort: ", x.key, isExistSort, sort);

          return {
            title: t(`table.order.${x.key}`),
            dataIndex: x.key,
            key: x.key,
            sorter: x.sorter,
            onFilter: x?.onFilter,
            sortOrder: isExistSort
              ? isExistSort.order === -1
                ? "descend"
                : "ascend"
              : null,
            // customFilterDropdown: x?.customFilterDropdown,
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

  let lastFetchId = 0;
  const state = reactive<{ data: IOrder[]; value: string; fetching: boolean }>({
    data: [],
    value: "",
    fetching: false,
  });

  const onSetStateData = (data: IOrder[]) => {
    const _data = data.map((x) => ({
      ...x,
      label: x.name,
      value: x.id,
    }));
    state.data = _data;
  };

  const onNormalizeStr = (str: string) => {
    const _str = str.trim();

    return String(_str).charAt(0).toUpperCase() + String(_str).slice(1);
  };

  const onFetchOrders = debounce((value: string) => {
    console.log("fetching orders", value);
    state.value = onNormalizeStr(value);
    lastFetchId += 1;
    const fetchId = lastFetchId;
    state.data = [];
    state.fetching = true;
    orderStore
      .find({
        name: value,
      })
      .then((body) => {
        if (fetchId !== lastFetchId) {
          // for fetch callback order
          return;
        }
        onSetStateData(body.data);
      })
      .finally(() => {
        state.fetching = false;
      });
  }, 300);

  return {
    sort,

    openOtgruzka,
    dataFormOtgruzka,
    defaultDataOtgruzka,
    showModalOtgruzka,
    onOtgruzka,
    defaultData,
    dataForm,
    open,

    openOrderInfo,
    showOrderInfo,
    currentOrderInModal,
    onAddNewItem,
    onEditItem,

    dataTaskForm,
    defaultDataTask,
    openTaskModal,
    showTaskModal,
    onAddNewTask,
    onEditTask,

    onSetColumns,
    allColumns,
    optionsForSelect,
    columnKeys,
    columns,

    openDateStart,
    defaultDateStart,
    dateFormStart,
    onDateStart,

    state,
    onFetchOrders,
  };
};

export default useOrder;
