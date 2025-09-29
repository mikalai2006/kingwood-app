<script setup lang="ts">
import { IDoplata, IDoplataInput } from "@/api/types";
import { computed, ref, toRaw } from "vue";
import { useI18n } from "vue-i18n";
import VFormDop from "./Form/VFormDop.vue";
import VDop from "./VDop.vue";
import { message } from "ant-design-vue";
import { patch } from "@/api/user";
import { useUserStore } from "@/store";

const userStore = useUserStore();
const props = defineProps(["modelValue", "userId"]);
const emit = defineEmits(["update:modelValue"]);

const { t } = useI18n();

const open = ref<boolean>(false);

const showModal = () => {
  open.value = true;
};
const dataForm = ref<IDoplataInput>({});
const defaultData = computed<IDoplataInput>(() => {
  return {
    id: 0,
    days: [],
    doplata: 0,
    minHours: 0,
  };
});

const onAddDop = () => {
  const nextId = props.modelValue.length
    ? Math.max(...props.modelValue.map((x: IDoplataInput) => x.id || 0))
    : 0;
  dataForm.value = { ...defaultData.value, id: nextId + 1 };

  showModal();
};

const onChangeModel = (value: IDoplataInput) => {
  const newValue = props.modelValue || [];
  const index = newValue.findIndex((x: IDoplataInput) => x.id == value.id);
  if (index > -1) {
    newValue[index] = value;
  } else {
    newValue.push(value);
  }
  emit("update:modelValue", newValue);

  onSaveDops();

  open.value = false;
};

const onEdit = (data: IDoplata) => {
  dataForm.value = { ...data };
  showModal();
};

const onRemove = (data: IDoplata) => {
  const newModelValue = props.modelValue.filter(
    (x: IDoplata) => x.id != data.id
  );
  emit("update:modelValue", newModelValue);
};

const loading = ref(false);

const onSaveDops = async () => {
  try {
    loading.value = true;

    const data = toRaw(props.modelValue) as IDoplata[];
    const dataForm = new FormData();
    for (const key in data) {
      dataForm.append("dops", JSON.stringify(data[key]));
    }
    const result = await patch(props.userId, dataForm);
    userStore.onAddItemToStore(result);

    message.success(t("form.message.successSave"));
    // emit("callback");
    // formRef.value?.resetFields();
  } catch (error: any) {
    throw new Error(JSON.stringify(error));
  } finally {
    loading.value = false;
  }
};
</script>
<template>
  <div class="mb-4">
    <VDop
      v-for="item in modelValue"
      :key="item.id"
      :item="item"
      @edit="onEdit"
      @delete="onRemove"
    />
  </div>

  <a-button type="primary" @click="onAddDop">
    {{ $t("form.user.addDop") }}
  </a-button>

  <a-modal
    v-model:open="open"
    destroyOnClose
    :title="$t('form.user.addDop')"
    :ok-button-props="{ hidden: true }"
    :cancel-button-props="{ hidden: true }"
  >
    <VFormDop
      :data="dataForm"
      :default-data="defaultData"
      @callback="
        (value: IDoplataInput) => {
          onChangeModel(value);
        }
      "
    />
  </a-modal>
</template>
