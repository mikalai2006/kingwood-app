<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { message, type UploadChangeParam } from "ant-design-vue";

import {
  useAuthStore,
  useMessageStore,
  useObjectStore,
  useOrderStore,
} from "@/store";
import { IImageUpload } from "@/api/image/types";
import { useI18n } from "vue-i18n";
import VIcon from "../UI/VIcon.vue";
import { iImage } from "@/utils/icons";
import { IMessageInput } from "@/api/message/types";
import { create, patch } from "@/api/message";

const props = defineProps<{
  orderId: string;
}>();

const emit = defineEmits(["submitCallback"]);

const { t } = useI18n();

const handleChange = (info: UploadChangeParam) => {
  if (info.file.status !== "uploading") {
    console.log(info.file, info.fileList);
  }
  if (info.file.status === "done") {
    message.success(`${info.file.name} file uploaded successfully`);
  } else if (info.file.status === "error") {
    message.error(`${info.file.name} file upload failed.`);
  }
};

const fileList = ref([]);
const headers = {
  authorization: "authorization-text",
};

const authStore = useAuthStore();
const objectStore = useObjectStore();
const orderStore = useOrderStore();
const messageStore = useMessageStore();

const order = computed(() =>
  orderStore.items.find((x) => x.id === props.orderId)
);

const messageOrder = ref("");

const fileRef = ref<File[]>([]);
const previewFile = ({
  file,
  onSuccess,
}: {
  file: File;
  onSuccess: (s: string) => void;
}) => {
  if (file) {
    fileRef.value.push(file);
  }
  // console.log("file: ", file);

  message.info(t("form.message.addImageUpload"));

  setTimeout(() => {
    onSuccess("ok");
  }, 0);
};

const imageList = ref();

const onRemoveImage = async (data: IImageUpload) => {
  try {
    // await remove(data.image.id).then(() => {
    //   userStore.get(data.uid);
    // });
  } catch (e: any) {
    message.error(e.message);
  }
  // console.log("Remove", data);
};

// const handlePreview = async (file: any) => {
//   // console.log(file);

//   if (file?.originFileObj) {
//     file.preview = (await getBase64(file.originFileObj)) as string;
//   }
//   previewImage.value = file.url || file.preview;
//   previewVisible.value = true;
//   previewTitle.value =
//     file.name || file.url.substring(file.url.lastIndexOf("/") + 1);
// };

// function getBase64(originFileObj: any): string | PromiseLike<string> {
//   throw new Error("Function not implemented.");
// }
// const handleCancel = () => {
//   previewVisible.value = false;
//   previewTitle.value = "";
// };
const loading = ref(false);
const onSubmit = async () => {
  loading.value = true;
  try {
    // console.log("values", formState, toRaw(formState));
    if (messageOrder.value === "" && !fileRef.value.length) {
      message.warning(t("message.notDataForSendMessage"));
      return;
    }

    const data: IMessageInput = {};
    const dataForm = new FormData();
    if (messageOrder.value) {
      dataForm.append("message", messageOrder.value);
    }
    if (props.orderId) {
      dataForm.append("orderId", props.orderId);
    }

    if (fileRef.value.length) {
      fileRef.value.forEach((el) => {
        dataForm.append("images", el);
      });
    }

    if (data?.id) {
      const result = await patch(data.id, dataForm);
      messageStore.onAddItemToStore(result);
      emit("submitCallback", result);
    } else {
      const result = await create(dataForm);
      messageStore.onAddItemToStore(result);
      emit("submitCallback", result);
    }
    message.success(t("form.message.successSave"));
    messageOrder.value = "";
    imageList.value = [];
    fileRef.value = [];
  } catch (error: any) {
    throw new Error(JSON.stringify(error));
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  // onLoadData();
  // console.log("scroll: ", el.value?.clientHeight + el.value?.scrollHeight);
});
</script>

<template>
  <a-textarea
    v-model:value="messageOrder"
    :placeholder="$t('form.message.messagePlaceholder')"
    class="mb-3 b-scroll"
  >
  </a-textarea>
  <div class="flex flex-row gap-2">
    <a-upload
      v-model:file-list="imageList"
      :customRequest="previewFile"
      :maxCount="5"
      list-type="picture-card"
      multiple
      @remove="onRemoveImage"
    >
      <div class="text-center">
        <div class="flex items-center justify-center text-2xl text-g-300">
          <VIcon :path="iImage" />
        </div>
        <div style="">
          {{ $t("form.message.image") }}
        </div>
      </div>
      <!-- <template #itemRender="{ file, actions }">
        <a-space>
          <span :style="file.status === 'error' ? 'color: red' : ''">{{
            file.name
          }}</span>
          <a href="javascript:;" @click="actions.download">download</a>
          <a href="javascript:;" @click="actions.remove">delete</a>
        </a-space>
      </template> -->
    </a-upload>
    <div>
      <a-button
        type="primary"
        :disabled="loading || (messageOrder === '' && !fileRef.length)"
        :loading="loading"
        @click="onSubmit"
      >
        <div>{{ t("button.submit") }}</div>
      </a-button>
    </div>
  </div>
</template>
