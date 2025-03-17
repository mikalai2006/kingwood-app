<script setup lang="ts">
import { create, patch } from "@/api/pay";
import { Rule } from "ant-design-vue/es/form";
import {
  computed,
  onBeforeUnmount,
  reactive,
  ref,
  toRaw,
  UnwrapRef,
} from "vue";
import { useI18n } from "vue-i18n";
import { usePayStore, usePayTemplateStore } from "@/store";
import { IPay, IPayInput } from "@/api/pay/types";
import { iX } from "@/utils/icons";
import { useError } from "@/composable/useError";
import { message } from "ant-design-vue";

const props = defineProps<{
  data: IPayInput;
  defaultData: IPayInput;
}>();
const emit = defineEmits(["callback"]);

const { t } = useI18n();

const payStore = usePayStore();
const payTemplateStore = usePayTemplateStore();

const formState: UnwrapRef<IPayInput> = reactive(props.data);
const formRef = ref();
// const type = ref("");

const rules: Record<string, Rule[]> = {
  name: [
    {
      required: true,
      message: t("form.pay.rule.name"),
      trigger: "change",
    },
    // { min: 3, max: 5, message: "Length should be 3 to 5", trigger: "blur" },
  ],
  total: [
    {
      required: true,
      message: t("form.pay.rule.total"),
      trigger: "change",
    },
    // { min: 3, max: 5, message: "Length should be 3 to 5", trigger: "blur" },
  ],
};

const { onGetValidateError } = useError();

const loading = ref(false);

const onSubmit = async () => {
  loading.value = true;

  await formRef.value
    .validate()
    .then(async () => {
      // console.log("values", formState, toRaw(formState));
      const data = toRaw(formState) as IPay;
      if (data.id) {
        const result = await patch(data.id, data);
        payStore.onAddItemToStore(result);
      } else {
        const result = await create(data);
        payStore.onAddItemToStore(result);
      }
      message.success(t("form.message.successSave"));
      emit("callback");
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

// let lastFetchId = 0;
//   const state = reactive<{ data: IPay[]; value: string; fetching: boolean }>(
//     {
//       data: [],
//       value: "",
//       fetching: false,
//     }
//   );

//   const onSetStateData = (data: IPay[]) => {
//     const _data = data.map((obj) => ({
//       ...obj,
//       label: obj.name,
//       value: obj.id,
//     }));
//     state.data = _data;
//   };

//   const onNormalizeStr = (str: string) => {
//     const _str = str.trim();

//     return String(_str).charAt(0).toUpperCase() + String(_str).slice(1);
//   };

//   const onFetch = debounce((value: string) => {
//     // console.log("fetching pay templates", value);
//     state.value = onNormalizeStr(value);
//     lastFetchId += 1;
//     const fetchId = lastFetchId;
//     state.data = [];
//     state.fetching = true;
//     payStore
//       .find({
//         name: value,
//       })
//       .then((body) => {
//         if (fetchId !== lastFetchId) {
//           // for fetch callback order
//           return;
//         }
//         onSetStateData(body.data);
//       })
//       .finally(() => {
//         state.fetching = false;
//       });
//   }, 300);

interface Option {
  label: string;
}
const filterOption = (input: string, option: Option) => {
  return option.label.toUpperCase().indexOf(input.toUpperCase()) >= 0;
};

const templates = computed(() => {
  return payTemplateStore.items
    .filter((x) => x.enabled)
    .map((x) => {
      return {
        value: x.name,
        label: x.name,
      };
    });
});

const onChangeName = (value: string) => {
  const _payTemplate = payTemplateStore.items.find((x) => x.name == value);
  if (_payTemplate) {
    formState.total = _payTemplate.total;
  } else {
    formState.total = 0;
  }
};

onBeforeUnmount(() => {
  resetForm();
});
</script>
<template>
  <div>
    <!-- {{ JSON.stringify(formState.id) }} -->
    <a-form
      ref="formRef"
      layout="horizontal"
      style="max-width: 600px"
      :model="formState"
      :rules="rules"
    >
      <a-form-item :label="$t('form.pay.name')" name="name">
        <a-auto-complete
          v-model:value="formState.name"
          :options="templates"
          style="width: 100%"
          :placeholder="$t('form.pay.namePlaceholder')"
          :allow-clear="true"
          :filter-option="filterOption"
          :disabled="!!formState.id"
          @change="onChangeName"
        >
          <template #clearIcon>
            <VIcon :path="iX" class="text-2xl leading-3 -mt-1.5 -ml-1.5" />
          </template>
        </a-auto-complete>
        <!-- <a-select
          v-model:value="formState.name"
          style="width: 100%"
          :placeholder="$t('form.order.selectObject')"
          :options="state.data"
          @search="onFetch"
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
        </a-select> -->
      </a-form-item>

      <!-- <a-form-item :label="$t('form.pay.type')" name="type">
        <a-select
          v-model:value="type"
          style="width: 100%"
          :options="[
            { label: 'Приход', value: '+' },
            { label: 'Расход', value: '-' },
          ]"
          :placeholder="$t('form.pay.type')"
        >
        </a-select>
      </a-form-item> -->

      <!-- <a-form-item :label="$t('form.pay.name')" name="name">
        <a-input v-model:value="formState.name" />
      </a-form-item> -->

      <a-form-item :label="$t('form.pay.total')" name="total">
        <a-input-number class="w-full" v-model:value="formState.total" />
      </a-form-item>

      <!-- <a-form-item :label="$t('form.pay.month')" name="month">
        <a-input v-model:value="formState.month" disabled />
      </a-form-item>

      <a-form-item :label="$t('form.pay.year')" name="year">
        <a-input v-model:value="formState.year" disabled />
      </a-form-item> -->
      <!-- <a-form-item label="Activity type" name="type">
        <a-checkbox-group v-model:value="formState.type">
          <a-checkbox value="1" name="type">Online</a-checkbox>
          <a-checkbox value="2" name="type">Promotion</a-checkbox>
          <a-checkbox value="3" name="type">Offline</a-checkbox>
        </a-checkbox-group>
      </a-form-item> -->

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
