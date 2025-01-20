<script setup lang="ts">
import { Rule } from "ant-design-vue/es/form";
import { computed, reactive, ref, toRaw, UnwrapRef } from "vue";
import { useI18n } from "vue-i18n";
import { usePayTemplateStore } from "@/store";
import * as icons from "@/utils/icons";
import VIcon from "../UI/VIcon.vue";
import { IPayTemplate, IPayTemplateInput } from "@/api/pay_template/types";
import { create, patch } from "@/api/pay_template";
import { IValidateError, useError } from "@/composable/useError";
import { message } from "ant-design-vue";

const props = defineProps<{
  data: IPayTemplateInput;
  defaultData: IPayTemplateInput;
}>();
const emit = defineEmits(["callback"]);

const { t } = useI18n();

const payTemplateStore = usePayTemplateStore();

const formState: UnwrapRef<IPayTemplateInput> = reactive(props.data);
const formRef = ref();

const iconsOptions = computed(() =>
  Object.values(icons).map((x) => {
    return {
      value: x,
      label: x,
    };
  })
);

const rules: Record<string, Rule[]> = {
  name: [
    {
      required: true,
      message: t("form.payTemplate.rule.name"),
      trigger: "change",
    },
    // { min: 3, max: 5, message: "Length should be 3 to 5", trigger: "blur" },
  ],
  total: [
    {
      required: true,
      message: t("form.payTemplate.rule.total"),
      trigger: "change",
    },
    // { min: 3, max: 5, message: "Length should be 3 to 5", trigger: "blur" },
  ],
};

const { onGetValidateError } = useError();

const onSubmit = async () => {
  await formRef.value
    .validate()
    .then(async () => {
      // console.log("values", formState, toRaw(formState));
      const data = toRaw(formState) as IPayTemplate;
      if (data.id) {
        const result = await patch(data.id, { ...data });
        payTemplateStore.onAddItemToStore(result);
      } else {
        const result = await create(data);
        payTemplateStore.onAddItemToStore(result);
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
    });
};
const resetForm = () => {
  formRef.value.resetFields();
};
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
      <a-form-item :label="$t('form.payTemplate.name')" name="name">
        <a-input v-model:value="formState.name" />
      </a-form-item>

      <a-form-item :label="$t('form.payTemplate.total')" name="total">
        <a-input-number class="w-full" v-model:value="formState.total" />
      </a-form-item>

      <a-form-item
        :label="$t('form.payTemplate.description')"
        name="description"
      >
        <a-textarea
          v-model:value="formState.description"
          :auto-size="{ minRows: 2, maxRows: 5 }"
        />
      </a-form-item>

      <a-form-item :label="$t('form.payTemplate.enabled')" name="enabled">
        <a-switch
          v-model:checked="formState.enabled"
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
