<script setup lang="ts">
import { reactive, ref } from "vue";
import VTitle from "../components/VTitle.vue";
import { useAuthStore } from "@/store";
import { useRouter } from "vue-router";
import { message } from "ant-design-vue";
import { useI18n } from "vue-i18n";
import { IFailedFinishForm, useError } from "@/composable/useError";

const router = useRouter();

const { t } = useI18n();

const authStore = useAuthStore();

interface FormState {
  login: string;
  password: string;
  remember: boolean;
}

const formState = reactive<FormState>({
  login: "",
  password: "",
  remember: true,
});

const { onGetValidateError } = useError();

const loading = ref(false);

const onFinish = async (values: any) => {
  loading.value = true;
  try {
    await authStore
      .login(formState)
      .then((r) => {
        router.replace("/").then(() => {
          // window.location.reload();
        });
        return r;
      })
      .catch((error: any) => {
        if (error?.message == "Failed to fetch") {
          throw new Error("error.notNet");
        } else if (error?.errorFields) {
          onGetValidateError(error);
        } else {
          throw new Error(JSON.stringify(error));
        }
      });
  } catch (e: any) {
    message.error(t(e?.message));
  } finally {
    loading.value = false;
  }
};

const onFinishFailed = (errorInfo: IFailedFinishForm) => {
  onGetValidateError(errorInfo);
};
</script>

<template>
  <div class="flex-auto flex flex-col items-center">
    <div class="p-4 rounded-lg mt-32">
      <!-- {{ authStore.tokenData?.refresh_token }} -->
      <div class="text-center mb-4"><VTitle text="Авторизация" /></div>
      <a-form
        :model="formState"
        name="basic"
        :label-col="{ span: 12 }"
        :wrapper-col="{ span: 12 }"
        autocomplete="off"
        @finish="onFinish"
        @finishFailed="onFinishFailed"
      >
        <a-form-item
          label="Логин (телефон)"
          name="login"
          :rules="[{ required: true, message: 'Введите ваш логин!' }]"
        >
          <a-input v-model:value="formState.login" />
        </a-form-item>

        <a-form-item
          label="Пароль"
          name="password"
          :rules="[{ required: true, message: 'Введите ваш пароль!' }]"
        >
          <a-input-password v-model:value="formState.password" />
        </a-form-item>

        <!-- <a-form-item name="remember" :wrapper-col="{ offset: 8, span: 16 }">
        <a-checkbox v-model:checked="formState.remember"
          >Remember me</a-checkbox
        >
      </a-form-item> -->

        <a-form-item :wrapper-col="{ offset: 8, span: 16 }">
          <a-button type="primary" :loading="loading" html-type="submit">
            Войти
          </a-button>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>

<style scoped></style>
