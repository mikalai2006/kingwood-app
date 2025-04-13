<script setup lang="ts" async>
import { onMounted } from "vue";
import dayjs from "@/utils/dayjs";
import { useAuthStore, useGeneralStore } from "@/store";
import { useI18n } from "vue-i18n";
import VHeader from "@/components/V/VHeader.vue";
import { useRoute, useRouter } from "vue-router";
import CmsAnalyticActive from "@/components/Cms/CmsAnalyticActive.vue";
import CmsAnalyticActiveArchive from "@/components/Cms/CmsAnalyticActiveArchive.vue";

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

    <div class="flex flex-row flex-wrap p-4 gap-4">
      <CmsAnalyticActive />
      <CmsAnalyticActiveArchive />
    </div>
  </div>
</template>
