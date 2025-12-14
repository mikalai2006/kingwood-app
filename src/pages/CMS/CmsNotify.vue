<script setup lang="ts" async>
import { computed, ref, onMounted, h } from "vue";
import dayjs from "@/utils/dayjs";
import { useNotifyStore, useUserStore } from "@/store";
import { useI18n } from "vue-i18n";
import { message } from "ant-design-vue";
import VIcon from "@/components/UI/VIcon.vue";
import { iCog } from "@/utils/icons";
import { INotify, INotifyListQuery } from "@/api/notify/types";
import CmsNotifyActive from "@/components/Cms/Archive/CmsNotifyActive.vue";
import CmsNotifyList from "@/components/Cms/Archive/CmsNotifyList .vue";
import { replaceSubstringByArray } from "@/utils/utils";
import { storeToRefs } from "pinia";

dayjs.locale("ru");

const { t } = useI18n();

const userStore = useUserStore();
const { getUserById } = storeToRefs(userStore);
const notifyStore = useNotifyStore();
const notifys = ref<INotify[]>([]);
const onSetItems = (data: INotify[]) => {
  notifys.value = [...data];
};

const userFilter = computed(() => {
  return userStore.items.map((x) => {
    // const user = getUserById.value(x.userId);
    return {
      text: x?.name,
      value: x?.id,
    };
  });
});

const userRecepientFilter = computed(() => {
  return userStore.items.map((x) => {
    // const user = getUserById.value(x.userTo);
    return {
      text: x?.name,
      value: x?.id,
    };
  });
});

const statusFilter = computed(() => {
  return [0, 1].map((x) => {
    return {
      text: t(`error.status.${x}`),
      value: x,
    };
  });
});

const allColumns = computed(() => [
  {
    key: "userId",
    filters: userFilter.value,
    width: 200,
    onFilter: (value: string, record: INotify) => record.userId === value,
  },
  {
    key: "userTo",
    width: 200,
    filters: userRecepientFilter.value,
    onFilter: (value: string, record: INotify) => record.userTo === value,
  },
  {
    key: "title",
  },
  {
    key: "message",
  },
  {
    key: "status",
    filters: statusFilter.value,
    sorter: (a: INotify, b: INotify) => a.status - b.status,
    onFilter: (value: number, record: INotify) => record.status === value,
  },
  {
    key: "createdAt",
    sorter: (a: INotify, b: INotify) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  },
  { key: "action" },
]);

const columnKeys = ref([
  "userId",
  "userTo",
  "title",
  "message",
  "status",
  "action",
]);

const optionsForSelect = computed(() =>
  allColumns.value.map((x) => {
    return {
      label: t(`table.notify.${x.key}`),
      value: x.key,
    };
  })
);

const columns = computed(() =>
  allColumns.value
    .filter((x) => columnKeys.value.includes(x.key))
    .map((x) => {
      return {
        title: t(`table.notify.${x.key}`),
        dataIndex: x.key,
        key: x.key,
        showSorterTooltip: false,
        sorter: x.sorter,
        filters: x?.filters,
        onFilter: x?.onFilter,
        // fixed: x?.fixed,
        width: x?.width,
        children: [],
      };
    })
);

const open = ref<boolean>(false);

const showModal = () => {
  open.value = true;
};

const activeItem = ref<INotify | null>(null);

const loading = ref(false);

const onViewItem = (item: INotify) => {
  activeItem.value = Object.assign({}, item);
  showModal();
};

// const onPatchItem = ({
//   item,
//   data,
// }: {
//   item: IAppError;
//   data: IAppErrorInput;
// }) => {
//   console.log({
//     item,
//     data,
//   });

//   loading.value = true;
//   appErrorStore
//     .patch(item.id, data)
//     .then(() => {
//       message.success(t("message.errorViewOk"));
//       open.value = false;
//     })
//     .catch((error: any) => {
//       message.error(error);
//       throw new Error(error);
//     })
//     .finally(() => {
//       loading.value = false;
//       open.value = false;
//     });
// };

const onRemoveItem = (item: INotify) => {
  if (item.id) {
    notifyStore
      .onRemove(item.id)
      .then(() => {
        const removeIndex = notifys.value.findIndex((x) => x.id == item.id);

        if (removeIndex != -1) {
          notifys.value = notifys.value.splice(removeIndex, 1);
        }
        message.success(t("message.notifyRemoveOk"));
      })
      .catch((error: any) => {
        message.error(error);
        throw new Error(error);
      })
      .finally(() => {
        loading.value = false;
        open.value = false;
      });
  }
};

const OnRemoveList = async (items: INotifyListQuery) => {
  await notifyStore
    .onRemoveList(items)
    .then(() => {
      // for (let i = 0; i < items.id.length; i++) {
      //   const removeIndex = notifys.value.findIndex((x) => x.id == items.id[i]);

      //   if (removeIndex != -1) {
      //     notifys.value = notifys.value.splice(removeIndex, 1);
      //   }
      // }
      notifys.value = notifys.value.filter((x) => !items.id.includes(x.id));
      message.success(
        replaceSubstringByArray(t("message.notifyRemoveListOk"), [
          items.id?.length,
        ])
      );
    })
    .catch((error: any) => {
      message.error(error);
      throw new Error(error);
    })
    .finally(() => {
      loading.value = false;
      open.value = false;
    });
};

const nameKeyLocalStorageColumns = ref("archiveNotify.column");
const onSetColumns = (value: string, key: string, data: string[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};

onMounted(() => {
  // sync columns from localStorage.
  const _columns = localStorage.getItem(nameKeyLocalStorageColumns.value);
  if (_columns) {
    columnKeys.value = JSON.parse(_columns);
  }
});
</script>
<template>
  <div class="flex-auto relative">
    <VHeader :title="$t('cms.page.cms-notify')">
      <template #back> &nbsp; </template>
      <template #header>
        <div class="flex flex-row items-center">
          <div class="flex-auto"></div>
          <div class="flex gap-2">
            <a-popover
              :title="$t('table.order.fields')"
              trigger="click"
              placement="topRight"
            >
              <template #content>
                <!-- <span class="whitespace-nowrap">
                  {{ $t("table.order.fields") }}
                </span> -->
                <a-select
                  v-model:value="columnKeys"
                  mode="multiple"
                  style="width: 100%; min-width: 200px"
                  :placeholder="$t('table.order.fields')"
                  :max-tag-count="3"
                  :removeIcon="null"
                  :options="optionsForSelect"
                  @change="(value: string) => onSetColumns(value,nameKeyLocalStorageColumns,columnKeys)"
                >
                  <template #maxTagPlaceholder="omittedValues">
                    <span style="color: red"
                      >+ {{ omittedValues.length }} ...</span
                    >
                  </template>
                  <!-- <template #option="{ value, label }">
            {{ label }}
          </template> -->
                  <!-- <a-select-option
            v-for="col in columns"
            :value="col.key"
            :label="$t(`tabs.order.${col.key}`)"
          >
            <span role="img" aria-label="Japan">🇯🇵</span>
            {{ $t(`tabs.order.${col.key}`) }}
          </a-select-option> -->
                </a-select>
              </template>
              <a-button type="text">
                <VIcon :path="iCog" class="text-lg" />
              </a-button>
            </a-popover>
          </div>
        </div>
      </template>
    </VHeader>

    <CmsNotifyList
      :columns="columns"
      key-list="current"
      :params="{}"
      :items="notifys"
      @on-remove-item="onRemoveItem"
      @on-view-item="onViewItem"
      @on-set-items="onSetItems"
      @on-remove-list="OnRemoveList"
    />
  </div>

  <a-modal
    v-model:open="open"
    :destroyOnClose="true"
    :key="activeItem?.id"
    :title="$t('table.error.view')"
    :ok-button-props="{ hidden: true }"
    :cancel-button-props="{ hidden: true }"
    style="margin: 0 auto; width: 800px"
    wrapClassName="b-scroll modal-user"
    :bodyStyle="{ margin: 0, padding: 0 }"
  >
    <CmsNotifyActive
      v-if="activeItem"
      :notify="activeItem"
      @on-remove-item="onRemoveItem"
    />
  </a-modal>
</template>

<style>
.modal-user {
  .ant-modal-content {
    padding: 0;
  }
  .ant-modal-header {
    padding: 15px;
    margin: 0;
    background-color: #00000010 !important;
  }
  .ant-tabs-nav {
    background-color: #00000010 !important;
  }
}
</style>
