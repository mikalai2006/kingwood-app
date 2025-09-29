<script setup lang="ts">
import { IDoplata } from "@/api/types";
import { useI18n } from "vue-i18n";

const props = defineProps<{ item: IDoplata }>();
const emit = defineEmits(["edit", "delete"]);

const { t } = useI18n();
</script>
<template>
  <div
    class="flex flex-row items-center gap-4 border-b border-g-100 dark:border-g-800 p-2 rounded-lg bg-s-100 dark:bg-g-700 hover:bg-black/20 dark:hover:bg-black/20"
  >
    <div class="">
      <span v-for="(day, index) in item.days" class="text-md font-medium">
        {{ $t(`form.day.${day}`)
        }}<span v-if="index < item.days.length - 1">, </span>
      </span>
    </div>
    <div>>= {{ item.minHours }}{{ $t("form.user.dop.hours") }}</div>
    <div>
      {{ $t("form.user.dop.dop") }}
      {{ item.doplata }}
    </div>
    <div>
      <a-button
        class="mr-2"
        @click="
          () => {
            emit('edit', item);
          }
        "
      >
        {{ $t("button.edit") }}
      </a-button>
      <a-button
        @click="
          () => {
            emit('delete', item);
          }
        "
      >
        {{ $t("button.delete") }}
      </a-button>
    </div>
  </div>
</template>
