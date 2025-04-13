<script setup lang="ts">
import { useAppErrorStore } from "@/store";
import dayjs from "@/utils/dayjs";
import { useI18n } from "vue-i18n";
import { IAppError } from "@/api/app_error/types";
import UserInfo from "@/components/User/UserInfo.vue";
import { dateTimeFullFormat } from "@/utils/date";

defineProps<{
  error: IAppError;
}>();

const emit = defineEmits(["onPatchItem", "onRemoveItem"]);

const { t } = useI18n();

const appErrorStore = useAppErrorStore();
</script>

<template>
  <a-form class="p-6" name="basic" layout="vertical">
    <a-form-item :label="$t('table.error.userId')" name="code">
      <UserInfo :user-id="error.userId" />
    </a-form-item>

    <a-form-item :label="$t('table.error.error')" name="error">
      <a-textarea v-model:value="error.error" readonly :rows="4" />
    </a-form-item>

    <a-form-item :label="$t('table.error.stack')" name="stack" class="b-scroll">
      <a-textarea v-model:value="error.stack" readonly :rows="10" />
    </a-form-item>

    <a-form-item :label="$t('table.error.code')" name="code">
      <a-input v-model:value="error.code" readonly :rows="4" />
    </a-form-item>

    <a-form-item>
      <div>
        {{ $t("table.error.createdAt") }}:
        {{ dayjs(error.createdAt).format(dateTimeFullFormat) }}
      </div>
    </a-form-item>

    <a-form-item>
      <div class="flex gap-4">
        <a-button
          type="primary"
          @click="emit('onPatchItem', { item: error, data: { status: 1 } })"
        >
          <p>
            {{ $t("button.checkView") }}
          </p>
        </a-button>
        <a-button type="primary" danger @click="emit('onRemoveItem', error)">
          <p>
            {{ $t("button.delete") }}
          </p>
        </a-button>
      </div>
    </a-form-item>
  </a-form>
</template>
