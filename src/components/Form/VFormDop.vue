<script setup lang="ts">
import { Rule } from "ant-design-vue/es/form";
import { computed, onBeforeUnmount, Ref, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useError } from "@/composable/useError";
import { IDoplataInput } from "@/api/types";

const props = defineProps<{
  data: IDoplataInput;
  defaultData: IDoplataInput;
}>();
const emit = defineEmits(["callback"]);

const { t } = useI18n();

const formState: Ref<IDoplataInput> = ref(props.data);
const formRef = ref();

const optionsDays = computed(() =>
  [0, 1, 2, 3, 4, 5, 6].map((x) => {
    return {
      value: x,
      label: t(`form.day.${x}`),
    };
  })
);

const rules: Record<string, Rule[]> = {
  days: [
    {
      required: true,
      message: t("form.user.dop.rule.days"),
      trigger: "change",
      type: "array",
      min: 1,
    },
  ],
  minHours: [
    {
      required: true,
      message: t("form.user.dop.rule.minHours"),
      trigger: "change",
    },
  ],
  doplata: [
    {
      required: true,
      message: t("form.user.dop.rule.doplata"),
      trigger: "change",
    },
  ],
};

const { onGetValidateError } = useError();

const loading = ref(false);

const onSubmit = async () => {
  loading.value = true;

  await formRef.value
    .validate()
    .then(async () => {
      // // console.log("values", formState, toRaw(formState));
      // const data = toRaw(formState) as IDoplata;
      // if (data.id) {
      //   const result = await patch(data.id, data);
      //   payStore.onAddItemToStore(result);
      // } else {
      //   const result = await create(data);
      //   payStore.onAddItemToStore(result);
      // }
      // message.success(t("form.message.successSave"));
      const _data = { ...formState.value };

      emit("callback", _data);
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

onBeforeUnmount(() => {
  resetForm();
});
</script>
<template>
  <!-- {{ JSON.stringify(formState) }} -->
  <a-form
    ref="formRef"
    layout="horizontal"
    style="max-width: 600px"
    :model="formState"
    :rules="rules"
  >
    <!-- <a-date-picker v-model:value="days" picker="" @change="() => {}" /> -->
    <a-form-item :label="$t('form.user.dop.days')" name="days">
      <a-select
        v-model:value="formState.days"
        mode="tags"
        style="width: 100%"
        :placeholder="$t('form.user.dop.daysSelect')"
        :options="optionsDays"
      ></a-select>
    </a-form-item>

    <a-form-item :label="$t('form.user.dop.minHours')" name="minHours">
      <a-input-number v-model:value="formState.minHours" :min="0" :max="20" />
    </a-form-item>

    <a-form-item :label="$t('form.user.dop.doplata')" name="doplata">
      <a-input-number v-model:value="formState.doplata" :min="0" />
    </a-form-item>

    <a-form-item :wrapper-col="{ span: 14, offset: 4 }">
      <a-button @click="resetForm">
        {{ $t("form.reset") }}
      </a-button>
      <a-button
        type="primary"
        :disabled="loading"
        :loading="loading"
        style="margin-left: 10px"
        @click="onSubmit"
      >
        {{ $t("form.add") }}
      </a-button>
    </a-form-item>
  </a-form>
</template>
