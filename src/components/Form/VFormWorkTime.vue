<script setup lang="ts">
import { create, patch } from "@/api/work_time";
import { Rule } from "ant-design-vue/es/form";
import {
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  toRaw,
  UnwrapRef,
} from "vue";
import { useI18n } from "vue-i18n";
import { useWorkTimeStore } from "@/store";
import { useError } from "@/composable/useError";
import { message } from "ant-design-vue";
import { IWorkTimeInput } from "@/api/work_time/types";
import dayjs, { Dayjs } from "dayjs";
import { dateFormat } from "@/utils/date";

const props = defineProps<{
  data: IWorkTimeInput;
  defaultData: IWorkTimeInput;
}>();
const emit = defineEmits(["callback"]);

const { t } = useI18n();

const workTimeStore = useWorkTimeStore();

const formState: UnwrapRef<IWorkTimeInput> = reactive({ ...props.data });
const formRef = ref();

const rules: Record<string, Rule[]> = {
  to: [
    {
      required: true,
      message: t("form.workTime.rule.to"),
      trigger: "change",
    },
  ],
  from: [
    {
      required: true,
      message: t("form.workTime.rule.from"),
      trigger: "change",
    },
  ],
  oklad: [
    {
      required: true,
      message: t("form.workTime.rule.oklad"),
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
      const data = toRaw(formState) as IWorkTimeInput;
      if (data.id) {
        const result = await patch(data.id, data);
        workTimeStore.onAddItemToStore(result);
      } else {
        data.status = 1;
        // data.date = data.from;
        const result = await create(data);
        workTimeStore.onAddItemToStore(result);
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

const date = ref<Dayjs>();
const from = ref<Dayjs>();
const to = ref<Dayjs>();

const onSyncDate = () => {
  if (formState.date) {
    date.value = dayjs(formState.date);
    formState.from = dayjs(formState.from)
      .set("date", date.value.date())
      .utc()
      .format();
    formState.to = dayjs(formState.to)
      .set("date", date.value.date())
      .utc()
      .format();
  }
};

const onChangeTime = (value: string) => {
  onSyncDate();
  // if (date.value) {
  //   formState.from = dayjs(formState.from)
  //     .set("date", date.value.date())
  //     .utc()
  //     .format();
  //   formState.to = dayjs(formState.to)
  //     .set("date", date.value.date())
  //     .utc()
  //     .format();
  // }
  if (from.value) {
    formState.from = dayjs(formState.from)
      .set("hour", from.value.hour())
      .set("minute", from.value.minute())
      .set("seconds", from.value.second())
      .utc()
      .format();
  }
  if (to.value) {
    formState.to = dayjs(formState.to)
      .set("hour", to.value.hour())
      .set("minute", to.value.minute())
      .set("seconds", to.value.second())
      .utc()
      .format();
  }
};

onMounted(() => {
  onSyncDate();

  if (formState.from) {
    from.value = dayjs(formState.from);
  }
  if (formState.to) {
    to.value = dayjs(formState.to);
  }
});

onBeforeUnmount(() => {
  resetForm();
});
</script>
<template>
  <div>
    <!-- {{ formState }} -->
    <a-form
      ref="formRef"
      layout="horizontal"
      style="max-width: 600px"
      :model="formState"
      :rules="rules"
    >
      <!-- <a-form-item :label="$t('form.workTime.date')" name="date">
        <a-date-picker
          v-model:value="date"
          :format="dateFormat"
          style="width: 100%"
          @change="onChangeTime"
        />
      </a-form-item> -->
      <a-form-item :label="$t('form.workTime.from')" name="from">
        <a-time-picker
          v-model:value="from"
          format="HH:mm:ss"
          style="width: 100%"
          @change="onChangeTime"
        />
      </a-form-item>

      <a-form-item :label="$t('form.workTime.to')" name="to">
        <a-time-picker
          v-model:value="to"
          format="HH:mm:ss"
          style="width: 100%"
          @change="onChangeTime"
        />
      </a-form-item>

      <a-form-item :label="$t('form.workTime.oklad')" name="oklad">
        <a-input-number class="w-full" v-model:value="formState.oklad" />
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
