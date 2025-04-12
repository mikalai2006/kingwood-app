<script setup lang="ts" async>
import { onMounted } from "vue";
import dayjs from "@/utils/dayjs";
import { useAuthStore, useGeneralStore } from "@/store";
import { useI18n } from "vue-i18n";
import VIcon from "@/components/UI/VIcon.vue";
import { Dayjs } from "dayjs";
import VHeader from "@/components/V/VHeader.vue";
import { Colors } from "@/utils/colors";
import { useRoute, useRouter } from "vue-router";
import CmsAnalytic from "@/components/Cms/CmsAnalytic.vue";

dayjs.locale("ru");
const authStore = useAuthStore();
const generalStore = useGeneralStore();

const route = useRoute();
const router = useRouter();

const { t } = useI18n();

onMounted(() => {});
</script>
<template>
  <div class="flex-auto">
    <!-- <VTitle :text="$t('page.order.title')" /> -->
    <VHeader :title="$t('cms.page.cms-dashboard')">
      <template #back>&nbsp;</template>
      <template #header> </template>
    </VHeader>

    <div>
      <CmsAnalytic />
    </div>
  </div>
</template>
