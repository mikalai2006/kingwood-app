<script setup lang="ts">
import { computed, ref } from "vue";
import { useAuthStore, useRoleStore, useUserStore } from "@/store";
import { getShortFIO } from "@/utils/utils";
import { MenuProps } from "ant-design-vue";
import { useRouter } from "vue-router";

const userStore = useUserStore();
const authStore = useAuthStore();
const roleStore = useRoleStore();

const router = useRouter();

const user = computed(() =>
  userStore.items.find((x) => x.id === authStore.iam.id)
);

const role = computed(() =>
  roleStore.items.find((x) => x.id === authStore.iam.roleId)
);

const menuItems = ref<string[]>([
  // "auth",
  "role",
  "post",
  // "user",
  "operation",
  "object",
  // "order",
  // "montajList",
  "taskStatus",
]);

const handleButtonClick = (e: Event) => {
  router.push({ name: "account" });
  // console.log("click left button", e);
};

const handleMenuClick: MenuProps["onClick"] = (e) => {
  // console.log("click", e.key);
  router.push({ name: e.key.toString() });
};
</script>
<template>
  <a-dropdown v-if="user" placement="topLeft" arrow @click="handleButtonClick">
    <div class="flex flex-row items-center gap-2 cursor-pointer">
      <!-- <img
      src="https://xsgames.co/randomusers/avatar.php?g=pixel&key=1"
      class="w-8 h-8 rounded-full border-2 border-s-200"
    /> -->
      <div class="relative w-8 h-8">
        <VImg :image="user?.images?.[0]" class="w-full h-full" />
        <!-- <div
          v-if="user?.online"
          class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-[3px] border-s-50 dark:border-g-800"
        ></div> -->
      </div>
      <div class="font-bold leading-4">
        {{ getShortFIO(user?.name) }}
        <span
          class="block font-normal leading-3 text-xs text-s-400 dark:text-g-300"
        >
          {{ role?.name }}
        </span>
      </div>

      <!-- <div class="flex items-center px-2">
        <VIcon :path="iDotsHorizontal" class="self-center" />
      </div> -->
    </div>
    <template #overlay>
      <a-menu @click="handleMenuClick" placement="right">
        <template v-if="menuItems.length">
          <template v-for="item in menuItems" :key="item">
            <a-menu-item
              v-if="authStore.roles.includes(`${item}-list`)"
              :key="item"
            >
              {{ $t(`page.${item}.title`) }}
            </a-menu-item>
          </template>
          <a-menu-divider />
        </template>
        <a-menu-item key="account">
          {{ $t(`page.account.title`) }}
        </a-menu-item>
      </a-menu>
    </template>
  </a-dropdown>
  <!-- <a-spin v-else /> -->
</template>

<style scoped></style>
