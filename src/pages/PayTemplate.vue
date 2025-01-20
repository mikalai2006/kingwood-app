<script setup lang="ts" async>
import { computed, ref } from "vue";
import dayjs from "@/utils/dayjs";
import { useAuthStore, usePayTemplateStore } from "@/store";
import { invertColor } from "@/utils/utils";
import VTitle from "@/components/VTitle.vue";
import { useI18n } from "vue-i18n";
import { IPayTemplateInput } from "@/api/pay_template/types";
import VFormPayTemplate from "@/components/Form/VFormPayTemplate.vue";

dayjs.locale("ru");
const { t } = useI18n();

const authStore = useAuthStore();
const payTemplateStore = usePayTemplateStore();

await payTemplateStore.find({ $limit: 200 });

const columns = ref([
  {
    title: t("table.payTemplate.name"),
    dataIndex: "name",
    key: "name",
    fixed: false,
  },
  {
    title: t("table.payTemplate.description"),
    dataIndex: "description",
    key: "description",
    fixed: false,
  },
  {
    title: t("table.payTemplate.total"),
    dataIndex: "total",
    key: "total",
    fixed: false,
  },
  {
    title: t("table.payTemplate.action"),
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
  return payTemplateStore.items.map((x) => {
    return {
      ...x,
      key: x.id,
    };
  });
});
const defaultData: IPayTemplateInput = {};
const dataForm = ref(defaultData);

const onAddNewItem = () => {
  dataForm.value = defaultData;
  showModal();
};

const onEditItem = (item: IPayTemplateInput) => {
  console.log("edit payTemplate: ", item);

  dataForm.value = item;
  showModal();
};
</script>
<template>
  <div class="flex-auto p-4">
    <VTitle :text="$t('page.payTemplate.title')" />
    <div class="my-2">
      <a-tooltip v-if="authStore.roles.includes('payTemplate-create')">
        <template #title>
          {{ $t("form.payTemplate.new") }}
        </template>
        <a-button type="primary" @click="onAddNewItem">
          {{ $t("form.add") }}
        </a-button>
      </a-tooltip>
    </div>
    <a-table :columns="columns" :data-source="columnsData">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'action'">
          <a-button
            v-if="authStore.roles.includes('payTemplate-patch')"
            @click="onEditItem(record)"
          >
            {{ $t("button.edit") }}
          </a-button>
        </template>
        <template v-if="column.key === 'name'">
          {{ record.name }}
        </template>
        <template v-if="column.key === 'updatedAt'">
          {{ dayjs(record.updatedAt).fromNow() }}
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
    destroyOnClose
    :key="dataForm.id"
    :title="
      dataForm?.id ? $t('form.payTemplate.edit') : $t('form.payTemplate.new')
    "
    :ok-button-props="{ hidden: true }"
    :cancel-button-props="{ hidden: true }"
  >
    <VFormPayTemplate
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
