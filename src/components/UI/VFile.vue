<script setup lang="ts">
import { IImage } from "@/api/image/types";
import { computed, ref } from "vue";
import { Colors } from "@/utils/colors";

const props = defineProps<{ file: IImage }>();

const linkFile = computed(() => {
  return `${import.meta.env.VITE_HOSTIMAGE}/images/${props.file.service}/${
    props.file.serviceId
  }/${props.file.path}${props.file.ext}`;
});

const visible = ref(false);
const openFile = ref(false);
</script>

<template>
  <a-button
    @click="
      () => {
        openFile = true;
      }
    "
    class="h-28 w-28 p-0 m-0 b-scroll overflow-hidden"
  >
    <!-- <div
      class="w-full h-full flex items-center justify-center bg-s-200 dark:bg-yellow-400 text-black rounded-lg text-3xl font-medium cursor-pointer"
    >
      {{ file?.ext }}
    </div> -->
    <object
      :data="linkFile"
      type="application/pdf"
      width="150px"
      height="150px"
      class="overflow-hidden pointer-events-none"
    >
      <iframe
        :src="linkFile"
        width="100%"
        height="100%"
        style="border: none"
        class="overflow-hidden pointer-events-none"
      >
      </iframe>
    </object>
  </a-button>

  <a-modal
    v-model:open="openFile"
    width="100%"
    style="margin: 0 auto"
    wrapClassName="b-scroll full-modal"
    :bodyStyle="{
      margin: 0,
      'margin-top': '4rem',
      padding: 0,
      // background:
      //   generalStore.themeMode === 'dark' ? Colors.g[900] : Colors.s[100],
    }"
    :destroyOnClose="true"
    :maskClosable="false"
    :ok-button-props="{ hidden: true }"
    :cancel-button-props="{ hidden: true }"
    :cancel-text="$t('button.close')"
    @cancel="
      () => {
        openFile = false;
      }
    "
  >
    <iframe :src="linkFile" class="w-full h-full"> </iframe>
  </a-modal>
</template>

<style>
.full-modal {
  .ant-modal {
    max-width: 100%;
    top: 0;
    padding-bottom: 0;
    margin: 0;
    height: calc(100vh);
  }
  .ant-modal-content {
    display: flex;
    flex-direction: column;
    height: calc(100vh);
  }
  .ant-modal-body {
    flex: 1;
    padding: 15px;
  }
  .ant-modal-content {
    padding: 0;
    border-radius: 0 !important;
  }
  .ant-modal-header {
    margin: 0;
    padding: 15px;
    padding-bottom: 0;
    margin: 0;
    padding: 0;
  }
  .ant-modal-footer {
    display: none;
  }
  .ant-modal-close {
    position: absolute;
    bottom: 0px !important;
  }

  .ant-tabs-card .ant-tabs-tab-active,
  .ant-tabs-card .ant-tabs-tab-active {
    background: v-bind("Colors.s[300]") !important;
    border-color: transparent !important;
  }
}
</style>
