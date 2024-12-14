<script setup lang="ts" async>
import { IUser, IUserInput } from "@/api/user/types";
import VFormUser from "@/components/Form/VFormUser.vue";
import { useUserStore } from "@/store/modules/user";
import { computed, reactive, ref, toRaw, UnwrapRef } from "vue";
import dayjs from "@/utils/dayjs";
import { DownOutlined } from "@ant-design/icons-vue";
import {
  useAuthStore,
  usePostStore,
  useTaskStore,
  useTaskWorkerStore,
} from "@/store";
import UserTask from "@/components/User/UserTask.vue";
import { invertColor } from "@/utils/utils";
import { useI18n } from "vue-i18n";
import VImg from "@/components/UI/VImg.vue";

dayjs.locale("ru");
const userStore = useUserStore();
const postStore = usePostStore();
const authStore = useAuthStore();

const { t } = useI18n();

const defaultData: IUserInput = computed(() =>
  Object.assign(
    {},
    userStore.items.find((x) => x.id === authStore.iam.id)
  )
);
const dataForm = ref(defaultData);

const activeKey = ref("current");
</script>
<template>
  <div>{{ $t("page.account.title") }}</div>
  <div class="mx-auto max-w-screen-md">
    <VFormUser
      :data="dataForm"
      :default-data="defaultData"
      @callback="() => {}"
    ></VFormUser>
  </div>
</template>
