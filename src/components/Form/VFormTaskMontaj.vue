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

import { create, patch } from "@/api/task_montaj";
import { Rule } from "ant-design-vue/es/form";
import {
  useObjectStore,
  useOperationStore,
  useTaskMontajStore,
  useTaskStatusStore,
  useTaskStore,
  useUserStore,
} from "@/store";
import { ITaskMontaj, ITaskMontajInput } from "@/api/task_montaj/types";
import VIcon from "../UI/VIcon.vue";
import { iX } from "@/utils/icons";
import UIHelp from "../UI/UIHelp.vue";
import { Dayjs } from "dayjs";
import dayjs from "@/utils/dayjs";
import { dateFormat } from "@/utils/date";
import { IObject } from "@/api/object/types";
import useObject from "@/composable/useObject";

const props = defineProps<{
  data: ITaskMontajInput;
  defaultData: ITaskMontajInput;
}>();
const emit = defineEmits(["callback"]);

const { t } = useI18n();

const taskMontajStore = useTaskMontajStore();
const userStore = useUserStore();
const operationStore = useOperationStore();
const taskStatusStore = useTaskStatusStore();
const objectStore = useObjectStore();

const formState: UnwrapRef<ITaskMontajInput> = reactive({ ...props.data });
const formRef = ref();

const rules = computed(() => {
  let _rules: Record<string, Rule[]> = {
    objectId: [
      {
        required: true,
        message: t("form.montaj.rule.objectId"),
        trigger: "change",
      },
      // { min: 3, max: 5, message: "Length should be 3 to 5", trigger: "blur" },
    ],
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

const onSubmit = async () => {
  await formRef.value
    .validate()
    .then(async () => {
      // console.log("values", formState, toRaw(formState));
      const _status = taskStatusStore.items.find(
        (x) => x.id === formState.statusId
      );
      if (_status) {
        formState.status = _status.status;
      }
      const data = toRaw(formState) as ITaskMontaj;
      if (data.id) {
        const result = await patch(data.id, data);
        taskMontajStore.onAddItemToStore(result);
      } else {
        const result = await create(data);
        taskMontajStore.onAddItemToStore(result);
      }
      emit("callback");
    })
    .catch((error: Error) => {
      console.log("error", error);
    });
};
const resetForm = () => {
  formRef.value.resetFields();
};

const operations = computed(() => {
  return (
    operationStore.items
      // .filter((x) => x.group === "create")
      .map((x) => {
        return {
          value: x.id,
          label: x.name,
        };
      })
  );
});

const onChangeOperation = (value: string) => {
  const _operation = operationStore.items.find((x) => x.id === value);

  if (_operation) {
    formState.name = _operation?.name;
    // console.log("onChangeOperation: ", value, _operation);
  }
};

const workers = computed(() => {
  return (
    userStore.items
      // .filter((x) => x.typeWork?.includes(formState.operationId))
      .filter((x) => x.hidden)
      .map((x) => {
        return {
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

const taskStatuses = computed(() =>
  taskStatusStore.items.map((x) => {
    return {
      value: x.id,
      label: x.name,
    };
  })
);

const taskRange = ref<[Dayjs, Dayjs]>([dayjs(new Date()), dayjs(new Date())]);
const taskDate = ref<Dayjs>(dayjs(new Date()));

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
  return current && current < dayjs().subtract(1, "day"); //.endOf("day");
};

watch(taskRange, (v) => {
  formState.from = v ? v[0]?.toISOString() : "";
  formState.to = v ? v[1]?.toISOString() : "";
});
watch(taskDate, (v) => {
  formState.from = v?.toISOString();
  formState.to = v?.toISOString();
});

const { onCreateObject, onFetchObjects, state, onSetStateData } = useObject();

onMounted(() => {
  if (!props.data.id) {
    formState.typeGo = typesGo.value[0].value;
  }
  if (formState?.object) {
    onSetStateData([formState.object]);
  }
});
</script>
<template>
  <div>
    {{ JSON.stringify(formState) }}
    <a-form
      ref="formRef"
      layout="horizontal"
      style="max-width: 600px"
      :model="formState"
      :rules="rules"
    >
      <a-form-item :label="$t('form.montaj.objectId')" name="objectId">
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
                <a-button type="primary" @click="onCreateObject">
                  {{ $t("form.object.add") }} {{ state.value }}
                </a-button>
              </div>
              <a-spin v-if="state.fetching" size="small" />
            </div>
          </template>
        </a-select>
      </a-form-item>

      <a-form-item :label="$t('form.task.operationId')" name="operationId">
        <a-select
          v-model:value="formState.operationId"
          style="width: 100%"
          show-search
          :placeholder="$t('form.task.selectOperationId')"
          :options="operations"
          :filter-option="filterOption"
          @change="onChangeOperation"
        ></a-select>
      </a-form-item>

      <!-- <a-form-item :label="$t('form.taskWorker.typeGo')" name="typeGo">
        <a-select
          v-model:value="formState.typeGo"
          style="width: 100%"
          :placeholder="$t('form.taskWorker.selectTypeGo')"
          :options="typesGo"
          :disabled="!!formState.id"
        ></a-select>
      </a-form-item> -->

      <a-form-item
        v-if="formState.typeGo === 'range'"
        :label="$t('form.taskWorker.range')"
        name="to"
      >
        <a-range-picker
          v-model:value="taskRange"
          :disabledDate="disabledDate"
          :format="dateFormat"
          :disabled="!!formState.id"
        />
      </a-form-item>

      <a-form-item
        v-else-if="formState.typeGo === 'date'"
        :label="$t('form.taskWorker.date')"
        name="to"
      >
        <a-date-picker
          v-model:value="taskDate"
          :disabledDate="disabledDate"
          :format="dateFormat"
          :disabled="!!formState.id"
        />
      </a-form-item>

      <!-- <a-form-item :label="$t('form.task.operationId')" name="operationId">
        <a-select
          v-model:value="formState.operationId"
          style="width: 100%"
          :placeholder="$t('form.task.selectOperationId')"
          :options="operations"
        ></a-select>
      </a-form-item> -->
      <!-- <a-form-item :label="$t('form.task.workerId')" name="workerId">
        <a-select
          v-model:value="formState.workerId"
          style="width: 100%"
          show-search
          mode="multiple"
          :placeholder="$t('form.task.selectWorkerId')"
          :options="workers"
          :filter-option="filterOption"
        ></a-select>
      </a-form-item> -->
      <!-- <a-form-item :label="$t('form.task.statusId')" name="statusId">
        <a-select
          v-model:value="formState.statusId"
          style="width: 100%"
          :placeholder="$t('form.task.selectStatusId')"
          :options="taskStatuses"
        ></a-select>
      </a-form-item> -->
      <!-- <a-form-item :labelCol="{ span: 21 }" name="active">
        <template #label>
          {{ $t("form.task.active") }}
          <UIHelp :title="$t('form.task.help.active')" />
        </template>
        <a-switch
          v-model:checked="formState.active"
          :checkedValue="1"
          :unCheckedValue="0"
        />
      </a-form-item> -->
      <!-- <a-form-item :labelCol="{ span: 21 }" name="autoCheck">
        <template #label>
          {{ $t("form.task.autoCheck") }}
          <UIHelp :title="$t('form.task.help.autoCheck')" />
        </template>
        <a-switch
          v-model:checked="formState.autoCheck"
          :checkedValue="1"
          :unCheckedValue="0"
        />
      </a-form-item> -->
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
