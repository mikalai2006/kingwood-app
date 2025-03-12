import { reactive } from "vue";

import { debounce } from "lodash-es";
import {
  useOperationStore,
  useTaskStatusStore,
  useTaskWorkerStore,
  useUserStore,
} from "@/store";
import dayjs from "@/utils/dayjs";
import { useI18n } from "vue-i18n";
import { ITaskWorker } from "@/api/task_worker/types";
import { getObjectId } from "@/utils/utils";

const useTaskWorker = () => {
  const { t } = useI18n();

  const taskStatusStore = useTaskStatusStore();
  const userStore = useUserStore();
  const taskWorkerStore = useTaskWorkerStore();
  const operationStore = useOperationStore();

  let lastFetchId = 0;
  const state = reactive<{
    data: ITaskWorker[];
    value: string;
    fetching: boolean;
  }>({
    data: [],
    value: "",
    fetching: false,
  });

  const onSetStateData = (data: ITaskWorker[]) => {
    const fakeData = taskWorkerStore.items
      .filter((x) => getObjectId(x.id) == "0")
      .filter((x) =>
        x.order.name.toLocaleLowerCase().includes(state.value.toLowerCase())
      );

    data = [...(data || []), ...(fakeData || [])];

    const _data =
      data.length > 0
        ? data.map((x) => {
            const operation = operationStore.items.find(
              (ope) => ope.id === x.operationId
            );

            return {
              ...x,
              label: x.order.name,
              value: x.id,
              operation,
            };
          })
        : [];
    state.data = _data.sort((a, b) => a.order.number - b.order.number);
  };

  const onNormalizeStr = (str: string) => {
    const _str = str.trim();

    return String(_str).charAt(0).toUpperCase() + String(_str).slice(1);
  };

  const onFetch = debounce((value: string, workerId: string) => {
    // if (!value) {
    //   return;
    // }

    // console.log("fetching orders", value);
    state.value = onNormalizeStr(value);
    lastFetchId += 1;
    const fetchId = lastFetchId;
    state.data = [];
    state.fetching = true;
    taskWorkerStore
      .find({
        query: value,
        workerId: [workerId],
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
    state,
    onFetch,
    onSetStateData,
  };
};

export default useTaskWorker;
