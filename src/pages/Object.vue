<script setup lang="ts" async>
import { useUserStore } from "@/store/modules/user";
import { computed, ref } from "vue";
import dayjs from "@/utils/dayjs";
import { useObjectStore, usePostStore } from "@/store";
import { IPost } from "@/api/post/types";
import VFormPost from "@/components/Form/VFormPost.vue";
import { invertColor } from "@/utils/utils";
import { IObject, IObjectInput } from "@/api/object/types";
import VFormObject from "@/components/Form/VFormObject.vue";

dayjs.locale("ru");
const userStore = useUserStore();
const objectStore = useObjectStore();

await objectStore.find({ $limit: 1000 });

const columns = ref([
  { title: "name", dataIndex: "name", key: "name", fixed: true },
  {
    title: "updatedAt",
    dataIndex: "updatedAt",
    key: "updatedAt",
    fixed: false,
  },
  {
    title: "createdAt",
    dataIndex: "createdAt",
    key: "createdAt",
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
  return objectStore.items.map((x) => {
    return {
      ...x,
      key: x.id,
    };
  });
});
const defaultData: IObjectInput = {};
const dataForm = ref(defaultData);

const onAddNewItem = () => {
  dataForm.value = defaultData;
  showModal();
};

const onEditItem = (item: IObject) => {
  console.log("Edit object item: ", item);

  dataForm.value = item;
  showModal();
};
</script>
<template>
  <div class="p-4">
    <VTitle :text="$t('page.object.title')" />
    <div class="my-2">
      <a-tooltip>
        <template #title>
          {{ $t("form.object.new") }}
        </template>
        <a-button type="primary" @click="onAddNewItem">{{
          $t("form.add")
        }}</a-button>
      </a-tooltip>
    </div>
    <a-table :columns="columns" :data-source="columnsData">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'action'">
          <a-tooltip>
            <template #title>
              {{ $t("form.object.edit") }}
            </template>
            <a-button @click="onEditItem(record)">
              {{ $t("button.edit") }}
            </a-button>
          </a-tooltip>
        </template>
        <template v-if="column.key === 'name'">
          <RouterLink
            :to="{
              name: 'objectOrderId',
              params: {
                objectId: record.id,
              },
            }"
          >
            {{ record.name }}
          </RouterLink>
          <!-- <a-tag :bordered="false">
          </a-tag> -->
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
    :title="$t('form.object.new')"
    :ok-button-props="{ hidden: true }"
    :cancel-button-props="{ hidden: true }"
  >
    <VFormObject
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
