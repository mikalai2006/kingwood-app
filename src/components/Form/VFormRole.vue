<script setup lang="ts">
import { create, patch } from "@/api/role";
import { IRole, IRoleInput } from "@/api/role/types";
import { useError } from "@/composable/useError";
import { useAuthStore, useRoleStore } from "@/store";
import { roles } from "@/utils/roles";
import { message } from "ant-design-vue";
import { Rule } from "ant-design-vue/es/form";
import { reactive, ref, toRaw, UnwrapRef } from "vue";
import { useI18n } from "vue-i18n";

const props = defineProps<{ data: IRoleInput; defaultData: IRoleInput }>();
const emit = defineEmits(["callback"]);

const { t } = useI18n();
const roleStore = useRoleStore();
const authStore = useAuthStore();

const formState: UnwrapRef<IRoleInput> = reactive(props.data);
const formRef = ref();

const rules: Record<string, Rule[]> = {
  name: [
    {
      required: true,
      message: t("form.role.rule.name"),
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
  value: [
    {
      type: "array",
      required: true,
      message: t("form.role.rule.value"),
      trigger: "change",
    },
  ],
};

const { onGetValidateError } = useError();

const onSubmit = async () => {
  await formRef.value
    .validate()
    .then(async () => {
      // console.log("values", formState, toRaw(formState));
      const data = toRaw(formState) as IRole;
      if (data.id) {
        const newRole = await patch(data.id, data);
        roleStore.onAddItemToStore(newRole);
      } else {
        const newRole = await create(data);
        roleStore.onAddItemToStore(newRole);
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

const rolesList = roles.map((x) => {
  return {
    label: t(`privilege.${x}`),
    value: x,
  };
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
      <a-form-item ref="name" :label="$t('form.role.name')" name="name">
        <a-input v-model:value="formState.name" />
      </a-form-item>

      <!-- <a-form-item label="Activity type" name="type">
        <a-checkbox-group v-model:value="formState.type">
          <a-checkbox value="1" name="type">Online</a-checkbox>
          <a-checkbox value="2" name="type">Promotion</a-checkbox>
          <a-checkbox value="3" name="type">Offline</a-checkbox>
        </a-checkbox-group>
      </a-form-item> -->

      <a-form-item :label="$t('form.role.value')" name="value">
        <a-select
          v-model:value="formState.value"
          mode="multiple"
          style="width: 100%"
          :placeholder="$t('form.role.selectValue')"
          :options="rolesList"
          :max-tag-count="20"
        ></a-select>
      </a-form-item>

      <a-form-item
        ref="sortOrder"
        :label="$t('form.role.sortOrder')"
        name="sortOrder"
      >
        <a-input-number v-model:value="formState.sortOrder" />
      </a-form-item>

      <a-form-item ref="code" :label="$t('form.role.code')" name="code">
        <a-input v-model:value="formState.code" />
      </a-form-item>

      <a-form-item
        v-if="authStore.code === 'superadmin'"
        :label="$t('form.role.hidden')"
        name="hidden"
      >
        <a-switch
          v-model:checked="formState.hidden"
          :checkedValue="1"
          :unCheckedValue="0"
        />
      </a-form-item>

      <a-form-item
        v-if="
          (formState?.id
            ? authStore.roles.includes('role-patch')
            : authStore.roles.includes('role-create')) ||
          authStore.code === 'admin'
        "
        :wrapper-col="{ span: 14, offset: 4 }"
      >
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
