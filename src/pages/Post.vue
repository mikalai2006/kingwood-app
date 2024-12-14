<script setup lang="ts" async>
import { useUserStore } from "@/store/modules/user";
import { computed, ref } from "vue";
import dayjs from "@/utils/dayjs";
import { usePostStore } from "@/store";
import { IPost } from "@/api/post/types";
import VFormPost from "@/components/Form/VFormPost.vue";
import { invertColor } from "@/utils/utils";

dayjs.locale("ru");
const userStore = useUserStore();
const postStore = usePostStore();

await postStore.find({ $limit: 200 });

const columns = ref([
  { title: "name", dataIndex: "name", key: "name", fixed: true },
  {
    title: "updatedAt",
    dataIndex: "updatedAt",
    key: "updatedAt",
    fixed: false,
  },
  {
    title: "action",
    dataIndex: "action",
    key: "action",
    fixed: false,
  },
]);

const open = ref<boolean>(false);

const showModal = () => {
  open.value = true;
};

const columnsData = computed(() => {
  return postStore.items.map((x) => {
    return {
      ...x,
      key: x.id,
    };
  });
});
const defaultData: IPost = {
  name: "",
  sortOrder: 0,
};
const dataForm = ref(defaultData);

const onAddNewItem = () => {
  dataForm.value = defaultData;
  showModal();
};

const onEditItem = (item: IPost) => {
  console.log("item: ", item);

  dataForm.value = item;
  showModal();
};
</script>
<template>
  <div class="p-4">
    <VTitle :text="$t('page.post.title')" />
    <div class="my-2">
      <a-button type="primary" @click="onAddNewItem">{{
        $t("form.add")
      }}</a-button>
    </div>
    <a-table :columns="columns" :data-source="columnsData">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'action'">
          <a-button @click="onEditItem(record)">
            {{ $t("button.edit") }}
          </a-button>
        </template>
        <template v-if="column.key === 'name'">
          <a-tag
            :color="record.color"
            :style="{ color: invertColor(record.color, true) }"
            >{{ record.name }}</a-tag
          >
        </template>
      </template>

      <!-- <template #expandedRowRender="{ record }">
        <p style="margin: 0">
          {{ record.description }}
        </p>
      </template>
      <template #expandColumnTitle>
        <span style="color: red">More</span>
      </template> -->
    </a-table>
  </div>

  <a-modal
    v-model:open="open"
    :destroyOnClose="false"
    :key="dataForm.id"
    :title="$t('form.user.new')"
    :ok-button-props="{ hidden: true }"
    :cancel-button-props="{ hidden: true }"
  >
    <VFormPost
      :data="dataForm"
      :default-data="defaultData"
      @callback="
        () => {
          open = false;
        }
      "
    />
  </a-modal>
</template>

<style scoped></style>
