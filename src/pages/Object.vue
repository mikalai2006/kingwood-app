<script setup lang="ts" async>
import { useUserStore } from "@/store/modules/user";
import { computed, h, ref } from "vue";
import dayjs from "@/utils/dayjs";
import { useAuthStore, useObjectStore, usePostStore } from "@/store";
import { IPost } from "@/api/post/types";
import VFormPost from "@/components/Form/VFormPost.vue";
import { invertColor, replaceSubstringByArray } from "@/utils/utils";
import { IObject, IObjectInput } from "@/api/object/types";
import VFormObject from "@/components/Form/VFormObject.vue";
import { useI18n } from "vue-i18n";
import { iArrowRight, iPen, iTrashFill, iWraningTriangle } from "@/utils/icons";
import VIcon from "@/components/UI/VIcon.vue";
import { message, Modal } from "ant-design-vue";

const { t } = useI18n();

dayjs.locale("ru");
const userStore = useUserStore();
const authStore = useAuthStore();
const objectStore = useObjectStore();

await objectStore.find({ $limit: 1000 });

const columns = ref([
  {
    title: t("table.object.name"),
    dataIndex: "name",
    key: "name",
    fixed: true,
  },
  {
    title: t("table.object.createdAt"),
    dataIndex: "createdAt",
    key: "createdAt",
    fixed: false,
  },
  {
    title: t("table.object.updatedAt"),
    dataIndex: "updatedAt",
    key: "updatedAt",
    fixed: false,
  },
  {
    title: t("table.object.action"),
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
  return objectStore.items
    .filter((x) => x.id != "000000000000000000000000")
    .map((x) => {
      return {
        ...x,
        key: x.id,
      };
    });
});
const defaultData: IObjectInput = {};
const dataForm = ref(defaultData);

const onAddNewItem = () => {
  dataForm.value = Object.assign({}, defaultData);
  showModal();
};

const onEditItem = (item: IObject) => {
  console.log("Edit object item: ", item);

  dataForm.value = Object.assign({}, item);
  showModal();
};

const onDeleteItem = (item: IObject | undefined) => {
  Modal.confirm({
    // transitionName: "",
    icon: null,
    content: h(
      "div",
      {
        class: "flex flex-row items-start gap-4",
      },
      [
        h(VIcon, {
          path: iWraningTriangle,
          class: "flex-none text-4xl text-red-500 dark:text-red-400",
        }),
        h(
          "div",
          {
            class: "flex-auto",
          },
          [
            h(
              "div",
              { class: "text-lg font-bold text-red-500 dark:text-red-400" },
              t("form.task.delete")
            ),
            h(
              "div",
              {},
              replaceSubstringByArray(t("message.removeObject"), [item?.name])
            ),
          ]
        ),
      ]
    ),
    okButtonProps: { type: "primary", danger: true },
    okText: t("button.delete"),
    cancelText: t("button.cancel"),
    onOk() {
      return new Promise((resolve, reject) => {
        try {
          item?.id &&
            objectStore
              .deleteItem(item.id)
              .then((res) => {
                message.success(
                  replaceSubstringByArray(t("message.deleteTaskOk"), [
                    res?.name,
                  ])
                );
              })
              .finally(() => {
                resolve("");
              });
        } catch (e) {
          message.error("Error: delete object");
        }
      }).catch(() => console.log("Oops errors!"));
    },
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onCancel() {},
  });

  // console.log("Delete task: ", item);
  // //   await emit("onDeleteTask", item);
  // return new Promise((resolve) => {
  //   setTimeout(() => resolve(true), 3000);
  // });
};
</script>
<template>
  <div class="flex-auto p-4">
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
    <a-table :columns="columns" :data-source="columnsData" rowClassName="group">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'action'">
          <!-- <a-tooltip>
            <template #title>
              {{ $t("form.object.edit") }}
            </template>

            <a-button type="link" @click="onEditItem(record)">
              <VIcon :path="iPen" class="text-s-400 dark:text-g-300" />
            </a-button>
          </a-tooltip> -->
          <div class="invisible group-hover:visible">
            <a-tooltip v-if="authStore.roles.includes('object-patch')">
              <template #title>
                {{ $t("form.object.edit") }}
              </template>
              <a-button type="text" @click="(e: Event) => {onEditItem(record)}">
                <VIcon :path="iPen" />
              </a-button>
            </a-tooltip>

            <a-tooltip v-if="authStore.roles.includes('object-delete')">
              <template #title>
                {{ $t("button.delete") }}
              </template>
              <a-button
                danger
                type="link"
                @click="(e: Event) => {onDeleteItem(record)}"
              >
                <VIcon :path="iTrashFill" />
              </a-button>
            </a-tooltip>
          </div>
        </template>
        <template v-if="column.key === 'createdAt'">
          <div>
            {{ dayjs(record.createdAt).fromNow() }}
          </div>
        </template>
        <template v-if="column.key === 'updatedAt'">
          <div>
            {{ dayjs(record.createdAt).fromNow() }}
          </div>
        </template>
        <template v-if="column.key === 'name'">
          <RouterLink
            :to="{
              name: 'objectOrderId',
              params: {
                objectId: record.id,
              },
            }"
            class="flex items-center gap-2"
          >
            {{ record.name }}
            <VIcon :path="iArrowRight" />
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
