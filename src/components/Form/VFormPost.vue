<script setup lang="ts">
import { IPost, IPostInput } from "@/api/post/types";
import { create, patch } from "@/api/post";
import { Rule } from "ant-design-vue/es/form";
import { reactive, ref, toRaw, UnwrapRef } from "vue";
import { useI18n } from "vue-i18n";
import { usePostStore } from "@/store";

const props = defineProps<{ data: IPostInput; defaultData: IPostInput }>();
const emit = defineEmits(["callback"]);

const { t } = useI18n();

const postStore = usePostStore();

const formState: UnwrapRef<IPostInput> = reactive(props.data);
const formRef = ref();

const rules: Record<string, Rule[]> = {
  name: [
    {
      required: true,
      message: t("form.post.rule.name"),
      trigger: "change",
    },
    // { min: 3, max: 5, message: "Length should be 3 to 5", trigger: "blur" },
  ],
  // code: [
  //   {
  //     required: true,
  //     message: "Please input Activity name",
  //     trigger: "change",
  //   },
  //   { min: 3, max: 5, message: "Length should be 3 to 5", trigger: "blur" },
  // ],
};

const onSubmit = async () => {
  await formRef.value
    .validate()
    .then(async () => {
      // console.log("values", formState, toRaw(formState));
      const data = toRaw(formState) as IPost;
      if (data.id) {
        const result = await patch(data.id, data);
        postStore.onAddItemToStore(result);
      } else {
        const result = await create(data);
        postStore.onAddItemToStore(result);
      }
    })
    .catch((error: Error) => {
      console.log("error", error);
    });
  emit("callback");
};
const resetForm = () => {
  formRef.value.resetFields();
};
</script>
<template>
  <div>
    <a-form
      ref="formRef"
      layout="horizontal"
      style="max-width: 600px"
      :model="formState"
      :rules="rules"
    >
      <a-form-item ref="name" :label="$t('form.post.name')" name="name">
        <a-input v-model:value="formState.name" />
      </a-form-item>

      <a-form-item :label="$t('form.post.color')" name="color">
        <a-input type="color" v-model:value="formState.color" />
      </a-form-item>
      <!-- <a-form-item label="Activity type" name="type">
        <a-checkbox-group v-model:value="formState.type">
          <a-checkbox value="1" name="type">Online</a-checkbox>
          <a-checkbox value="2" name="type">Promotion</a-checkbox>
          <a-checkbox value="3" name="type">Offline</a-checkbox>
        </a-checkbox-group>
      </a-form-item> -->

      <a-form-item :wrapper-col="{ span: 14, offset: 4 }">
        <a-button v-if="!formState?.id" @click="resetForm">
          {{ $t("form.reset") }}
        </a-button>
        <a-button type="primary" style="margin-left: 10px" @click="onSubmit">
          {{ !formState?.id ? $t("form.create") : $t("form.save") }}
        </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<style scoped></style>
