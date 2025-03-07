<script setup lang="ts">
import { computed, onMounted, ref, useTemplateRef } from "vue";
import { useInfiniteScroll, useScroll } from "@vueuse/core";

import {
  useAuthStore,
  useMessageStore,
  useObjectStore,
  useOrderStore,
} from "@/store";
import OrderMessage from "./OrderMessage.vue";
import OrderMessagesForm from "./OrderMessagesForm.vue";
import { useI18n } from "vue-i18n";

const props = defineProps<{
  orderId: string;
}>();

const { t } = useI18n();

const authStore = useAuthStore();
const objectStore = useObjectStore();
const orderStore = useOrderStore();
const messageStore = useMessageStore();

const order = computed(() =>
  orderStore.items.find((x) => x.id === props.orderId)
);

const el = useTemplateRef<HTMLElement>("el");
// const data = ref<IMessage[]>([]);
const noMoreContent = ref(false);
const { x, y, isScrolling, arrivedState, directions } = useScroll(el);
const scrollHeight = ref(0);
const distance = 10;

const onScrollAfterPush = (delay?: number) => {
  setTimeout(() => {
    el.value?.scroll({
      top: el.value.scrollHeight,
      behavior: "smooth",
    });
    scrollHeight.value = el.value?.scrollHeight || 0;
  }, delay || 0);
};

const onScrollTimeout = (delay?: number) => {
  setTimeout(() => {
    onSyncScroll();
  }, delay || 0);
};

const onSyncScroll = () => {
  el.value?.scroll({
    top: el.value.scrollHeight - scrollHeight.value - y.value,
    behavior: scrollHeight.value === 0 ? "smooth" : "auto",
  });
  scrollHeight.value = el.value?.scrollHeight || 0;
};

const messages = computed(() =>
  messageStore.items
    .filter((x) => x.orderId === props.orderId)
    .sort((a, b) =>
      a.createdAt.toString().localeCompare(b.createdAt.toString())
    )
);

const loading = ref(false);

const onLoadData = () => {
  loading.value = true;

  messageStore
    .find({
      orderId: [props.orderId],
      $sort: [{ key: "createdAt", value: -1 }],
      $skip: messages.value.length,
      $limit: distance,
    })
    .then((res) => {
      if (res.data?.length) {
        // data.value.unshift(...res.data.reverse());

        onScrollTimeout(scrollHeight.value === 0 ? 500 : 0);
      }
      if (!res.data || res.total == messages.value.length) {
        noMoreContent.value = true;
      }
      setTimeout(() => {
        loading.value = false;
      }, 500);
    });
};

// const { reset } = useInfiniteScroll(
//   el,
//   () => {
//     onLoadData();
//   },
//   {
//     distance,
//     interval: 500,
//     direction: "top",
//     canLoadMore: () => {
//       // inidicate when there is no more content to load so onLoadMore stops triggering
//       if (noMoreContent.value) return false;
//       return true; // for demo purposes
//     },
//   }
// );

onMounted(() => {
  onLoadData();
  // console.log("scroll: ", el.value?.clientHeight + el.value?.scrollHeight);
});
</script>

<template>
  <div class="flex flex-col items-stretch el overflow-hidden">
    <div ref="el" class="flex-auto overflow-auto b-scroll px-4 pt-4">
      <div class="flex items-center justify-center">
        <a-button
          v-if="!noMoreContent"
          :disabled="noMoreContent"
          :loading="loading"
          @click="onLoadData"
        >
          {{ t("button.loadPrevMessages") }}
        </a-button>
      </div>
      <div v-for="item in messages">
        <OrderMessage :message="item" :key="item.id" />
      </div>
      <div
        class="absolute inset-0 pointer-events-none flex items-center justify-center"
      >
        <a-spin :spinning="loading"> </a-spin>
      </div>
    </div>
    <div class="bg-s-200 dark:bg-g-800 p-2.5">
      <OrderMessagesForm
        :order-id="orderId"
        @submit-callback="
          (mes) => {
            // data.push(mes);
            onScrollAfterPush(100);
          }
        "
      />
    </div>
  </div>
</template>

<style scoped>
.el {
  height: calc(100vh - 90px);
}
</style>
