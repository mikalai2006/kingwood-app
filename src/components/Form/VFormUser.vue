<script setup lang="ts">
import { register } from "@/api/auth";
import { patch } from "@/api/user";
import { IUser, IUserInput } from "@/api/user/types";
import {
  useAuthStore,
  useGeneralStore,
  useOperationStore,
  usePostStore,
  useUserStore,
} from "@/store";
import { useRoleStore } from "@/store/modules/role";
import dayjs from "@/utils/dayjs";
import { transliterate } from "@/utils/translit";
import { randomIntFromInterval, replaceSubstringByArray } from "@/utils/utils";
import { Rule } from "ant-design-vue/es/form";
import {
  computed,
  onMounted,
  reactive,
  ref,
  toRaw,
  UnwrapRef,
  watch,
} from "vue";
import { useI18n } from "vue-i18n";
import { PlusOutlined } from "@ant-design/icons-vue";
import { message, UploadProps } from "ant-design-vue";
import VImg from "../UI/VImg.vue";
import VFormResetPassword from "./VFormResetPassword.vue";
import { IValidateError, useError } from "@/composable/useError";
import { dateFormat } from "@/utils/date";
import { remove } from "@/api/image";
import { IImageUpload } from "@/api/image/types";
import { Colors } from "@/utils/colors";

// export interface IFormStateRole {
//   name: string;
//   code: string;
//   sortOrder: number;
//   value: string[];
// }

const props = defineProps<{ data: IUserInput; defaultData: IUserInput }>();
const emit = defineEmits(["callback"]);

const { t } = useI18n();
const roleStore = useRoleStore();
const userStore = useUserStore();
const authStore = useAuthStore();
const postStore = usePostStore();
const operationStore = useOperationStore();
const generalStore = useGeneralStore();

const formState: UnwrapRef<IUserInput> = reactive({
  ...props.data,
  // birthday: dayjs("DD.MM.YYYY", props.data?.birthday),
});
const formRef = ref();

const rules: Record<string, Rule[]> = {
  name: [
    {
      required: true,
      message: t("form.user.rule.name"),
      trigger: "change",
    },
    // { min: 3, max: 5, message: "Length should be 3 to 5", trigger: "blur" },
  ],
  typePay: [
    {
      required: true,
      message: t("form.user.rule.typePay"),
      trigger: "change",
    },
    // { min: 3, max: 5, message: "Length should be 3 to 5", trigger: "blur" },
  ],
  oklad: [
    {
      required: true,
      message: t("form.user.rule.oklad"),
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
  roleId: [
    {
      type: "string",
      required: true,
      message: t("form.user.rule.roleId"),
      trigger: "change",
    },
  ],
  postId: [
    {
      type: "string",
      required: true,
      message: t("form.user.rule.postId"),
      trigger: "change",
    },
  ],
};

const { onGetValidateError } = useError();

const loading = ref(false);

const onSubmit = async () => {
  loading.value = true;

  await formRef.value
    .validate()
    .then(async () => {
      // console.log("values", formState, toRaw(formState));
      const data = toRaw(formState) as IUser;
      if (data.id) {
        const dataForm = new FormData();
        dataForm.append("name", data.name);
        dataForm.append("phone", data.phone);
        dataForm.append("roleId", data.roleId);
        dataForm.append("postId", data.postId);
        dataForm.append("hidden", data.hidden.toString() || "0");
        dataForm.append("typePay", data.typePay.toString());
        dataForm.append("archive", data.archive.toString());
        if (data.typePay === 1) {
          dataForm.append("oklad", data.oklad.toString());
        } else {
          dataForm.append("oklad", "");
        }
        if (fileRef.value) {
          dataForm.append("images", fileRef.value);
        }
        for (const el of data.typeWork) {
          dataForm.append("typeWork", el);
        }
        if (data.birthday) {
          dataForm.append("birthday", dayjs(data.birthday).format(dateFormat));
        } else {
          dataForm.append("birthday", "");
        }
        const result = await patch(
          data.id,
          dataForm
          // {
          //   ...data,
          //   birthday: new Date(data.birthday).toISOString(),
          // }
        );
        userStore.onAddItemToStore(result);
      } else {
        const result = await register(data);
        userStore.onAddItemToStore(result);
      }
      message.success(t("form.message.successSave"));
      emit("callback");
      // formRef.value?.resetFields();
    })
    .catch((error: any) => {
      if (error?.errorFields) {
        onGetValidateError(error);
      } else {
        throw new Error(JSON.stringify(error));
      }
    })
    .finally(() => {
      loading.value = false;
    });
};
const resetForm = () => {
  formRef.value.resetFields();
};

const rolesList = computed(() =>
  roleStore.items
    .filter((x) => !x.hidden)
    .map((x) => {
      return {
        label: x.name,
        value: x.id,
      };
    })
);

const typePayList = [
  {
    label: t("typePay.0"),
    value: 0,
  },
  {
    label: t("typePay.1"),
    value: 1,
  },
  {
    label: t("typePay.2"),
    value: 2,
  },
];

const postsList = computed(() =>
  postStore.items.map((x) => {
    return {
      label: x.name,
      value: x.id,
    };
  })
);
const worksList = computed(() =>
  operationStore.items.map((x) => {
    return {
      label: x.name,
      value: x.id,
    };
  })
);

watch(
  () => formState.name,
  (newValue) => {
    if (!newValue) return;

    if (newValue.length < 7) {
      const fragmentName =
        transliterate(newValue).slice(0, 5) + randomIntFromInterval(0, 1000);
      // console.log(newValue, fragmentName);

      formState.login = fragmentName;
    }
  }
);
const fileRef = ref<File | null>(null);
const previewFile = ({
  file,
  onSuccess,
}: {
  file: File;
  onSuccess: (s: string) => void;
}) => {
  if (file) {
    fileRef.value = file;
  }
  // console.log("file: ", file);

  message.info(t("form.user.addImageUpload"));

  setTimeout(() => {
    onSuccess("ok");
  }, 0);
};

const imageList = ref();

const onRemoveImage = async (data: IImageUpload) => {
  try {
    await remove(data.image.id).then(() => {
      userStore.get(data.uid);
    });
  } catch (e: any) {
    message.error(e.message);
  }
  // console.log("Remove", data);
};

const previewVisible = ref(false);
const previewImage = ref("");
const previewTitle = ref("");

const handlePreview = async (file: any) => {
  // console.log(file);

  if (file?.originFileObj) {
    file.preview = (await getBase64(file.originFileObj)) as string;
  }
  previewImage.value = file.url || file.preview;
  previewVisible.value = true;
  previewTitle.value =
    file.name || file.url.substring(file.url.lastIndexOf("/") + 1);
};

function getBase64(originFileObj: any): string | PromiseLike<string> {
  throw new Error("Function not implemented.");
}
const handleCancel = () => {
  previewVisible.value = false;
  previewTitle.value = "";
};

const activeKey = ref("user");

onMounted(() => {
  imageList.value = formState.images?.map((x) => {
    return {
      image: x,
      url: `${import.meta.env.VITE_HOSTIMAGE}/images/${x.service}/${
        x.serviceId
      }/${x.path}${x.ext}`,
      uid: formState?.id || "1",
      name: formState.name,
      status: "done",
    };
  });
});
</script>

<template>
  <div>
    <a-tabs
      v-model:activeKey="activeKey"
      destroyInactiveTabPane
      type="card"
      :tabBarStyle="{
        position: 'sticky',
        top: 0,
        'padding-left': '15px',
        margin: '0px',
        'z-index': 50,
        background:
          generalStore.themeMode === 'dark' ? Colors.g[951] : Colors.s[200],
      }"
    >
      <a-tab-pane
        key="user"
        :tab="$t('tabs.user.user')"
        class="bg-white dark:bg-g-900/60 p-4 mx-auto max-w-screen-md"
      >
        <!-- {{ JSON.stringify(formState) }} -->
        <a-form
          ref="formRef"
          layout="horizontal"
          style="max-width: 100%"
          :model="formState"
          :rules="rules"
        >
          <!-- <a-form-item ref="name" :label="$t('form.user.login')" name="login">
        <a-input v-model:value="formState.login" disabled />
      </a-form-item> -->
          <a-form-item :label="$t('form.user.name')" name="name">
            <a-input v-model:value="formState.name" />
          </a-form-item>

          <a-form-item :label="$t('form.user.phone')" name="phone">
            <a-input v-model:value="formState.phone" />
          </a-form-item>

          <a-form-item :label="$t('form.user.birthday')" name="birthday">
            <a-date-picker
              v-model:value="formState.birthday"
              :format="dateFormat"
              :value-format="dateFormat"
              style="width: 100%"
              :placeholder="$t('form.user.selectBirthday')"
            />
          </a-form-item>

          <a-form-item :label="$t('form.user.image')">
            <!-- <template v-if="formState.images">
          <VImg :image="formState?.images[0]" />
        </template> -->
            <!-- <input
          type="file"
          @change="previewFile($event)"
          accept="image/*"
          capture
        /> -->
            <!-- <div v-if="imageList?.length">
              {{ imageList }}
            </div> -->
            <a-upload
              v-model:file-list="imageList"
              :customRequest="previewFile"
              :maxCount="1"
              list-type="picture-card"
              @remove="onRemoveImage"
              @preview="handlePreview"
            >
              <div>
                <PlusOutlined />
                <div style="margin-top: 8px">
                  {{ $t("form.user.uploadImage") }}
                </div>
              </div>
            </a-upload>
            <a-modal
              :open="previewVisible"
              :title="previewTitle"
              :footer="null"
              @cancel="handleCancel"
            >
              <img alt="example" style="width: 100%" :src="previewImage" />
            </a-modal>
          </a-form-item>

          <!-- <a-form-item label="Activity type" name="type">
        <a-checkbox-group v-model:value="formState.type">
          <a-checkbox value="1" name="type">Online</a-checkbox>
          <a-checkbox value="2" name="type">Promotion</a-checkbox>
          <a-checkbox value="3" name="type">Offline</a-checkbox>
        </a-checkbox-group>
      </a-form-item> -->

          <a-form-item
            v-if="
              authStore.roles.includes('user-change-role') ||
              authStore.code === 'systemrole'
            "
            :label="$t('form.user.roleId')"
            name="roleId"
          >
            <a-select
              v-model:value="formState.roleId"
              style="width: 100%"
              :placeholder="$t('form.user.selectRole')"
              :options="rolesList"
            ></a-select>
          </a-form-item>

          <template
            v-if="
              authStore.roles.includes('user-change-typePay') ||
              authStore.code === 'systemrole'
            "
          >
            <a-form-item name="typePay" :label="$t('form.user.typePay')">
              <a-select
                v-model:value="formState.typePay"
                style="width: 100%"
                :placeholder="$t('form.user.selectTypePay')"
                :options="typePayList"
              ></a-select>
            </a-form-item>

            <a-form-item
              v-if="formState.typePay === 1"
              :label="$t('form.user.oklad')"
              name="oklad"
            >
              <a-input-number
                v-model:value="formState.oklad"
                :min="1"
                :max="10000"
              />
            </a-form-item>
          </template>

          <a-form-item
            v-if="
              authStore.roles.includes('user-change-post') ||
              authStore.code === 'systemrole'
            "
            :label="$t('form.user.postId')"
            name="postId"
          >
            <a-select
              v-model:value="formState.postId"
              style="width: 100%"
              :placeholder="$t('form.user.selectPost')"
              :options="postsList"
            ></a-select>
          </a-form-item>

          <a-form-item
            v-if="
              authStore.roles.includes('user-change-typeWork') ||
              authStore.code === 'systemrole'
            "
            :label="$t('form.user.typeWork')"
            name="typeWork"
          >
            <a-select
              v-model:value="formState.typeWork"
              style="width: 100%"
              mode="multiple"
              :placeholder="$t('form.user.selectTypeWork')"
              :options="worksList"
            ></a-select>
          </a-form-item>

          <a-form-item
            v-if="authStore.code === 'systemrole'"
            :label="$t('form.user.hidden')"
            name="hidden"
          >
            <a-switch
              v-model:checked="formState.hidden"
              :checkedValue="1"
              :unCheckedValue="0"
            />
          </a-form-item>

          <a-form-item
            v-if="
              authStore.roles.includes('user-archiv') ||
              authStore.code === 'systemrole'
            "
            :label="$t('form.user.archive')"
            name="archive"
          >
            <a-switch
              v-model:checked="formState.archive"
              :checkedValue="1"
              :unCheckedValue="0"
            />
          </a-form-item>

          <a-form-item :wrapper-col="{ span: 14, offset: 4 }">
            <a-button
              type="primary"
              :loading="loading"
              :diasabled="loading"
              @click="onSubmit"
            >
              {{ formState.id ? $t("form.save") : $t("form.create") }}
            </a-button>
            <a-button
              v-if="!formState.id"
              :diasabled="loading"
              style="margin-left: 10px"
              @click="resetForm"
            >
              {{ $t("form.reset") }}
            </a-button>
          </a-form-item>
        </a-form>
      </a-tab-pane>
      <a-tab-pane
        v-if="
          formState.userId &&
          (authStore.roles.includes('auth-resetpass') ||
            authStore.code === 'systemrole')
        "
        key="password"
        :tab="$t('tabs.user.password')"
        class="bg-white dark:bg-g-900/60 p-4 mx-auto max-w-screen-md"
      >
        <div class="mb-4">
          {{ $t("form.user.login") }}: {{ formState.auth?.login }}
        </div>
        <VFormResetPassword :auth-id="formState.userId" />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>
