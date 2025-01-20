<script setup lang="ts" async>
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useAuthStore, useGeneralStore, useNotifyStore } from "@/store";
import { INotifyInput } from "@/api/notify/types";
import NotifyList from "@/components/Notify/NotifyList.vue";
import { Colors } from "@/utils/colors";

const { t } = useI18n();

const notifyStore = useNotifyStore();
const authStore = useAuthStore();
const generalStore = useGeneralStore();

const onPatchNotify = async (id: string, data: INotifyInput) => {
  await notifyStore.patch(id, data);
};

const activeKey = ref("new");
</script>
<template>
  <div class="flex-auto p-4">
    <VHeader :title="$t('page.notify.title')" class="mb-4">
      <template #back>&nbsp;</template>
    </VHeader>
    <div class="max-w-screen-md">
      <a-tabs
        v-model:activeKey="activeKey"
        :tabBarStyle="{
          position: 'sticky',
          top: 0,
          'z-index': 50,
          background:
            generalStore.themeMode === 'dark' ? Colors.g[900] : Colors.white,
        }"
      >
        <a-tab-pane key="new" :tab="$t('tabs.notify.new')">
          <NotifyList
            :params="{
              status: 0,
              userTo: authStore.iam?.id ? [authStore.iam?.id] : undefined,
            }"
            key-list="new"
            @onPatchNotify="onPatchNotify"
          />
        </a-tab-pane>
        <a-tab-pane key="old" :tab="$t('tabs.notify.old')">
          <NotifyList
            :params="{
              status: 1,
              userTo: authStore.iam?.id ? [authStore.iam?.id] : undefined,
            }"
            key-list="old"
            @onPatchNotify="onPatchNotify"
          />
        </a-tab-pane>
      </a-tabs>
      <!-- <ul role="list" class="divide-y divide-s-100 dark:divide-g-700">
        <li
          v-for="noty in notifys"
          :key="noty.id"
          class="flex justify-between gap-x-6 py-3"
        >
          <div class="flex min-w-0 gap-x-4">
            <UserShortInfo :user-id="noty.userId" />
            <div class="min-w-0 flex-auto">
              <p class="text-sm text-s-900 dark:text-g-200 leading-5">
                {{ noty.message }}
              </p>
              <p class="mt-1 truncate text-xs text-g-400 dark:text-g-400">
                {{ dayjs(noty.createdAt).fromNow() }}
                <template v-if="noty.status === 1">
                  ({{ $t("button.readed") }} {{ dayjs(noty.readAt).fromNow() }})
                </template>
              </p>
            </div>
          </div>
          <div class="hidden shrink-0 sm:flex sm:flex-col sm:items-end">
            <a-button
              v-if="noty.status === 0"
              type="primary"
              @click="
                () => {
                  onPatchNotify(noty.id, {
                    status: 1,
                  });
                }
              "
            >
              {{ $t("button.read") }}
            </a-button>
          </div>
        </li>
      </ul> -->
    </div>
  </div>
</template>
