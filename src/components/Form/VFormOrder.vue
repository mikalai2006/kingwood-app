<script setup lang="ts">
import { create, patch } from "@/api/order";
import { Rule } from "ant-design-vue/es/form";
import {
  computed,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  toRaw,
  UnwrapRef,
} from "vue";
import { useI18n } from "vue-i18n";
import {
  useGeneralStore,
  useObjectStore,
  useOrderStore,
  useUserStore,
} from "@/store";
import { IOrder } from "@/api/order/types";
import { dateFormat } from "@/utils/date";
import { message } from "ant-design-vue";
import { useError } from "@/composable/useError";
import { Dayjs } from "dayjs";
import dayjs from "@/utils/dayjs";
import { Colors } from "@/utils/colors";
import VObject from "../V/VObject.vue";

const props = defineProps<{ data: IOrder; defaultData: IOrder }>();
const emit = defineEmits(["callback"]);

const { t } = useI18n();

const orderStore = useOrderStore();
const userStore = useUserStore();
const objectStore = useObjectStore();
const generalStore = useGeneralStore();

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
  constructorId: [
    {
      required: true,
      message: t("form.order.rule.constructorId"),
      trigger: "change",
    },
    // { min: 3, max: 5, message: "Length should be 3 to 5", trigger: "blur" },
  ],
  // term: [
  //   {
  //     required: true,
  //     message: t("form.order.rule.term"),
  //     trigger: "change",
  //   },
  //   // { min: 3, max: 5, message: "Length should be 3 to 5", trigger: "blur" },
  // ],
};

const { onGetValidateError, onShowError } = useError();

const loading = ref(false);

const onSubmit = async () => {
  loading.value = true;

  await formRef.value
    .validate()
    .then(async () => {
      // console.log("values", formState, toRaw(formState));
      const data = toRaw(formState) as IOrder;
      if (data.term) {
        data.term = new Date(data.term).toISOString();
      }
      if (data.dateStart) {
        data.dateStart = new Date(data.dateStart).toISOString();
      }
      if (data.id) {
        const result = await patch(data.id, data);
        orderStore.onAddItemToStore(result);
      } else {
        // add year.
        if (year.value) {
          data.year = year.value.year();
        }

        if (data.dateStart) {
          data.dateStart = new Date(data.dateStart).toISOString();
        }
        const result = await create(data);
        orderStore.onAddItemToStore(result);
      }
      emit("callback");
      message.success(t("form.order.successAdd"));
      resetForm();
    })
    .catch((error: any) => {
      if (error?.errorFields) {
        onGetValidateError(error);
      } else {
        throw new Error(JSON.stringify(error));
      }
    })
    .finally(() => {
      loading.value = false;
    });
};
const resetForm = () => {
  formRef.value?.resetFields();
};

const constructors = computed(() => {
  return userStore.items
    .filter(
      (x) =>
        x.postObject.name === "Конструктор" || x.postObject.name === "Директор"
    )
    .map((x) => {
      return {
        value: x.id,
        label: x.name,
      };
    });
});

// const orderGroups = computed(() => {
//   return ["0", "1", "2", "3", "4", "5", "6", "10"].map((x) => {
//     return {
//       value: x,
//       label: t(`groupOperation.${x}`),
//     };
//   });
// });

const orderStatuses = computed(() => {
  return [0, 1, 100].map((x) => {
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

// const { onCreateObject, onFetchObjects, state } = useObject();

const year = ref<Dayjs>(dayjs(new Date()));

onMounted(() => {
  // const object = objectStore.items.find((x) => x.id === formState.objectId);
  // object?.name && onFetchObjects(object?.name);

  if (formState.year) {
    year.value = dayjs().year(formState.year);
  }

  if (dayjs(formState.dateStart).year() == 1) {
    formState.dateStart = "";
  } else {
    formState.dateStart = dayjs(formState.dateStart).add(0, "day").format();
  }
});

onBeforeUnmount(() => {
  resetForm();
});
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
const showMore = ref(0);
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

      <a-form-item
        v-if="formState.number"
        ref="number"
        :label="$t('form.order.number')"
        name="number"
      >
        <a-input v-model:value="formState.number" :disabled="true" />
      </a-form-item>

      <VObject v-model="formState.objectId" />

      <!-- <a-form-item :label="$t('form.order.objectId')" name="objectId">
        <a-select
          v-model:value="formState.objectId"
          style="width: 100%"
          :placeholder="$t('form.order.selectObject')"
          :options="state.data"
          @search="onFetchObjects"
          :show-search="true"
          :filter-option="false"
          :not-found-content="state.value ? undefined : null"
        >
          <template v-if="state.value" #notFoundContent>
            <div class="flex">
              <div>
                <p>{{ $t("form.object.notfound") }}: {{ state.value }}</p>
                <a-button
                  type="primary"
                  @click="
                    () =>
                      onCreateObject((result) => {
                        formState.objectId = result.id;
                      })
                  "
                >
                  {{ $t("form.object.add") }} {{ state.value }}
                </a-button>
              </div>
              <a-spin v-if="state.fetching" size="small" />
            </div>
          </template>
        </a-select>
      </a-form-item> -->

      <a-form-item :label="$t('form.order.constructorId')" name="constructorId">
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

      <!-- <a-form-item :label="$t('form.order.group')" name="group">
        <a-select
          v-model:value="formState.group"
          style="width: 100%"
          :placeholder="$t('form.order.selectGroup')"
          :options="orderGroups"
          mode="tags"
        ></a-select>
      </a-form-item> -->

      <a-form-item
        v-if="formState.status"
        :label="$t('form.order.status')"
        name="status"
      >
        <a-select
          v-model:value="formState.status"
          style="width: 100%"
          :placeholder="$t('form.order.selectStatus')"
          :options="orderStatuses"
          :disabled="true"
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

      <a-form-item :label="$t('form.order.dateStart')" name="dateStart">
        <a-date-picker
          v-model:value="formState.dateStart"
          :format="dateFormat"
          value-format="YYYY-MM-DD"
          style="width: 100%"
          :placeholder="$t('form.selectDate')"
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

      <a-collapse
        v-if="!formState?.id"
        v-model:activeKey="showMore"
        :bordered="false"
        :style="{
          background:
            generalStore.themeMode === 'dark' ? Colors.g[700] : Colors.s[100],
          'margin-bottom': '15px',
        }"
      >
        <a-collapse-panel key="1" :header="t('button.moreFields')">
          <a-tooltip color="#108ee9" :title="$t('info.helpMoreOrderYear')">
            <a-form-item
              :label="$t('form.order.year')"
              name="year"
              class="pb-4"
            >
              <!-- <template #help>
                <a-alert :message="$t('info.helpMoreOrderYear')" banner />
              </template> -->
              <a-date-picker v-model:value="year" picker="year" />
              <!-- <a-input v-model:value="formState.number" :disabled="true" /> -->
            </a-form-item>
          </a-tooltip>
          <a-tooltip color="#108ee9" :title="$t('info.helpMoreOrderNumber')">
            <a-form-item :label="$t('form.order.number')" name="number">
              <!-- <template #help>
              <a-alert :message="$t('info.helpMoreOrderNumber')" banner />
            </template> -->
              <a-input-number v-model:value="formState.number" />
            </a-form-item>
          </a-tooltip>
        </a-collapse-panel>
      </a-collapse>

      <a-form-item :wrapper-col="{ span: 14, offset: 4 }">
        <a-button v-if="!formState?.id" :disabled="loading" @click="resetForm">
          {{ $t("form.reset") }}
        </a-button>
        <a-button
          type="primary"
          :disabled="loading"
          :loading="loading"
          style="margin-left: 10px"
          @click="onSubmit"
        >
          {{ !formState?.id ? $t("form.create") : $t("form.save") }}
        </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<style scoped></style>
