<script setup lang="ts">
import { computed, onMounted } from "vue";
import { IMessage } from "@/api/message/types";
import UserAvatar from "../User/UserAvatar.vue";
import dayjs from "@/utils/dayjs";
import { dateTimeFormat } from "@/utils/date";
import VImage from "../UI/VImage.vue";
import { useUserStore } from "@/store";
import { getShortFIO } from "@/utils/utils";

const props = defineProps<{
  message: IMessage;
}>();

const userStore = useUserStore();

const user = computed(() =>
  userStore.items.find((x) => x.id === props.message.userId)
);

onMounted(() => {});
</script>

<template>
  <div class="flex flex-row pb-4">
    <div class="shrink-0 grow-0">
      <UserAvatar :user-id="message.userId" />
    </div>
    <div class="px-4 text-black dark:text-white">
      <div class="relative bg-white dark:bg-g-700 p-4 rounded-md">
        <div
          class="absolute top-3 w-4 h-4 bg-white dark:bg-g-700 rotate-45 -left-1"
        ></div>
        <div class="flex flex-row gap-1">
          <template
            v-for="(img, index) in message.images"
            :key="index.toString()"
          >
            <VImage
              v-if="
                [
                  '.jpg',
                  '.jpeg',
                  '.png',
                  '.webp',
                  '.ico',
                  '.tif',
                  '.bmp',
                  '.gif',
                ].includes(img.ext)
              "
              :image="img"
              class="h-28 rounded-lg"
            />
            <VFile v-else :file="img" />
          </template>
        </div>

        <div class="py-2">
          {{ message?.message }}
        </div>

        <div class="text-sm text-g-300 dark:text-g-300">
          {{ getShortFIO(user?.name) }} /
          {{ dayjs(message.createdAt).format(dateTimeFormat) }} ({{
            dayjs(message.createdAt).fromNow()
          }})
        </div>
      </div>
    </div>
  </div>
</template>
