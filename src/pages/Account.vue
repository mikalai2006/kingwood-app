<script setup lang="ts" async>
import { IUserInput } from "@/api/user/types";
import VFormUser from "@/components/Form/VFormUser.vue";
import { useUserStore } from "@/store/modules/user";
import { computed, ref } from "vue";
import dayjs from "@/utils/dayjs";
import { useAuthStore } from "@/store";
import { useI18n } from "vue-i18n";

dayjs.locale("ru");
const userStore = useUserStore();
const authStore = useAuthStore();

const { t } = useI18n();

const userFromStore = computed<IUserInput>(
  () => userStore.items.find((x) => x.id === authStore.iam.id) || {}
);

const defaultData = computed(() => Object.assign({}, userFromStore.value));
const dataForm = ref(defaultData);
</script>

<template>
  <div class="flex-auto">
    <VHeader :title="$t('page.account.title')">
      <template #back>&nbsp;</template>
    </VHeader>
    <div>
      <VFormUser
        :data="dataForm"
        :default-data="defaultData"
        @callback="() => {}"
      ></VFormUser>
    </div>
  </div>
</template>
