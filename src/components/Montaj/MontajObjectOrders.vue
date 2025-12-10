<script setup lang="ts">
import { computed } from "vue";
import { useOrderStore } from "@/store";

const props = defineProps<{ objectId: string }>();
const emit = defineEmits(["onAddNewTaskWorker"]);

const orderStore = useOrderStore();

const ordersByObject = computed(() =>
  orderStore.items.filter(
    (x) => x.objectId === props.objectId && [1, 100].includes(x.status)
  )
);
</script>

<template>
  <div class="group">
    <a-popover placement="left">
      <template #title> Изделия для объекта </template>
      <template #content>
        <div>
          <div v-for="item in ordersByObject" class="font-normal leading-4">
            №{{ item.number }} {{ item.name }}
            <!-- | {{ item.status }} -->
          </div>
          <!-- <a-button v-for="item in workersForMontaj">
          {{ item.name }}
        </a-button> -->
        </div>
      </template>
      <p class="text-g-500 dark:text-g-400 inline">
        {{ $t("info.order_plural", ordersByObject.length) }}
      </p>
    </a-popover>
    <!-- <slot name="addButton" /> -->
    <div class="hidden group-hover:block absolute bottom-3 right-3">
      <!-- <a-tooltip
        placement="left"
        @click="emit('onAddNewTaskWorker', ordersByObject)"
      >
        <template #title> {{ $t("form.taskWorker.add") }} </template>
        <a-button size="small">
          <v-icon :path="iPlusLg" />
        </a-button>
      </a-tooltip> -->
    </div>
  </div>
</template>
