<script setup lang="ts">
import useOrder from "@/composable/useOrder";
import { useObjectStore } from "@/store";
import { onMounted } from "vue";

const model = defineModel();

const objectStore = useObjectStore();

const { onFetchOrders, state } = useOrder();

onMounted(() => {
  const object = objectStore.items.find((x) => x.id === model.value);
  object?.name && onFetchOrders(object?.name);
});
</script>

<template>
  <a-form-item :label="$t('form.order.name')" name="objectId">
    <a-select
      v-model:value="model"
      style="width: 100%"
      :placeholder="$t('form.order.selectOrder')"
      :options="state.data"
      :fieldNames="{ label: 'name', value: 'id' }"
      @search="onFetchOrders"
      :show-search="true"
      :filter-option="false"
      :not-found-content="state.value ? undefined : null"
    >
      <template #option="option">
        <p>
          <span class="font-bold"> №{{ option.number }} </span>
          {{ option.name }} ({{ option.year }})
        </p>
      </template>
      <template #notFoundContent>
        <div v-if="state.fetching">
          <a-spin v-if="state.fetching" size="small" />
        </div>
        <div v-else class="flex">
          <div>
            <p>{{ $t("form.object.notfound") }}: {{ state.value }}</p>
            <!-- <a-button
              type="primary"
              @click="
                () =>
                  onCreateObject((result) => {
                    model = result.id;
                  })
              "
            >
              {{ $t("form.object.add") }} {{ state.value }}
            </a-button> -->
          </div>
        </div>
      </template>
      <!-- <template #dropdownRender="{ menuNode: menu }">
            <a-space style="padding: 4px 8px">
              <a-input
                ref="inputRef"
                v-model:value="queryObject"
                placeholder="Please enter item"
              />
              <a-button type="text" @click="onFindObjects">
                <template #icon>
                  <VIcon :path="iSearch" class="inline" />
                </template>
                Search
              </a-button>
            </a-space>
            <a-divider style="margin: 4px 0" />
            <v-nodes v-if="!loading" :vnodes="menu" />
            <a-spin v-else />
          </template> -->
    </a-select>
  </a-form-item>
</template>
