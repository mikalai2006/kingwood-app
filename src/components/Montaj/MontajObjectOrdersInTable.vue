<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useOrderStore, useUserStore } from "@/store";
import VIcon from "../UI/VIcon.vue";
import { iPlusLg } from "@/utils/icons";
import useOrder from "@/composable/useOrder";
import OrderList from "../Order/OrderList.vue";

const props = defineProps<{ objectId: string }>();
const emit = defineEmits(["onAddNewTaskWorker"]);

const userStore = useUserStore();
const orderStore = useOrderStore();

const { onEditItem } = useOrder();

// const onFindOrders = async () => {
//   await orderStore.find({ objectId: [props.objectId] });
// };

// onMounted(async () => {
//   await onFindOrders();
// });

const ordersByObject = computed(() =>
  orderStore.items.filter(
    (x) => x.objectId === props.objectId && [1, 100].includes(x.status)
  )
);

const keyList = computed(() => `${props.objectId}_listOrders`);
</script>

<template>
  <!-- <div class="group">
    <div>
      <div v-for="item in ordersByObject" class="font-normal leading-4">
        №{{ item.number }} {{ item.name }}
        | {{ item.status }}
      </div>
    </div>
    <div class="hidden group-hover:block absolute bottom-3 right-3">
      <a-tooltip
        placement="left"
        @click="emit('onAddNewTaskWorker', ordersByObject)"
      >
        <template #title> {{ $t("form.taskWorker.add") }} </template>
        <a-button size="small">
          <v-icon :path="iPlusLg" />
        </a-button>
      </a-tooltip>
    </div>
  </div> -->

  <OrderList
    keyList="keyList"
    :keyColumns="keyList"
    :params="{
      objectId: [objectId],
      status: [1, 100],
    }"
    @on-edit-item="onEditItem"
  />
</template>
