<script setup lang="ts">
import {
  computed,
  onMounted,
  reactive,
  ref,
  toRaw,
  UnwrapRef,
  watch,
} from "vue";
import { useI18n } from "vue-i18n";

import { create, patch } from "@/api/task_worker";
import { Rule } from "ant-design-vue/es/form";
import {
  useAuthStore,
  usePostStore,
  useRoleStore,
  useTaskStatusStore,
  useTaskWorkerStore,
  useUserStore,
} from "@/store";
import { ITaskWorkerInput } from "@/api/task_worker/types";
import { Dayjs } from "dayjs";
import dayjs from "@/utils/dayjs";
import { dateFormat } from "@/utils/date";
import { useError } from "@/composable/useError";
import { message } from "ant-design-vue";

const props = defineProps<{
  data: ITaskWorkerInput;
  defaultData: ITaskWorkerInput;
}>();
const emit = defineEmits(["callback"]);

const { t } = useI18n();

const authStore = useAuthStore();
const taskWorkerStore = useTaskWorkerStore();
const userStore = useUserStore();
const taskStatusStore = useTaskStatusStore();
const postStore = usePostStore();
const roleStore = useRoleStore();

const formState: UnwrapRef<ITaskWorkerInput> = reactive({ ...props.data });
const formRef = ref();

const taskStatuses = computed(() =>
  taskStatusStore.items
    .filter(
      (x) =>
        !["Автозавершено", "Выполняется"].includes(x.name) ||
        authStore.code == "systemrole"
    )
    .map((x) => {
      return {
        value: x.id,
        label: x.name,
      };
    })
);

const rules = computed(() => {
  let _rules: Record<string, Rule[]> = {
    typeGo: [
      {
        required: true,
        message: t("form.taskWorker.rule.typeGo"),
        trigger: "change",
      },
      // { min: 3, max: 5, message: "Length should be 3 to 5", trigger: "blur" },
    ],
    workerId: [
      {
        required: true,
        message: t("form.taskWorker.rule.workerId"),
        trigger: "change",
      },
      // { min: 3, max: 5, message: "Length should be 3 to 5", trigger: "blur" },
    ],
    // from: [
    //   {
    //     required: true,
    //     message: t("form.taskWorker.rule.dateStart"),
    //     trigger: "change",
    //   },
    //   // { min: 3, max: 5, message: "Length should be 3 to 5", trigger: "blur" },
    // ],
    // operationId: [
    //   {
    //     required: true,
    //     message: t("form.task.rule.operationId"),
    //     trigger: "change",
    //   },
    //   // { min: 3, max: 5, message: "Length should be 3 to 5", trigger: "blur" },
    // ],
    // code: [
    //   {
    //     required: true,
    //     message: "Please input Activity name",
    //     trigger: "change",
    //   },
    //   { min: 3, max: 5, message: "Length should be 3 to 5", trigger: "blur" },
    // ],
  };

  if (formState.typeGo === "date") {
    _rules = Object.assign({}, _rules, {
      to: [
        {
          required: true,
          message: t("form.taskWorker.rule.date"),
          trigger: ["blur", "change"],
        },
        // { min: 3, max: 5, message: "Length should be 3 to 5", trigger: "blur" },
      ],
    });
  } else if (formState.typeGo === "range") {
    _rules = Object.assign({}, _rules, {
      to: [
        {
          required: true,
          message: t("form.taskWorker.rule.range"),
          trigger: ["blur", "change"],
        },
        // { min: 3, max: 5, message: "Length should be 3 to 5", trigger: "blur" },
      ],
    });
  }

  return _rules;
});

const { onGetValidateError } = useError();

const loading = ref(false);

const onSubmit = async () => {
  loading.value = true;

  await formRef.value
    .validate()
    .then(async () => {
      // console.log("values", formState, toRaw(formState));
      const data = toRaw(formState) as ITaskWorkerInput;
      const _status = taskStatusStore.items.find(
        (x) => x.id === formState.statusId
      );
      if (_status) {
        formState.status = _status.status;
      }

      if (data.id) {
        const result = await patch(data.id, data);
        taskWorkerStore.onAddItemToStore(result);
      } else {
        const result = await create(data);
        taskWorkerStore.onAddItemToStore(result);
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

const rolesWorkers = computed(() =>
  roleStore.items.filter((x) => ["user"].includes(x.code)).map((x) => x.id)
);

const workers = computed(() => {
  return (
    userStore.items
      // .filter((x) => x.typeWork?.includes(formState.operationId))
      .filter(
        (x) =>
          !x.hidden &&
          !x.archive &&
          !x.blocked &&
          rolesWorkers.value.includes(x.roleId)
      )
      .map((x) => {
        const post = postStore.items.find((y) => y.id === x.postId);
        return {
          post,
          value: x.id,
          label: x.name,
        };
      })
  );
});

interface Option {
  label: string;
}
const filterOption = (input: string, option: Option) => {
  return option.label.toUpperCase().indexOf(input.toUpperCase()) >= 0;
};

const taskRange = ref<[Dayjs, Dayjs]>([dayjs(new Date()), dayjs(new Date())]);
const taskDate = ref<Dayjs>(dayjs(new Date()));
const taskStartDate = ref<Dayjs>(dayjs(new Date()));

const typesGo = computed(() =>
  ["default", "date", "range"].map((x) => {
    return {
      value: x,
      label: t(`typeGo.${x}`),
    };
  })
);

const disabledDate = (current: Dayjs) => {
  // Can not select days before today and today
  return current && current < dayjs().subtract(2, "day"); //.endOf("day");
};

watch(taskRange, (v) => {
  formState.from = v ? v[0]?.toISOString() : "";
  formState.to = v ? v[1]?.toISOString() : "";
});
watch(taskDate, (v) => {
  formState.from = v?.toISOString();
  formState.to = v?.toISOString();
});

watch(taskStartDate, (v) => {
  formState.from = v?.toISOString();
  formState.to = v.add(1, "year")?.toISOString();
});
const disableEdit = computed(
  () =>
    formState.status &&
    ["finish", "autofinish"].includes(formState.status) &&
    authStore.code != "systemrole"
);

onMounted(() => {
  if (!props.data.id) {
    formState.typeGo = typesGo.value[0].value;

    const waitStatus = taskStatusStore.items.find((x) => x.status === "wait");
    if (waitStatus) {
      formState.status = waitStatus.status;
      formState.statusId = waitStatus.id;
    }
  }
  if (formState.to && formState.from) {
    taskRange.value = [dayjs(formState.from), dayjs(formState.to)];
  }
});
</script>
<template>
  <div>
    <!-- {{ JSON.stringify(formState) }} -->
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

      <!-- <a-form-item ref="name" :label="$t('form.order.name')" name="name">
        <a-textarea
          v-model:value="formState.name"
          :auto-size="{ minRows: 2, maxRows: 5 }"
        />
      </a-form-item> -->

      <!-- <a-form-item
        ref="description"
        :label="$t('form.order.description')"
        name="description"
      >
        <a-textarea
          v-model:value="formState.description"
          :auto-size="{ minRows: 2, maxRows: 5 }"
        />
      </a-form-item> -->

      <!-- <a-form-item :label="$t('form.task.name')" name="name">
        <a-auto-complete
          v-model:value="formState.name"
          :options="operations"
          style="width: 100%"
          :placeholder="$t('form.task.namePlaceholder')"
          :allow-clear="true"
        >
          <template #clearIcon>
            <VIcon :path="iX" class="text-2xl leading-3 -mt-1.5 -ml-1.5" />
          </template>
        </a-auto-complete>
      </a-form-item> -->

      <a-form-item :label="$t('form.taskWorker.workerId')" name="workerId">
        <a-select
          v-model:value="formState.workerId"
          style="width: 100%"
          show-search
          :options="workers"
          :placeholder="$t('form.taskWorker.selectWorkerId')"
          :filter-option="filterOption"
          :disabled="!!formState.id"
        >
          <template #option="{ value, label, post }">
            <div class="flex flex-row">
              <div class="flex-auto">
                {{ label }}
              </div>
              <div class="text-s-500">{{ post?.name }}</div>
            </div>
          </template>
        </a-select>
      </a-form-item>

      <!-- <a-form-item :label="$t('form.taskWorker.typeGo')" name="typeGo">
        <a-select
          v-model:value="formState.typeGo"
          style="width: 100%"
          :placeholder="$t('form.taskWorker.selectTypeGo')"
          :options="typesGo"
          :disabled="
            !authStore.roles.includes('taskWorker-typeGo') || disableEdit
          "
        ></a-select>
      </a-form-item>

      <a-form-item
        v-if="formState.typeGo === 'range'"
        :label="$t('form.taskWorker.range')"
        name="to"
      >
        <a-range-picker
          v-model:value="taskRange"
          :disabledDate="disabledDate"
          :format="dateFormat"
          :disabled="
            !authStore.roles.includes('taskWorker-typeGo') || disableEdit
          "
        />
      </a-form-item>

      <a-form-item
        v-else-if="formState.typeGo === 'date'"
        :label="$t('form.taskWorker.date')"
        name="date"
      >
        <a-date-picker
          v-model:value="taskDate"
          :disabledDate="disabledDate"
          :format="dateFormat"
          :disabled="
            !authStore.roles.includes('taskWorker-typeGo') || disableEdit
          "
        />
      </a-form-item> -->

      <a-form-item :label="$t('form.taskWorker.dateStart')" name="date">
        <a-date-picker
          v-model:value="taskStartDate"
          :disabledDate="disabledDate"
          :format="dateFormat"
          :disabled="
            !authStore.roles.includes('taskWorker-typeGo') || disableEdit
          "
        />
      </a-form-item>

      <a-form-item
        v-if="authStore.roles.includes('taskWorker-statusId') && formState?.id"
        :label="$t('form.taskWorker.statusId')"
        name="statusId"
      >
        <a-select
          v-model:value="formState.statusId"
          style="width: 100%"
          :placeholder="$t('form.taskWorker.selectStatusId')"
          :options="taskStatuses"
          :disabled="
            !authStore.roles.includes('taskWorker-statusId') || disableEdit
          "
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

      <a-form-item
        v-if="
          formState?.id
            ? authStore.roles.includes('taskWorker-patch')
            : authStore.roles.includes('taskWorker-create')
        "
        :wrapper-col="{ span: 14, offset: 4 }"
      >
        <a-button v-if="!formState?.id" :disabled="loading" @click="resetForm">
          {{ $t("form.reset") }}
        </a-button>
        <a-button
          type="primary"
          :disabled="loading || disableEdit"
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
