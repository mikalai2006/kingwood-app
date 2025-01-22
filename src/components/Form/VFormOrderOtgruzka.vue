<script setup lang="ts">
import { patch } from "@/api/order";
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
import { useAuthStore, useOrderStore, useUserStore } from "@/store";
import { IOrder } from "@/api/order/types";
import { dateFormat } from "@/utils/date";
import dayjs from "@/utils/dayjs";
import { message } from "ant-design-vue";
import { IValidateError, useError } from "@/composable/useError";

const props = defineProps<{ data: IOrder; defaultData: IOrder }>();
const emit = defineEmits(["callback"]);

const { t } = useI18n();

const authStore = useAuthStore();
const orderStore = useOrderStore();
const userStore = useUserStore();

const formState: UnwrapRef<IOrder> = reactive(props.data);
const formRef = ref();

const rules: Record<string, Rule[]> = {
  dateOtgruzka: [
    {
      required: true,
      message: t("form.order.rule.dateOtgruzka"),
      trigger: "change",
    },
  ],
};

const { onGetValidateError } = useError();

const loading = ref(false);

const onSubmit = async () => {
  if (!formState.id) {
    return;
  }
  loading.value = true;

  await formRef.value
    .validate()
    .then(async () => {
      const data = toRaw({}) as IOrder;
      data.dateOtgruzka = dayjs(data.dateOtgruzka).utc().format();
      data.id = formState.id;
      data.description = formState.description;
      const result = await patch(data.id, data);
      orderStore.onAddItemToStore(result);

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

onMounted(() => {
  if (dayjs(formState.dateOtgruzka).year() === 1) {
    formState.dateOtgruzka = "";
  }
});

onBeforeUnmount(() => {
  resetForm();
});
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
      <a-form-item ref="name" :label="$t('form.order.name')" name="name">
        <a-textarea
          v-model:value="formState.name"
          :auto-size="{ minRows: 2, maxRows: 5 }"
          :disabled="true"
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

      <!-- <a-form-item :label="$t('form.order.status')" name="status">
        <a-select
          v-model:value="formState.status"
          style="width: 100%"
          :placeholder="$t('form.order.selectStatus')"
          :options="orderStatuses"
          :disabled="true"
        ></a-select>
      </a-form-item> -->

      <a-form-item :label="$t('form.order.term')" name="term">
        <a-date-picker
          v-model:value="formState.term"
          :format="dateFormat"
          value-format="YYYY-MM-DD"
          style="width: 100%"
          :placeholder="$t('form.order.selectTerm')"
          :disabled="true"
        />
      </a-form-item>

      <a-form-item :label="$t('form.order.dateOtgruzka')" name="dateOtgruzka">
        <a-date-picker
          v-model:value="formState.dateOtgruzka"
          :format="dateFormat"
          value-format="YYYY-MM-DD"
          style="width: 100%"
          :placeholder="$t('form.order.selectDateOtgruzka')"
        />
      </a-form-item>

      <a-form-item
        v-if="authStore.roles.includes('order-otgruzka')"
        :wrapper-col="{ span: 14, offset: 4 }"
      >
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
