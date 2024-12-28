<script setup lang="ts">
import { create, patch } from "@/api/operation";
import { Rule } from "ant-design-vue/es/form";
import { computed, reactive, ref, toRaw, UnwrapRef } from "vue";
import { useI18n } from "vue-i18n";
import { useOperationStore } from "@/store";
import type { IOperation } from "@/api/operation/types";

const props = defineProps<{ data: IOperation; defaultData: IOperation }>();
const emit = defineEmits(["callback"]);

const { t } = useI18n();

const operationStore = useOperationStore();

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

const onSubmit = async () => {
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
    })
    .catch((error: Error) => {
      console.log("error", error);
    });
  emit("callback");
};
const resetForm = () => {
  formRef.value.resetFields();
};

const groupsOperation = computed(() =>
  ["0", "1", "2", "3", "4", "5"].map((x) => {
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
