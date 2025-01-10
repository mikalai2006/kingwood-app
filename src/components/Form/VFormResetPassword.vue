<script setup lang="ts">
import { register } from "@/api/auth";
import { resetPassword } from "@/api/auth";
import { IUser, IUserInput } from "@/api/user/types";
import { useOperationStore, usePostStore, useUserStore } from "@/store";
import { useRoleStore } from "@/store/modules/role";
import { transliterate } from "@/utils/translit";
import { randomIntFromInterval, replaceSubstringByArray } from "@/utils/utils";
import { Rule } from "ant-design-vue/es/form";
import { computed, reactive, ref, toRaw, UnwrapRef, watch } from "vue";
import { useI18n } from "vue-i18n";
import { PlusOutlined } from "@ant-design/icons-vue";
import { message, UploadProps } from "ant-design-vue";
import { ILoginData } from "@/api/auth/types";

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

const onSubmit = async () => {
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
    .catch((error: Error) => {
      message.error(
        // replaceSubstringByArray(t("form.message.errorSave"), [
        //   error?.message || "",
        // ])
        t(error?.message)
      );
      // console.log("error", error);
    });
};
const resetForm = () => {
  formRef.value.resetFields();
};
</script>
<template>
  <div>
    <div class="mb-4">{{ $t("form.user.password") }}: {{ password }}</div>
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
          <a-button type="primary" @click="onSubmit">
            {{ $t("form.user.resetPassword") }}
          </a-button>
          <a-button style="margin-left: 10px" @click="resetForm">
            {{ $t("form.reset") }}
          </a-button>
        </div>
      </a-form-item>
    </a-form>
  </div>
</template>
