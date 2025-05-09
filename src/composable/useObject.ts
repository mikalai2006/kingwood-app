import { reactive } from "vue";

import { IObject } from "@/api/object/types";
import { create as createObject } from "@/api/object";
import { useObjectStore } from "@/store";
import { message } from "ant-design-vue";
import { debounce } from "lodash-es";
import { useI18n } from "vue-i18n";
import { useError } from "./useError";

const useObject = () => {
  const { t } = useI18n();

  const { onGetValidateError, onShowError } = useError();

  const objectStore = useObjectStore();

  let lastFetchId = 0;
  const state = reactive<{ data: IObject[]; value: string; fetching: boolean }>(
    {
      data: [],
      value: "",
      fetching: false,
    }
  );

  const onSetStateData = (data: IObject[]) => {
    const _data = data.map((obj) => ({
      ...obj,
      label: obj.name,
      value: obj.id,
    }));
    state.data = _data;
  };

  const onNormalizeStr = (str: string) => {
    const _str = str.trim();

    return String(_str).charAt(0).toUpperCase() + String(_str).slice(1);
  };

  const onFetchObjects = debounce(async (value: string) => {
    // console.log("fetching objects", value);
    state.value = onNormalizeStr(value);
    lastFetchId += 1;
    const fetchId = lastFetchId;
    state.data = [];
    state.fetching = true;
    const body = await objectStore
      .find({
        name: value,
      })
      .then((_body) => {
        if (fetchId !== lastFetchId) {
          // for fetch callback order
          return;
        }
        onSetStateData(_body.data);
        return _body;
      })
      .finally(() => {
        state.fetching = false;
      });

    // setTimeout(() => {
    //   if (fetchId !== lastFetchId) {
    //     // for fetch callback order
    //     return;
    //   }

    //   body?.data && onSetStateData(body.data);

    //   state.fetching = false;
    // }, 500);
  }, 300);

  const onCreateObject = async (callback: (result: IObject) => void) => {
    try {
      state.fetching = true;
      const result = await createObject({ name: state.value });

      state.value = "";
      state.data = [];

      objectStore.onAddItemToStore(result);

      // formState.objectId = result.id;
      callback(result);
      message.success(t("form.object.successAdd"));
    } catch (error: any) {
      let err = "";
      if (error?.errorFields) {
        err = onGetValidateError(error);
      } else {
        err = error.message;
      }
      onShowError(err);
    } finally {
      state.fetching = false;
    }
  };

  return {
    onCreateObject,
    onFetchObjects,
    state,
    onSetStateData,
  };
};

export default useObject;
