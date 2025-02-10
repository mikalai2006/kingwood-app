<script setup lang="ts">
import { resetPassword } from "@/api/auth";
import { useOperationStore, usePostStore, useUserStore } from "@/store";
import { useRoleStore } from "@/store/modules/role";
import { Rule } from "ant-design-vue/es/form";
import { reactive, ref, toRaw, UnwrapRef } from "vue";
import { useI18n } from "vue-i18n";
import { message } from "ant-design-vue";
import { ILoginData } from "@/api/auth/types";
import { useError } from "@/composable/useError";

const props = defineProps<{ authId: string }>();
const emit = defineEmits(["callback"]);

const { t } = useI18n();
const roleStore = useRoleStore();
const userStore = useUserStore();
const postStore = usePostStore();
const operationStore = useOperationStore();

const formState: UnwrapRef<ILoginData> = reactive({
  password: "",
});
const formRef = ref();

const rules: Record<string, Rule[]> = {};

const password = ref("");

const { onGetValidateError } = useError();

const loading = ref(false);

const onSubmit = async () => {
  loading.value = true;

  await formRef.value
    .validate()
    .then(async () => {
      // console.log("values", formState, toRaw(formState));
      const data = toRaw(formState) as ILoginData;
      const newPassword = await resetPassword(props.authId, data);
      message.success(`${t("form.message.successSave")}: ${newPassword}`);
      password.value = newPassword;
      emit("callback");
    })
    .catch((error: any) => {
      if (error?.errorFields) {
        onGetValidateError(error);
      } else {
        message.error(t(error?.message));
      }
    })
    .finally(() => {
      loading.value = false;
    });
  // .catch((error: Error) => {
  //   message.error(
  //     // replaceSubstringByArray(t("form.message.errorSave"), [
  //     //   error?.message || "",
  //     // ])
  //     t(error?.message)
  //   );
  //   // console.log("error", error);
  // });
};
const resetForm = () => {
  formRef.value.resetFields();
};
</script>
<template>
  <div>
    <div v-if="password" class="mb-4">
      {{ $t("form.user.password") }}: {{ password }}
    </div>
    <a-form
      ref="formRef"
      layout="horizontal"
      style="max-width: 600px"
      :model="formState"
      :rules="rules"
    >
      <a-form-item :label="$t('form.auth.newPassword')" name="password">
        <a-input v-model:value="formState.password" />
      </a-form-item>

      <a-form-item :wrapper-col="{ span: 14, offset: 4 }">
        <div class="flex flex-row items-center gap-4">
          <a-button
            type="primary"
            :disabled="loading"
            :loading="loading"
            @click="onSubmit"
          >
            {{ $t("form.user.resetPassword") }}
          </a-button>
          <a-button
            :disabled="loading"
            style="margin-left: 10px"
            @click="resetForm"
          >
            {{ $t("form.reset") }}
          </a-button>
        </div>
      </a-form-item>
    </a-form>
  </div>
</template>
