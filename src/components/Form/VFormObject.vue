<script setup lang="ts">
import { computed, reactive, ref, toRaw, UnwrapRef } from "vue";
import { useI18n } from "vue-i18n";

import { Rule } from "ant-design-vue/es/form";
import {
  useObjectStore,
  useOperationStore,
  useTaskStatusStore,
  useUserStore,
} from "@/store";
import VIcon from "../UI/VIcon.vue";
import { iX } from "@/utils/icons";
import { IObject, IObjectInput } from "@/api/object/types";
import { create, patch } from "@/api/object";

const props = defineProps<{ data: IObjectInput; defaultData: IObjectInput }>();
const emit = defineEmits(["callback"]);

const { t } = useI18n();

const objectStore = useObjectStore();
const userStore = useUserStore();
const operationStore = useOperationStore();
const taskStatusStore = useTaskStatusStore();

const formState: UnwrapRef<IObjectInput> = reactive({ ...props.data });
const formRef = ref();

const rules: Record<string, Rule[]> = {
  name: [
    {
      required: true,
      message: t("form.object.rule.name"),
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
      const data = toRaw(formState) as IObject;
      if (data.id) {
        const result = await patch(data.id, data);
        objectStore.onAddItemToStore(result);
      } else {
        const result = await create(data);
        objectStore.onAddItemToStore(result);
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
  return operationStore.items.map((x) => {
    return {
      value: x.name,
      label: x.name,
    };
  });
});

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
      <a-form-item :label="$t('form.object.name')" name="name">
        <a-auto-complete
          v-model:value="formState.name"
          style="width: 100%"
          :placeholder="$t('form.object.namePlaceholder')"
          :allow-clear="true"
          :filter-option="filterOption"
        >
          <template #clearIcon>
            <VIcon :path="iX" class="text-2xl leading-3 -mt-1.5 -ml-1.5" />
          </template>
        </a-auto-complete>
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
      <!-- 
      <a-form-item
        :label="$t('form.task.active')"
        :labelCol="{ span: 21 }"
        name="active"
      >
        <a-switch
          v-model:checked="formState.active"
          :checkedValue="1"
          :unCheckedValue="0"
        />
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
