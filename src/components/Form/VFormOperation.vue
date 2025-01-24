<script setup lang="ts">
import { create, patch } from "@/api/operation";
import { Rule } from "ant-design-vue/es/form";
import { computed, reactive, ref, toRaw, UnwrapRef } from "vue";
import { useI18n } from "vue-i18n";
import { useAuthStore, useOperationStore } from "@/store";
import type { IOperation } from "@/api/operation/types";
import { useError } from "@/composable/useError";
import { message } from "ant-design-vue";

const props = defineProps<{ data: IOperation; defaultData: IOperation }>();
const emit = defineEmits(["callback"]);

const { t } = useI18n();

const operationStore = useOperationStore();
const authStore = useAuthStore();

const formState: UnwrapRef<IOperation> = reactive(props.data);
const formRef = ref();

const rules: Record<string, Rule[]> = {
  name: [
    {
      required: true,
      message: t("form.operation.rule.name"),
      trigger: "change",
    },
    // { min: 3, max: 5, message: "Length should be 3 to 5", trigger: "blur" },
  ],
  group: [
    {
      required: true,
      message: t("form.operation.rule.group"),
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
      const data = toRaw(formState) as IOperation;
      if (data.id) {
        const result = await patch(data.id, data);
        operationStore.onAddItemToStore(result);
      } else {
        const result = await create(data);
        operationStore.onAddItemToStore(result);
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
  formRef.value.resetFields();
};

const groupsOperation = computed(() =>
  ["0", "1", "2", "3", "4", "5", "6"].map((x) => {
    return {
      label: t(`groupOperation.${x}`),
      value: x,
    };
  })
);
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
      <a-form-item ref="name" :label="$t('form.operation.name')" name="name">
        <a-input v-model:value="formState.name" />
      </a-form-item>

      <a-form-item :label="$t('form.operation.group')" name="group">
        <a-select
          v-model:value="formState.group"
          style="width: 100%"
          :placeholder="$t('form.order.selectGroup')"
          :options="groupsOperation"
        ></a-select>
      </a-form-item>

      <a-form-item :label="$t('form.operation.color')" name="color">
        <a-input type="color" v-model:value="formState.color" />
        <!-- <a-select
          v-model:value="formState.color"
          style="width: 100%"
          :placeholder="$t('form.operation.selectColor')"
          :options="colorsList"
        ></a-select> -->
      </a-form-item>

      <a-form-item :label="$t('form.role.hidden')" name="hidden">
        <a-switch
          v-model:checked="formState.hidden"
          :checkedValue="1"
          :unCheckedValue="0"
        />
      </a-form-item>

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
