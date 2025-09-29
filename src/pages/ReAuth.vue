<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import VTitle from "../components/VTitle.vue";
import { useAuthStore } from "@/store";
import { useRouter } from "vue-router";
import { message } from "ant-design-vue";
import { useI18n } from "vue-i18n";
import { IFailedFinishForm, useError } from "@/composable/useError";
import { IAuthData } from "@/api/auth/types";

const router = useRouter();

const { t, te } = useI18n();

const authStore = useAuthStore();

const formState = reactive<IAuthData>({ ...authStore.authData });

const { onGetValidateError } = useError();

const loading = ref(false);

const onFinish = async (values: any) => {
  loading.value = true;
  try {
    await authStore
      .login(formState)
      .then((r) => {
        if (formState.remembe) {
          const _data = { ...formState, password: "" };
          authStore.setAuthData(_data);

          localStorage.setItem("remembe", JSON.stringify(_data));
        } else {
          const _data = {
            login: "",
            password: "",
            remembe: false,
          };
          authStore.setAuthData(_data);
          localStorage.setItem("remembe", JSON.stringify(_data));
        }
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
          throw new Error(JSON.stringify(error.message));
        }
      });
  } catch (e: any) {
    // console.log(typeof e, typeof e.message);

    // message.error(te(e?.message) ? t(e?.message) : e?.message);
    throw e;
  } finally {
    loading.value = false;
  }
};

const onFinishFailed = (errorInfo: IFailedFinishForm) => {
  onGetValidateError(errorInfo);
};

onMounted(async () => {
  const tokens = await authStore.refreshToken();

  if (tokens?.access_token) {
    setTimeout(OnReturnToLastPage, 1500);
  }
});

function OnReturnToLastPage() {
  router.replace(authStore.pageBeforeRefreshToken);
}
</script>

<template>
  <div class="flex-auto flex flex-col items-center">
    <div class="p-4 rounded-lg mt-32">
      <!-- {{ authStore.tokenData?.refresh_token }} -->
      <div class="text-center mb-4">
        <VTitle text="Обновление токена доступа!" />
      </div>
      dsd
      <a-spin size="small" />
      <!-- <a-form
        :model="formState"
        name="basic"
        :label-col="{ span: 12 }"
        :wrapper-col="{ span: 12 }"
        autocomplete="off"
        @finish="onFinish"
        @finishFailed="onFinishFailed"
      >
        <a-form-item
          :label="$t('form.auth.login')"
          name="login"
          :rules="[{ required: true, message: 'Введите ваш логин!' }]"
        >
          <a-input v-model:value="formState.login" />
        </a-form-item>

        <a-form-item
          :label="$t('form.auth.password')"
          name="password"
          :rules="[{ required: true, message: 'Введите ваш пароль!' }]"
        >
          <a-input-password v-model:value="formState.password" />
        </a-form-item>

        <a-form-item name="remember" :wrapper-col="{ offset: 8, span: 16 }">
          <a-checkbox v-model:checked="formState.remembe">
            {{ $t("form.auth.remembe") }}
          </a-checkbox>
        </a-form-item>

        <a-form-item :wrapper-col="{ offset: 8, span: 16 }">
          <a-button type="primary" :loading="loading" html-type="submit">
            Войти
          </a-button>
        </a-form-item>
      </a-form> -->
    </div>
  </div>
</template>

<style scoped></style>
