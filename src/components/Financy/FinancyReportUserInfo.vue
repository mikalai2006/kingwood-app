<script setup lang="ts">
import { IOrder } from "@/api/order/types";
import { IPaneOptionFinancy } from "@/api/types";
import {
  useAuthStore,
  useObjectStore,
  useOrderStore,
  usePayStore,
  useUserStore,
  useWorkHistoryStore,
} from "@/store";
import dayjs from "@/utils/dayjs";
import { computed, onMounted, ref } from "vue";
import VIcon from "../UI/VIcon.vue";
import { IObject } from "@/api/object/types";
import { IPay } from "@/api/pay/types";

const props = defineProps<{
  pane: IPaneOptionFinancy;
}>();

const emit = defineEmits(["onEditPay"]);

const authStore = useAuthStore();
const userStore = useUserStore();

const user = computed(() =>
  userStore.items.find((x) => x.id == props.pane.workerId)
);
</script>

<template>
  <div>
    <p class="text-s-500 dark:text-g-400">
      {{ $t("page.financy.financyReport") }} {{ pane.title }}
    </p>
    <h1 class="text-s-800 dark:text-g-100 font-medium text-xl">
      {{ user?.name }}
    </h1>
    <!-- {{ JSON.stringify(user) }} -->
  </div>
</template>
