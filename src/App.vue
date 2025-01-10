<script setup lang="ts">
import { useRoute } from "vue-router";
import ruRU from "ant-design-vue/es/locale/ru_RU";
import {
  useAuthStore,
  useGeneralStore,
  useOperationStore,
  useOrderStore,
  usePostStore,
  useTaskStatusStore,
  useTaskStore,
  useTaskWorkerStore,
  useUserStore,
} from "./store";
import dayjs from "@/utils/dayjs";
import { computed, onMounted, onUnmounted, watch } from "vue";
import { useRoleStore } from "./store/modules/role";
import UserInfoAside from "./components/User/UserInfoAside.vue";
import { useSocket } from "./composable/useSocket";
import VNavbar from "./components/VNavbar.vue";
import VChangerMode from "./components/VChangerMode.vue";
import { message, theme } from "ant-design-vue";
import { Colors } from "./utils/colors";
import UserMessage from "./components/User/UserMessage.vue";
import VNavbarCMS from "./components/VNavbarCMS.vue";

const generalStore = useGeneralStore();

dayjs.locale("ru");
const route = useRoute();
const authStore = useAuthStore();
const userStore = useUserStore();
const roleStore = useRoleStore();
const postStore = usePostStore();
const operationStore = useOperationStore();
const taskStore = useTaskStore();
const orderStore = useOrderStore();
const taskWorkerStore = useTaskWorkerStore();
const taskStatus = useTaskStatusStore();

let socket: WebSocket;

const onInitData = async () => {
  try {
    await roleStore.find({ $limit: 100 });
    await postStore.find({ $limit: 100 });
    await userStore.find({ $limit: 100 });
    await operationStore.find({ $limit: 100 });
    await taskStore.find({ $limit: 300 });
    // await orderStore.find({ $limit: 100 });
    await taskWorkerStore.find({ $limit: 100 });
    await taskStatus.find();

    setTimeout(() => {
      const { socket: _socket } = useSocket();
      socket = _socket;

      // check auth token.
      socket.onopen = () => {
        socket.send(
          JSON.stringify({
            type: "jwt",
            content: authStore.tokenData?.access_token,
          })
        );
      };
    }, 500);
  } catch (e) {
    message.error(e.message);
  }
};

watch(
  () => authStore.tokenData,
  (val, oldVal) => {
    onInitData();
  }
);

onMounted(async () => {
  try {
    generalStore.onGetMode();
    await authStore.initToken();
    //   // if (authStore.tokenData) {
    //   await roleStore.find({ $limit: 100 });
    //   await postStore.find({ $limit: 100 });
    //   await userStore.find({ $limit: 100 });
    //   await operationStore.find({ $limit: 100 });
    //   await taskStore.find({ $limit: 300 });
    //   await orderStore.find({ $limit: 100 });
    //   await taskWorkerStore.find({ $limit: 100 });
    //   await taskStatus.find();
    //   setTimeout(() => {
    //     const { socket: _socket } = useSocket();
    //     socket = _socket;

    //     // check auth token.
    //     socket.onopen = () => {
    //       socket.send(
    //         JSON.stringify({
    //           type: "jwt",
    //           content: authStore.tokenData?.access_token,
    //         })
    //       );
    //     };
    //   }, 500);
  } catch (e) {
    message.error(e.message);
  }
});

onUnmounted(() => {
  socket?.close();
});

const tokenTheme = computed(() => {
  const result: any = {
    fontSize: 14,
  };
  if (generalStore.themeMode === "dark") {
    result.colorBgBase = Colors.g[951];
    result.colorTextBase = Colors.white;
    result.colorPrimary = Colors.p[400];
    result.colorInfo = Colors.p[400];
    result.colorLink = Colors.p[500];
    result.colorLinkHover = Colors.p[500];
    result.colorLinkActive = Colors.p[500];
  } else {
    result.colorBgBase = Colors.white;
    result.colorTextBase = Colors.black;
    result.colorPrimary = Colors.s[500];
    result.colorInfo = Colors.s[500];
    result.colorLink = Colors.s[500];
    result.colorLinkHover = Colors.s[500];
    result.colorLinkActive = Colors.s[500];
  }

  return result;
});
</script>

<template>
  <a-config-provider
    :locale="ruRU"
    :theme="{
      algorithm:
        generalStore.themeMode === 'dark'
          ? theme.darkAlgorithm
          : theme.defaultAlgorithm,

      token: tokenTheme,
    }"
  >
    <a-app>
      <div
        class="min-h-screen flex flex-row items-stretch bg-white dark:bg-g-800"
      >
        <!-- <div class="w-screen-sm min-w-48 p-4 bg-s-700">
            
            <nav class="sticky top-14 flex flex-col bg-white p-4 rounded-lg">
              <RouterLink to="/">Go to Home</RouterLink>
              <RouterLink to="/about">Go to About</RouterLink>
              <RouterLink to="/auth">Go to Auth</RouterLink>
              <RouterLink to="/role">{{ $t("page.role.title") }}</RouterLink>
              <RouterLink to="/post">{{ $t("page.post.title") }}</RouterLink>
              <RouterLink to="/user">{{ $t("page.user.title") }}</RouterLink>
              <RouterLink to="/operation">{{
                $t("page.operation.title")
              }}</RouterLink>
              <RouterLink to="/order">{{ $t("page.order.title") }}</RouterLink>
              <RouterLink to="/dashboard">Go to Dashboard</RouterLink>
            </nav>
          </div> -->
        <div class="flex-auto flex flex-col h-screen overflow-y-hidden">
          <header
            class="shrink-0 h-16 bg-s-50 dark:bg-g-800 z-50 shadow-md flex items-center"
          >
            <div class="bg-s-900 dark:bg-g-950 w-64 h-full">
              <a
                href="#"
                class="text-white flex items-center space-x-2 px-4"
                title="Your App is cool"
              >
                <img src="/logo-t-white.png" />
              </a>
            </div>
            <div
              v-if="authStore.tokenData"
              class="flex-auto px-4 py-2 flex flex-row items-center gap-4"
            >
              <div class="flex-auto">{{ route.meta.title }}</div>
              <!-- <div>
                <UserMessage />
              </div>
              <div>
                <UserInfoAside />
              </div> -->
            </div>
          </header>
          <div
            class="flex-auto flex flex-col md:flex-row overflow-auto b-scroll"
          >
            <aside
              id="sidebar"
              class="overflow-hidden shrink-0 bg-s-900 dark:bg-g-950 text-gray-100 md:w-64 w-3/4 space-y-6 px-0 absolute inset-y-0 left-0 transform md:sticky md:translate-x-0 transition duration-200 ease-in-out md:flex md:flex-col md:justify-between"
            >
              <div class="flex flex-col space-y-6">
                <VNavbar v-if="authStore.tokenData" />
                <VNavbarCMS v-if="authStore.tokenData" />
                <!-- <nav data-dev-hint="main navigation">
              <a
                href="#"
                class="flex items-center space-x-2 py-2 px-4 transition duration-200 hover:bg-gray-700 hover:text-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path
                    d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
                  />
                </svg>
                <span>About</span>
              </a>
              <a
                href="#"
                class="flex items-center space-x-2 py-2 px-4 transition duration-200 hover:bg-gray-700 hover:text-white"
              >
                <span class="ml-6">Without Icon</span>
              </a>
              <a
                href="#"
                class="flex items-center space-x-2 py-2 px-4 transition duration-200 hover:bg-gray-700 hover:text-white group"
              >
                <span
                  class="w-4 h-4 flex-shrink-0 border border-gray-600 rounded group-hover:border-gray-400 transition duration-200"
                ></span>
                <span>Without Icon And a bit longer than usual</span>
              </a>
            </nav> -->
              </div>
              <div class="flex-auto"></div>
              <div class="bg-white/5 mx-4 p-2 rounded-lg">
                <UserInfoAside />
              </div>
              <nav class="flex pr-4">
                <div class="">
                  <VChangerMode />
                </div>

                <UserMessage />
                <!-- <a
                  href="#"
                  class="block py-2 px-4 transition duration-200 hover:bg-gray-700 hover:text-white"
                >
                  asd
                </a> -->

                <!-- <a
              href="#"
              class="block py-2 px-4 transition duration-200 hover:bg-gray-700 hover:text-white"
            >
              asd
            </a>
            <a
              href="#"
              class="block py-2 px-4 transition duration-200 hover:bg-gray-700 hover:text-white"
            >
              asd
            </a> -->
              </nav>
            </aside>
            <div
              class="flex-auto overflow-auto b-scroll bg-white dark:bg-g-900"
            >
              <RouterView v-slot="{ Component }">
                <template v-if="Component">
                  <!-- <Transition mode="out-in"> -->
                  <!-- <KeepAlive> -->
                  <Suspense>
                    <!-- main content -->
                    <component :is="Component"></component>

                    <!-- loading state -->
                    <template #fallback> Loading... </template>
                  </Suspense>
                  <!-- </KeepAlive> -->
                  <!-- </Transition> -->
                </template>
              </RouterView>
            </div>
          </div>
        </div>
      </div>
    </a-app>
  </a-config-provider>
</template>
