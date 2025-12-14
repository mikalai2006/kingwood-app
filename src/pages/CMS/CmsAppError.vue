<script setup lang="ts" async>
import { computed, ref, onMounted, h } from "vue";
import dayjs from "@/utils/dayjs";
import { useAppErrorStore } from "@/store";
import { useI18n } from "vue-i18n";
import { message } from "ant-design-vue";
import VIcon from "@/components/UI/VIcon.vue";
import { iCog } from "@/utils/icons";
import {
  IAppError,
  IAppErrorInput,
  IAppErrorListQuery,
} from "@/api/app_error/types";
import CmsAppErrorList from "@/components/Cms/Archive/CmsAppErrorList.vue";
import CmsAppErrorActive from "@/components/Cms/Archive/CmsAppErrorActive.vue";
import { replaceSubstringByArray } from "@/utils/utils";

dayjs.locale("ru");

const { t } = useI18n();

const appErrorStore = useAppErrorStore();

const userFilter = computed(() => {
  return appErrorStore.items.map((x) => {
    return {
      text: x.user.name,
      value: x.user.name,
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
    // sorter: (a: IAppError, b: IAppError) => a.name.localeCompare(b.name),
  },
  {
    key: "error",
  },
  {
    key: "status",
    filters: statusFilter.value,
    sorter: (a: IAppError, b: IAppError) => a.status - b.status,
    onFilter: (value: number, record: IAppError) => record.status === value,
  },
  {
    key: "createdAt",
    sorter: (a: IAppError, b: IAppError) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  },
  { key: "action" },
]);

const columnKeys = ref(["userId", "error", "status", "action"]);

const optionsForSelect = computed(() =>
  allColumns.value.map((x) => {
    return {
      label: t(`table.error.${x.key}`),
      value: x.key,
    };
  })
);

const columns = computed(() =>
  allColumns.value
    .filter((x) => columnKeys.value.includes(x.key))
    .map((x) => {
      return {
        title: t(`table.error.${x.key}`),
        dataIndex: x.key,
        key: x.key,
        showSorterTooltip: false,
        sorter: x.sorter,
        filters: x?.filters,
        onFilter: x?.onFilter,
        // fixed: x?.fixed,
        // width: x?.width,
      };
    })
);

const open = ref<boolean>(false);

const showModal = () => {
  open.value = true;
};

const loading = ref(false);

const onViewItem = (item: IAppError) => {
  activeError.value = Object.assign({}, item);
  showModal();
};

const onPatchItem = ({
  item,
  data,
}: {
  item: IAppError;
  data: IAppErrorInput;
}) => {
  console.log({
    item,
    data,
  });

  loading.value = true;
  appErrorStore
    .patch(item.id, data)
    .then(() => {
      message.success(t("message.errorViewOk"));
      open.value = false;
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

const OnRemoveList = async (items: IAppErrorListQuery) => {
  await appErrorStore
    .onRemoveList(items)
    .then(() => {
      // for (let i = 0; i < items.id.length; i++) {
      //   const removeIndex = notifys.value.findIndex((x) => x.id == items.id[i]);

      //   if (removeIndex != -1) {
      //     notifys.value = notifys.value.splice(removeIndex, 1);
      //   }
      // }
      message.success(
        replaceSubstringByArray(t("message.appErrorRemoveListOk"), [
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

const onRemoveItem = (item: IAppError) => {
  if (item.id) {
    appErrorStore
      .onRemove(item.id)
      .then(() => {
        message.success(t("message.errorRemoveOk"));
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

const nameKeyLocalStorageColumns = ref("apperror.column");
const onSetColumns = (value: string, key: string, data: string[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};

const activeError = ref<IAppError | null>(null);

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
    <VHeader :title="$t('cms.page.cms-apperror')">
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

    <CmsAppErrorList
      :columns="columns"
      key-list="current"
      :params="{
        // blocked: 0,
        // hidden: 0,
        // taskWorkers: { $gte: { $size: 1 } },
      }"
      @on-remove-item="onRemoveItem"
      @on-view-item="onViewItem"
      @on-patch-item="onPatchItem"
      @on-remove-list="OnRemoveList"
    />
  </div>

  <a-modal
    v-model:open="open"
    :destroyOnClose="true"
    :key="activeError?.id"
    :title="$t('table.error.view')"
    :ok-button-props="{ hidden: true }"
    :cancel-button-props="{ hidden: true }"
    style="margin: 0 auto; width: 800px"
    wrapClassName="b-scroll modal-user"
    :bodyStyle="{ margin: 0, padding: 0 }"
  >
    <CmsAppErrorActive
      v-if="activeError"
      :error="activeError"
      @on-patch-item="onPatchItem"
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
