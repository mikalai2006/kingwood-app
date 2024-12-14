<script setup lang="ts">
import { create, patch } from "@/api/task_status";
import { Rule } from "ant-design-vue/es/form";
import { computed, reactive, ref, toRaw, UnwrapRef } from "vue";
import { useI18n } from "vue-i18n";
import { useTaskStatusStore } from "@/store";
import { ITaskStatus } from "@/api/task_status/types";
import * as icons from "@/utils/icons";
import VIcon from "../UI/VIcon.vue";

const props = defineProps<{ data: ITaskStatus; defaultData: ITaskStatus }>();
const emit = defineEmits(["callback"]);

const { t } = useI18n();

const taskStatusStore = useTaskStatusStore();

const formState: UnwrapRef<ITaskStatus> = reactive(props.data);
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
      message: t("form.taskStatus.rule.name"),
      trigger: "change",
    },
    // { min: 3, max: 5, message: "Length should be 3 to 5", trigger: "blur" },
  ],
  // code: [
  //   {
  //     required: true,
  //     message: "Please input Activity name",
  //     trigger: "change",
  //   },
  //   { min: 3, max: 5, message: "Length should be 3 to 5", trigger: "blur" },
  // ],
};

const onSubmit = async () => {
  await formRef.value
    .validate()
    .then(async () => {
      // console.log("values", formState, toRaw(formState));
      const data = toRaw(formState) as ITaskStatus;
      if (data.id) {
        const result = await patch(data.id, data);
        taskStatusStore.onAddItemToStore(result);
      } else {
        const result = await create(data);
        taskStatusStore.onAddItemToStore(result);
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
      <a-form-item ref="name" :label="$t('form.taskStatus.name')" name="name">
        <a-input v-model:value="formState.name" />
      </a-form-item>

      <a-form-item
        ref="status"
        :label="$t('form.taskStatus.status')"
        name="status"
      >
        <a-input v-model:value="formState.status" />
      </a-form-item>

      <a-form-item :label="$t('form.taskStatus.color')" name="color">
        <a-input type="color" v-model:value="formState.color" class="w-24" />
        <!-- <a-select
          v-model:value="formState.color"
          style="width: 100%"
          :placeholder="$t('form.taskStatus.selectColor')"
          :options="colorsList"
        ></a-select> -->
      </a-form-item>

      <a-form-item :label="$t('form.taskStatus.enabled')" name="enabled">
        <a-switch
          v-model:checked="formState.enabled"
          :checkedValue="1"
          :unCheckedValue="0"
        />
      </a-form-item>

      <a-form-item :label="$t('form.taskWorker.icon')" name="icon">
        <a-select
          v-model:value="formState.icon"
          style="width: 100%"
          show-search
          :options="iconsOptions"
          :placeholder="$t('form.taskWorker.selectIcon')"
        >
          <template #option="{ value, label, post }">
            <div class="flex flex-row">
              <div class="flex-auto">
                <VIcon :path="label" />
              </div>
            </div>
          </template>
        </a-select>
      </a-form-item>

      <a-form-item :label="$t('form.taskWorker.animate')" name="animate">
        <a-select
          v-model:value="formState.animate"
          style="width: 100%"
          allowClear
          :options="[
            { label: '', value: '' },
            { label: 'spin', value: 'animate-spin2' },
          ]"
          :placeholder="$t('form.taskWorker.selectAnimate')"
        >
          <!-- <template #option="{ value, label, post }">
            <div class="flex flex-row">
              <div class="flex-auto">
                <VIcon :path="label" />
              </div>
            </div>
          </template> -->
        </a-select>
      </a-form-item>

      <a-form-item :label="$t('form.taskStatus.start')" name="start">
        <a-switch
          v-model:checked="formState.start"
          :checkedValue="1"
          :unCheckedValue="0"
        />
      </a-form-item>

      <a-form-item :label="$t('form.taskStatus.finish')" name="finish">
        <a-switch
          v-model:checked="formState.finish"
          :checkedValue="1"
          :unCheckedValue="0"
        />
      </a-form-item>

      <a-form-item :label="$t('form.taskStatus.process')" name="process">
        <a-switch
          v-model:checked="formState.process"
          :checkedValue="1"
          :unCheckedValue="0"
        />
      </a-form-item>
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
