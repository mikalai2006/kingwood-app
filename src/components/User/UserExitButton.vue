<script setup lang="ts">
import { computed, h } from "vue";
import { useAuthStore, useRoleStore, useUserStore } from "@/store";
import { useRouter } from "vue-router";
import VIcon from "../UI/VIcon.vue";
import { iExit } from "@/utils/icons";
import { message, Modal } from "ant-design-vue";
import { useI18n } from "vue-i18n";

const userStore = useUserStore();
const authStore = useAuthStore();
const roleStore = useRoleStore();

const { t } = useI18n();

const router = useRouter();

const user = computed(() =>
  userStore.items.find((x) => x.id === authStore.iam.id)
);

const onLogout = () => {
  Modal.confirm({
    // transitionName: "",
    icon: null,
    content: h(
      "div",
      {
        class: "flex flex-row items-start gap-4",
      },
      [
        h(VIcon, {
          path: iExit,
          class: "flex-none text-4xl text-g-500 dark:text-g-400",
        }),
        h(
          "div",
          {
            class: "flex-auto",
          },
          [
            h(
              "div",
              { class: "text-xl font-bold text-g-800 dark:text-g-100" },
              t("info.logoutQuestionTitle")
            ),
            h(
              "div",
              { class: "text-base leading-5 text-g-500 dark:text-g-300" },
              t("info.logoutQuestionDescription")
            ),
          ]
        ),
      ]
    ),
    okButtonProps: { type: "primary", danger: false },
    okText: t("button.yes"),
    cancelText: t("button.no"),
    onOk() {
      return new Promise((resolve, reject) => {
        try {
          authStore.logout().then(() => {
            // window.location.reload();
            router.push("/auth");
          });

          resolve("");
        } catch (e: any) {
          message.error(`Error onLogout: ${e?.message}`);
        }
      }).catch(() => console.log("Oops errors!"));
    },
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onCancel() {},
  });
};
</script>

<template>
  <a-tooltip>
    <template #title> {{ $t("button.logout") }} </template>
    <a-button type="text" class="px-2" @click="onLogout">
      <VIcon :path="iExit" class="text-xl text-s-100" />
    </a-button>
  </a-tooltip>
</template>
