<script setup lang="ts">
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
import { useTaskWorkerStore, useWorkHistoryStore } from "@/store";
import { useError } from "@/composable/useError";
import { message } from "ant-design-vue";
import dayjs, { Dayjs } from "dayjs";
import { dateFormat } from "@/utils/date";
import VOrder from "../V/VOrder.vue";
import { IWorkHistoryInput } from "@/api/work_history/types";
import { create, patch } from "@/api/work_history";
import VTaskWorker from "../V/VTaskWorker.vue";
import { ITaskWorker } from "@/api/task_worker/types";
import { getObjectId } from "@/utils/utils";

const props = defineProps<{
  data: IWorkHistoryInput;
  defaultData: IWorkHistoryInput;
}>();
const emit = defineEmits(["callback"]);

const { t } = useI18n();

const workHistoryStore = useWorkHistoryStore();

const taskWorkerStore = useTaskWorkerStore();

const formState: UnwrapRef<IWorkHistoryInput> = reactive({ ...props.data });
const formRef = ref();

const rules: Record<string, Rule[]> = {
  to: [
    {
      required: true,
      message: t("form.workHistory.rule.to"),
      trigger: "change",
    },
  ],
  from: [
    {
      required: true,
      message: t("form.workHistory.rule.from"),
      trigger: "change",
    },
  ],
  oklad: [
    {
      required: true,
      message: t("form.workHistory.rule.oklad"),
      trigger: "change",
    },
  ],
  taskWorkerId: [
    {
      required: true,
      message: t("form.workHistory.rule.taskWorkerId"),
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
      const data = toRaw(formState) as IWorkHistoryInput;
      if (data.id) {
        const result = await patch(data.id, data);
        workHistoryStore.onAddItemToStore(result);
      } else {
        data.status = 1;
        // data.date = data.from;
        const result = await create(data);
        workHistoryStore.onAddItemToStore(result);
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

const onChangeTaskWorker = (idTaskWorker: string) => {
  const taskWorker = taskWorkerStore.items.find((x) => x.id === idTaskWorker);
  import.meta.env.VIEW_CONSOLE &&
    console.log("onChangeTaskWorker: ", taskWorker);
  formState.objectId = taskWorker?.objectId;
  formState.operationId = taskWorker?.operationId;
  formState.taskId = taskWorker?.taskId;

  if (getObjectId(taskWorker?.workerId) != "0") {
    formState.workerId = taskWorker?.workerId;
  }

  formState.orderId = taskWorker?.orderId;
  import.meta.env.VIEW_CONSOLE &&
    console.log("onChangeTaskWorker 2: ", formState);
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
    <a-form ref="formRef" layout="horizontal" :model="formState" :rules="rules">
      <!-- <a-form-item :label="$t('form.workHistory.date')" name="date">
        <a-date-picker
          v-model:value="date"
          :format="dateFormat"
          style="width: 100%"
          @change="onChangeTime"
        />
      </a-form-item> -->
      <a-form-item :label="$t('form.workHistory.from')" name="from">
        <a-time-picker
          v-model:value="from"
          format="HH:mm:ss"
          style="width: 100%"
          :disabled-time="(now: Dayjs) => {
            return {
              disabledHours: () => [],
              disabledMinutes: (selectedHour: number) => [],
              disabledSeconds: (selectedHour: number, selectedMinute: number) => [],
            }
          }"
          @change="onChangeTime"
        />
      </a-form-item>

      <a-form-item :label="$t('form.workHistory.to')" name="to">
        <a-time-picker
          v-model:value="to"
          format="HH:mm:ss"
          style="width: 100%"
          @change="onChangeTime"
        />
      </a-form-item>

      <a-form-item :label="$t('form.workHistory.oklad')" name="oklad">
        <a-input-number class="w-full" v-model:value="formState.oklad" />
      </a-form-item>

      <VTaskWorker
        v-if="formState.workerId"
        v-model="formState.taskWorkerId"
        :worker-id="formState.workerId"
        @change="onChangeTaskWorker"
      />

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
