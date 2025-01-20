<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import draggable from "vuedraggable";
import { useOrderStore, useUserStore } from "@/store";

const props = defineProps<{ objectId: string }>();

const userStore = useUserStore();
const orderStore = useOrderStore();

const onFindOrders = async () => {
  await orderStore.find({ objectId: [props.objectId] });
};

onMounted(async () => {
  await onFindOrders();
});

const ordersByObject = computed(() =>
  orderStore.items.filter((x) => x.objectId === props.objectId)
);
</script>

<template>
  <div>
    <div v-for="item in ordersByObject" class="font-normal leading-4">
      №{{ item.number }} {{ item.name }} | {{ item.status }}
    </div>
    <!-- <a-button v-for="item in workersForMontaj">
      {{ item.name }}
    </a-button> -->
  </div>
</template>
