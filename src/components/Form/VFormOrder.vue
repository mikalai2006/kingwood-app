<script setup lang="ts">
import { create, patch } from "@/api/order";
import { Rule } from "ant-design-vue/es/form";
import {
  computed,
  defineComponent,
  onMounted,
  reactive,
  ref,
  toRaw,
  UnwrapRef,
  watch,
} from "vue";
import { useI18n } from "vue-i18n";
import { useObjectStore, useOrderStore, useUserStore } from "@/store";
import { IOrder } from "@/api/order/types";
import VIcon from "../UI/VIcon.vue";
import { iSearch } from "@/utils/icons";
import { message } from "ant-design-vue";
import { debounce } from "lodash-es";
import { IObject } from "@/api/object/types";
import { dateFormat } from "@/utils/date";

const props = defineProps<{ data: IOrder; defaultData: IOrder }>();
const emit = defineEmits(["callback"]);

const { t } = useI18n();

const orderStore = useOrderStore();
const userStore = useUserStore();
const objectStore = useObjectStore();

const queryNameObject = ref("");
const objects = computed(() =>
  objectStore.items
    .filter(
      (x) =>
        x.name.toLowerCase().indexOf(queryNameObject.value?.toLowerCase()) > -1
    )
    .map((x) => {
      return {
        ...x,
        label: x.name,
        value: x.id,
      };
    })
);

const formState: UnwrapRef<IOrder> = reactive(props.data);
const formRef = ref();

const rules: Record<string, Rule[]> = {
  name: [
    {
      required: true,
      message: t("form.order.rule.name"),
      trigger: "change",
    },
    // { min: 3, max: 5, message: "Length should be 3 to 5", trigger: "blur" },
  ],
  objectId: [
    {
      required: true,
      message: t("form.order.rule.objectId"),
      trigger: "change",
    },
    // { min: 3, max: 5, message: "Length should be 3 to 5", trigger: "blur" },
  ],
  // code: [
  //   {
  //     required: true,
  //     message: "Please input Activity name",
  //     trigger: "change",
  //   },
  //   { min: 3, max: 5, message: "Length should be 3 to 5", trigger: "blur" },
  // ],
};

const onSubmit = async () => {
  await formRef.value
    .validate()
    .then(async () => {
      // console.log("values", formState, toRaw(formState));
      const data = toRaw(formState) as IOrder;
      data.term = new Date(data.term).toISOString();
      if (data.id) {
        const result = await patch(data.id, data);
        orderStore.onAddItemToStore(result);
      } else {
        const result = await create(data);
        orderStore.onAddItemToStore(result);
      }
      emit("callback");
    })
    .catch((error: Error) => {
      console.log("error", error);
    });
};
const resetForm = () => {
  formRef.value.resetFields();
};

const constructors = computed(() => {
  return userStore.items
    .filter((x) => x.postObject.name === "Конструктор")
    .map((x) => {
      return {
        value: x.id,
        label: x.name,
      };
    });
});

const orderGroups = computed(() => {
  return ["0", "1", "2", "3", "4", "5", "10"].map((x) => {
    return {
      value: x,
      label: t(`groupOperation.${x}`),
    };
  });
});

const orderStatuses = computed(() => {
  return [0, 1, 2, 3, 4, 5, 100].map((x) => {
    return {
      value: x,
      label: t(`orderStatus.${x}`),
    };
  });
});
// const loading = ref(false);

// const onFindObjects = async () => {
//   try {
//     loading.value = true;

//     await objectStore
//       .find({
//         name: queryObject.value,
//       })
//       .finally(() => {
//         setTimeout(() => {
//           loading.value = false;
//         }, 1000);
//       });
//   } catch (e) {
//     message.error("Form order error: ", e);
//   }
// };
let lastFetchId = 0;
const state = reactive<{ data: IObject[]; value: string; fetching: boolean }>({
  data: [],
  value: "",
  fetching: false,
});

onMounted(() => {
  const object = objectStore.items.find((x) => x.id === formState.objectId);
  object?.name && fetchObjects(object?.name);
});

const fetchObjects = debounce((value: string) => {
  console.log("fetching objects", value);
  state.value = value;
  lastFetchId += 1;
  const fetchId = lastFetchId;
  state.data = [];
  state.fetching = true;
  objectStore
    .find({
      name: value,
    })
    .then((body) => {
      if (fetchId !== lastFetchId) {
        // for fetch callback order
        return;
      }
      const data = body.data.map((obj) => ({
        ...obj,
        label: obj.name,
        value: obj.id,
      }));
      state.data = data;
    })
    .finally(() => {
      state.fetching = false;
    });
}, 300);

// watch(
//   () => state.value,
//   () => {
//     state.data = [];
//     state.fetching = false;
//   }
// );

// const VNodes = defineComponent({
//   props: {
//     vnodes: {
//       type: Object,
//       required: true,
//     },
//   },
//   render() {
//     return this.vnodes;
//   },
// });
</script>
<template>
  <div>
    <a-form
      ref="formRef"
      layout="horizontal"
      style="max-width: 600px"
      :model="formState"
      :rules="rules"
    >
      <!-- <a-form-item ref="object" :label="$t('form.order.object')" name="object">
        <a-input v-model:value="formState.object" />
      </a-form-item> -->
      <a-form-item :label="$t('form.order.objectId')" name="objectId">
        <a-select
          v-model:value="formState.objectId"
          style="width: 100%"
          :placeholder="$t('form.order.selectObject')"
          :options="state.data"
          @search="fetchObjects"
          :show-search="true"
          :filter-option="false"
          :not-found-content="state.fetching ? undefined : null"
        >
          <template v-if="state.fetching" #notFoundContent>
            <a-spin size="small" />
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

      <a-form-item ref="name" :label="$t('form.order.name')" name="name">
        <a-textarea
          v-model:value="formState.name"
          :auto-size="{ minRows: 2, maxRows: 5 }"
        />
      </a-form-item>

      <a-form-item
        ref="description"
        :label="$t('form.order.description')"
        name="description"
      >
        <a-textarea
          v-model:value="formState.description"
          :auto-size="{ minRows: 2, maxRows: 5 }"
        />
      </a-form-item>

      <a-form-item :label="$t('form.order.constructorId')" name="color">
        <a-select
          v-model:value="formState.constructorId"
          style="width: 100%"
          :placeholder="$t('form.order.selectConstructor')"
          :options="[
            {
              value: '000000000000000000000000',
              label: 'Без конструктора',
            },
            ...constructors,
          ]"
        ></a-select>
      </a-form-item>

      <a-form-item :label="$t('form.order.group')" name="group">
        <a-select
          v-model:value="formState.group"
          style="width: 100%"
          :placeholder="$t('form.order.selectGroup')"
          :options="orderGroups"
          mode="tags"
        ></a-select>
      </a-form-item>

      <a-form-item :label="$t('form.order.status')" name="status">
        <a-select
          v-model:value="formState.status"
          style="width: 100%"
          :placeholder="$t('form.order.selectStatus')"
          :options="orderStatuses"
        ></a-select>
      </a-form-item>

      <!-- <a-form-item :label="$t('form.post.color')" name="color">
        <a-select
          v-model:value="formState.color"
          style="width: 100%"
          :placeholder="$t('form.user.selectRole')"
          :options="colorsList"
        ></a-select>
      </a-form-item> -->
      <!-- <a-form-item label="Activity type" name="type">
        <a-checkbox-group v-model:value="formState.type">
          <a-checkbox value="1" name="type">Online</a-checkbox>
          <a-checkbox value="2" name="type">Promotion</a-checkbox>
          <a-checkbox value="3" name="type">Offline</a-checkbox>
        </a-checkbox-group>
      </a-form-item> -->

      <a-form-item :label="$t('form.order.term')" name="term">
        <a-date-picker
          v-model:value="formState.term"
          :format="dateFormat"
          value-format="YYYY-MM-DD"
          style="width: 100%"
          :placeholder="$t('form.order.selectTerm')"
        />
      </a-form-item>
      <!-- <a-form-item :label="$t('form.order.termMontaj')" name="termMontaj">
        <a-date-picker
          v-model:value="formState.termMontaj"
          :format="dateFormat"
          value-format="YYYY-MM-DD"
          style="width: 100%"
          :placeholder="$t('form.order.selectTermMontaj')"
        />
      </a-form-item> -->

      <a-form-item :label="$t('form.order.priority')" name="priority">
        <a-switch
          v-model:checked="formState.priority"
          :checkedValue="1"
          :unCheckedValue="0"
        />
      </a-form-item>

      <a-form-item :wrapper-col="{ span: 14, offset: 4 }">
        <a-button v-if="!formState?.id" @click="resetForm">
          {{ $t("form.reset") }}
        </a-button>
        <a-button type="primary" style="margin-left: 10px" @click="onSubmit">
          {{ !formState?.id ? $t("form.create") : $t("form.save") }}
        </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<style scoped></style>
