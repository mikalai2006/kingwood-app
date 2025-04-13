<script setup lang="ts">
import dayjs from "@/utils/dayjs";
import { useI18n } from "vue-i18n";
import UserInfo from "@/components/User/UserInfo.vue";
import { dateTimeFullFormat } from "@/utils/date";
import { INotify } from "@/api/notify/types";

defineProps<{
  notify: INotify;
}>();

const emit = defineEmits(["onPatchItem", "onRemoveItem"]);

const { t } = useI18n();
</script>

<template>
  <a-form class="p-6" name="basic" layout="vertical">
    <a-form-item :label="$t('table.notify.userId')" name="userId">
      <UserInfo :user-id="notify.userId" />
    </a-form-item>

    <a-form-item :label="$t('table.notify.userTo')" name="userTo">
      <UserInfo :user-id="notify.userTo" />
    </a-form-item>

    <a-form-item :label="$t('table.notify.title')" name="title">
      <a-textarea v-model:value="notify.title" readonly :rows="1" />
    </a-form-item>

    <a-form-item
      :label="$t('table.notify.message')"
      name="message"
      class="b-scroll"
    >
      <a-textarea v-model:value="notify.message" readonly :rows="4" />
    </a-form-item>

    <a-form-item>
      <div>
        {{ $t("table.notify.createdAt") }}:
        {{ dayjs(notify.createdAt).format(dateTimeFullFormat) }}
      </div>
    </a-form-item>

    <a-form-item>
      <div class="flex gap-4">
        <!-- <a-button
          type="primary"
          @click="emit('onPatchItem', { item: error, data: { status: 1 } })"
        >
          <p>
            {{ $t("button.checkView") }}
          </p>
        </a-button> -->
        <a-button type="primary" danger @click="emit('onRemoveItem', notify)">
          <p>
            {{ $t("button.delete") }}
          </p>
        </a-button>
      </div>
    </a-form-item>
  </a-form>
</template>
