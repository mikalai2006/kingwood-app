<script setup lang="ts">
import useObject from "@/composable/useObject";
import { useObjectStore } from "@/store";
import { onMounted, ref } from "vue";

const model = defineModel<string[] | string>();
const props = defineProps<{
  valueAsArray?: boolean;
}>();

const objectStore = useObjectStore();

const { onCreateObject, onFetchObjects, state } = useObject();

const subModel = ref();

const OnChangeOption = () => {
  model.value = props.valueAsArray ? [subModel.value] : subModel.value;
};

onMounted(() => {
  if (typeof model.value == "object" && model.value.length) {
    subModel.value = model.value[0];
  } else {
    subModel.value = model.value;
  }
  const object = objectStore.items.find((x) => x.id === subModel.value);
  object?.name && onFetchObjects(object?.name);
});
</script>

<template>
  <a-form-item :label="$t('form.order.objectId')" name="objectId">
    <a-select
      v-model:value="subModel"
      style="width: 100%"
      :placeholder="$t('form.order.selectObject')"
      :options="state.data"
      :fieldNames="{ label: 'name', value: 'id' }"
      @search="onFetchObjects"
      @change="OnChangeOption"
      :show-search="true"
      :filter-option="false"
      :not-found-content="state.value ? undefined : null"
    >
      <template v-if="state.value" #notFoundContent>
        <div v-if="state.fetching">
          <a-spin v-if="state.fetching" size="small" />
        </div>
        <div v-else class="flex">
          <div>
            <p>{{ $t("form.object.notfound") }}: {{ state.value }}</p>
            <a-button
              type="primary"
              @click="
                () =>
                  onCreateObject((result) => {
                    subModel = result.id;
                    model = result.id;
                  })
              "
            >
              {{ $t("form.object.add") }} {{ state.value }}
            </a-button>
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
