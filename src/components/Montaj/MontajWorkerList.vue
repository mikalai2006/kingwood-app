<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import draggable from "vuedraggable";
import { useOperationStore, usePostStore, useUserStore } from "@/store";
import { IUser } from "@/api/user/types";

const emit = defineEmits(["onEndDrag"]);

const userStore = useUserStore();
const operationStore = useOperationStore();
const postStore = usePostStore();

const idsInstallOperation = computed(() =>
  operationStore.items.filter((x) => x.group === "install").map((x) => x.id)
);

const workersForMontaj = ref<IUser[]>([]);
//  computed(() =>
//   userStore.items.filter((x) =>
//     x.typeWork?.some((r) => idsInstallOperation.value.includes(r))
//   )
// );

const typePost = ref("");

const posts = computed(() =>
  postStore.items.map((x) => {
    return {
      value: x.id,
      label: x.name,
    };
  })
);

const onFindUsers = () => {
  workersForMontaj.value = userStore.items.filter(
    (x) =>
      // x.typeWork?.some((r) => idsInstallOperation.value.includes(r))
      x.postId === typePost.value
  );
};

onMounted(async () => {
  typePost.value = postStore.items.find((x) => x.name.startsWith("Монтаж"))?.id;

  await onFindUsers();
});
</script>

<template>
  <div>
    <div class="p-4">
      <a-form-item :label="$t('form.montaj.typePost')" name="typeGo">
        <a-select
          v-model:value="typePost"
          style="width: 100%"
          :placeholder="$t('form.montaj.selectTypePost')"
          :options="posts"
          @change="onFindUsers"
        ></a-select>
      </a-form-item>
    </div>
    <draggable
      class="dragArea list-group"
      :list="workersForMontaj"
      group="people"
      item-key="id"
      @end="$emit('onEndDrag', $event)"
    >
      <template #item="{ element }">
        <div class="list-group-item px-4 pb-1 text-base cursor-move">
          {{ element.name }}
        </div>
      </template>
    </draggable>
    <!-- <a-button v-for="item in workersForMontaj">
      {{ item.name }}
    </a-button> -->
  </div>
</template>
