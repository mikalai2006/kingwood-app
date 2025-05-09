<script setup lang="ts">
import { computed, h, onMounted, reactive, ref } from "vue";
import dayjs from "@/utils/dayjs";

import { useAuthStore, useNotifyStore, useUserStore } from "@/store";
import { useI18n } from "vue-i18n";
import sift from "sift";
import UserShortInfo from "../User/UserShortInfo.vue";
import { IArchiveNotify, IArchiveNotifyFilter } from "@/api/archive/types";
import { findArchiveNotify } from "@/api/archive";

const props = defineProps<{
  keyList: string;
  params: IArchiveNotifyFilter;
}>();

const emit = defineEmits(["onPatchNotify"]);

const { t } = useI18n();

const authStore = useAuthStore();

const siftParams = computed(() => {
  const _result = Object.fromEntries(
    Object.entries(props.params).map(([key, value]) => {
      if (typeof value === "object" && value?.length) {
        return [key, { $in: value }];
      }
      // else if (["$sort"].includes(key)) {
      //   return [];
      // }
      else {
        return [key, value];
      }
    })
  );
  return _result;
});

const loading = ref(true);
const sort = ref([]);

const onChangePagination = async (_page: number, _pageSize: number) => {
  // console.log("load ", _page, _pageSize, _pageSize * _page - 1);
  pagination.value.current = _page;
  pagination.value.pageSize = _pageSize;
  onQueryData();
};
const pagination = ref({
  total: 10,
  current: 1,
  pageSize: 10,
  onChange: (page: number) => {
    onChangePagination(page, 10);
  },
});

const onQueryData = async () => {
  loading.value = true;

  await findArchiveNotify({
    ...props.params,
    $limit: pagination.value.pageSize,
    $skip: Math.max(
      pagination.value.pageSize * (pagination.value.current - 1) - 1,
      0
    ),
    // $sort: [
    //   {
    //     key: "readAt",
    //     value: 1,
    //   },
    // ],
    // $sort: sort.value.map((x) => {
    //   return {
    //     key: x.field,
    //     value: x.order,
    //   };
    // }),
  })
    .then((result) => {
      pagination.value.total = result.total;
      if (result.data) {
        listData.value = result.data;
      }
    })
    .finally(() => {
      loading.value = false;
    });
};

const listData = ref<IArchiveNotify[]>([]);
// computed(() => {
//   return notifyStore.items
//     .filter(sift(siftParams.value))
//     .map((x) => {
//       // const object = objectStore.items.find((y) => y.id === x.objectId);

//       return {
//         // object,
//         ...x,
//       };
//     })
//     .sort((a, b) =>
//       b.createdAt.toString().localeCompare(a.createdAt.toString())
//     );
// });

onMounted(async () => {
  await onQueryData();
});
</script>

<template>
  <a-list
    item-layout="horizontal"
    :data-source="listData"
    :pagination="{
      ...pagination,
      disabled: loading,
      onChange: onChangePagination,
      showSizeChanger: true,
      // showTotal: () =>
      //   replaceSubstringByArray(t('pagination.notify'), [listData.length]),
    }"
  >
    <!-- <template #footer>
      <div>
        <b>ant design vue</b>
        footer part
      </div>
    </template> -->
    <template #renderItem="{ item }">
      <a-list-item>
        <template #actions>
          <a-button
            v-if="item.status === 0"
            type="primary"
            @click="
              () => {
                emit('onPatchNotify', item.id, {
                  status: 1,
                });
                pagination.total -= 1;
              }
            "
          >
            {{ $t("button.read") }}
          </a-button>
        </template>
        <a-skeleton avatar :title="false" :loading="!!item.loading" active>
          <a-list-item-meta>
            <template #title>
              <div class="font-medium text-s-950 dark:text-g-100">
                {{ item.title }}
              </div>
              <div class="text-s-800 dark:text-g-300">
                {{ item.message }}
              </div>
            </template>
            <template #description>
              <p class="mt-1 truncate text-xs text-g-400 dark:text-g-300">
                {{ item.createdAt ? dayjs(item.createdAt).fromNow() : "" }}
                <template v-if="item.status === 1">
                  ({{ $t("button.readed") }} {{ dayjs(item.readAt).fromNow() }})
                  {{ item.readAt }}
                </template>
              </p>
            </template>
            <template #avatar>
              <UserShortInfo :user-id="item.userId" />
              <!-- <a-avatar :src="item.picture.large" /> -->
            </template>
          </a-list-item-meta>
          <!-- <div>content</div> -->
        </a-skeleton>
      </a-list-item>
    </template>
  </a-list>
</template>
