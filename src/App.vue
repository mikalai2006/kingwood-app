<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import ruRU from "ant-design-vue/es/locale/ru_RU";
import {
  useAuthStore,
  useGeneralStore,
  useOperationStore,
  useOrderStore,
  usePayTemplateStore,
  usePostStore,
  useTaskStatusStore,
  useTaskStore,
  useTaskWorkerStore,
  useUserStore,
} from "./store";
import dayjs from "@/utils/dayjs";
import {
  computed,
  onErrorCaptured,
  onMounted,
  onUnmounted,
  ref,
  watch,
} from "vue";
import { useRoleStore } from "./store/modules/role";
import UserInfoAside from "./components/User/UserInfoAside.vue";
import { useSocket } from "./composable/useSocket";
import VNavbar from "./components/VNavbar.vue";
import VChangerMode from "./components/VChangerMode.vue";
import { message, theme } from "ant-design-vue";
import { Colors } from "./utils/colors";
import UserNotify from "./components/User/UserNotify.vue";
import VNavbarCMS from "./components/VNavbarCMS.vue";
import UserExitButton from "./components/User/UserExitButton.vue";
import { useI18n } from "vue-i18n";
import useNotification from "./composable/useNotification";
import { useError } from "./composable/useError";

const generalStore = useGeneralStore();

dayjs.locale("ru");
const route = useRoute();
const payTemplateStore = usePayTemplateStore();
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

const router = useRouter();

const { t } = useI18n();

const noty = useNotification();

const { onShowError } = useError();

const loading = ref(false);

const loadingText = ref("");

const onInitData = async () => {
  try {
    loading.value = true;

    if (socket?.OPEN) {
      socket.close();
    }

    loadingText.value = t("page.payTemplate.title");
    await payTemplateStore.find({ $limit: 100 }).catch((e) => {
      throw e;
    });
    loadingText.value = t("page.role.title");
    await roleStore.find({ $limit: 100 }).catch((e) => {
      throw e;
    });
    loadingText.value = t("page.post.title");
    await postStore.find({ $limit: 100 }).catch((e) => {
      throw e;
    });
    loadingText.value = t("page.user.title");
    await userStore.find({ $limit: 500 }).catch((e) => {
      throw e;
    });
    loadingText.value = t("page.operation.title");
    await operationStore.find({ $limit: 100 }).catch((e) => {
      throw e;
    });
    // await taskStore.find({ $limit: 300 });
    // loadingText.value = t("page.task.title");
    // await orderStore.find({ $limit: 100 });
    // await taskWorkerStore.find({ $limit: 100 });
    // loadingText.value = t("page.taskWorker.title");
    loadingText.value = t("page.taskStatus.title");
    await taskStatus.find().catch((e) => {
      throw e;
    });

    // setTimeout(() => {
    const { socket: _socket } = useSocket({ router, t, noty, message });
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
    // }, 500);
  } catch (e: any) {
    onShowError(e);
    //errorApp.value = e;
  } finally {
    loading.value = false;
  }
};

watch(
  () => authStore.tokenData,
  (val, oldVal) => {
    if (authStore.tokenData) {
      onInitData();
    } else {
      socket?.close();
    }
  }
);

onMounted(async () => {
  window?.ipcRenderer?.invoke("get-version").then((_version: string) => {
    console.log(`Version ${version}`);
    version.value = _version;
  });

  // Listen for messages
  window?.ipcRenderer.on("message", function (event, text) {
    noty.onShowNotify(text);
  });

  // window?.ipcRenderer.on("message", function (event, text) {
  //   // alert(text);
  //   noty.onShowNotify(text);
  // });

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
  } catch (e: any) {
    onShowError(e);

    errorApp.value = e;
  }
});

const version = ref("0.0.0");

onUnmounted(() => {
  socket?.close();
});

const tokenTheme = computed(() => {
  const result: any = {
    fontSize: 14,
  };
  if (generalStore.themeMode === "dark") {
    result.colorBgBase = Colors.g[950];
    result.colorTextBase = Colors.white;
    result.colorPrimary = Colors.p[400];
    result.colorError = Colors.r[400];
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

const errorApp = ref<any>(null);

onErrorCaptured((error: any, vm, info) => {
  // this.error = error;
  // this.errorMessage = info;
  console.log("Error onErrorCaptured: ", error, vm, info);
  if (error?.code == 500) {
    errorApp.value = error;
  }

  //  else {

  //   modal.confirm({
  //         title: h(
  //           "span",
  //           { class: "flex-auto text-red-500 dark:text-red-400" },
  //           props?.t("info.disableServer")
  //         ),
  //         icon: h("span", { class: "anticon flex-none inline-flex " }, [
  //           h(VIcon, {
  //             path: iWraningTriangle,
  //             class: "text-2xl text-red-500 dark:text-red-400",
  //           }),
  //         ]),
  //         content: h(
  //           "div",
  //           { class: "text-red-500 dark:text-red-400" },
  //           props?.t("info.disableServerDescription")
  //         ),
  //         onOk() {
  //           props?.router.go(0);
  //         },
  //         onCancel() {
  //           props?.router.go(0);
  //         },
  //         class: "test",
  //       });
  // }

  onShowError(error);
  return false; // Prevents the error from propagating further
});
</script>

<template>
  <div class="absolute top-0 h-8 w-full title-drag"></div>
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
        <div v-if="loading" class="absolute inset-0 z-50 flex">
          <div class="absolute inset-0 bg-s-100 dark:bg-g-900 opacity-80"></div>
          <div class="flex-auto flex items-center justify-center flex-col z-10">
            <a-spin size="large" />
            <div class="text-sm text-black dark:text-g-100">
              {{ $t(`info.loading`) }}: {{ loadingText }}...
            </div>
          </div>
        </div>
        <div v-if="errorApp" class="flex items-center mx-auto">
          <!-- <a-result status="500" title="500" :sub-title="errorApp?.message">
            <template #extra>

              <a-button
                type="primary"
                @click="
                  () => {
                    router.go(0);
                  }
                "
              >
                reload
              </a-button>
            </template>
          </a-result> -->
          <section class="bg-white dark:bg-g-800">
            <div class="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
              <div class="mx-auto max-w-screen-sm text-center">
                <h1
                  class="mb-4 text-7xl tracking-tight font-extrabold lg:text-9xl text-p-600 dark:text-p-500"
                >
                  {{ errorApp?.code }}
                </h1>
                <!-- <p
                  class="mb-4 text-3xl tracking-tight font-bold text-gray-900 md:text-4xl dark:text-white"
                >
                  {{ errorApp?.message }}
                </p> -->
                <p class="mb-4 text-lg font-light text-g-500 dark:text-g-300">
                  {{ errorApp?.message }}
                </p>
                <!-- <a
                  href="#"
                  class="inline-flex text-white bg-primary-600 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:focus:ring-primary-900 my-4"
                >
                  Back to Homepage
                </a> -->
                <a-button
                  type="primary"
                  @click="
                    () => {
                      router.go(0);
                    }
                  "
                >
                  {{ $t("button.refresh") }}
                </a-button>
              </div>
            </div>
          </section>
          <!-- {{ JSON.stringify(errorApp) }} -->
        </div>
        <template v-else>
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
            <!-- <div class="flex items-stretch h-8">
              <div class="bg-s-800 md:w-64 w-3/4"></div>
              <div class="flex-auto bg-s-100">App</div>
            </div> -->
            <!-- <header
              class="shrink-0 h-16 bg-s-50 dark:bg-g-800 z-50 shadow-md flex items-center"
            >
              <div
                class="flex flex-row items-center bg-s-900 dark:bg-g-950 w-64 h-full"
              >
                <div class="flex-auto flex items-center justify-center">
                  <a href="#" class="" :title="$t('nameApp')">
                    <img src="/logo-t-white.png" class="" />
                  </a>
                </div>
              </div>
              <div
                v-if="authStore.tokenData"
                class="flex-auto px-4 py-2 flex flex-row items-center gap-4"
              >
                <div class="flex-auto">{{ route.meta.title }}</div>
              </div>
            </header> -->
            <div
              class="flex-auto flex flex-col md:flex-row overflow-auto b-scroll"
            >
              <aside
                id="sidebar"
                class="overflow-hidden shrink-0 bg-s-900 dark:bg-g-950 text-gray-100 md:w-64 w-3/4 px-0 absolute inset-y-0 left-0 transform md:sticky md:translate-x-0 transition duration-200 ease-in-out md:flex md:flex-col md:justify-between pt-4"
              >
                <div class="flex items-center justify-center">
                  <a href="#" class="" :title="$t('nameApp')">
                    <img src="/logo-t-white.png" class="" />
                  </a>
                </div>
                <div>
                  <!-- {{ window.require("electron").remote.app.getVersion() }} -->
                </div>
                <div class="flex flex-col">
                  <VNavbar v-if="authStore.tokenData" />
                  <!-- <VNavbarCMS v-if="authStore.tokenData" /> -->
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

                <div
                  v-if="authStore.iam?.id"
                  class="bg-white/5 mx-4 p-2 rounded-lg flex flex-row gap-2 mb-4"
                >
                  <div class="flex-auto">
                    <UserInfoAside />
                  </div>
                  <UserExitButton />
                </div>

                <div
                  class="py-1.5 bg-black/20 w-full text-sm text-s-500 dark:text-g-500 flex items-center"
                >
                  <div class="flex flex-row pl-2">
                    <VChangerMode />
                  </div>
                  <div class="flex-auto pr-4">
                    {{ $t("version") }}: {{ version }}
                  </div>
                  <div class="flex-auto"></div>
                  <div class="px-4">
                    <UserNotify v-if="authStore.iam?.id" />
                  </div>
                </div>
              </aside>
              <div
                class="flex-auto flex flex-col overflow-auto b-scroll bg-white dark:bg-g-900"
              >
                <div class="flex-auto flex">
                  <RouterView v-slot="{ Component }">
                    <template v-if="Component">
                      <!-- <Transition mode="out-in"> -->
                      <!-- <KeepAlive> -->
                      <Suspense>
                        <!-- main content -->
                        <component :is="Component"></component>

                        <!-- loading state -->
                        <template #fallback>
                          <div class="p-4">
                            <a-spin />
                          </div>
                        </template>
                      </Suspense>
                      <!-- </KeepAlive> -->
                      <!-- </Transition> -->
                    </template>
                  </RouterView>
                </div>
                <!-- <footer
                  class="flex flex-row bg-s-50 border-t border-s-200 dark:bg-g-950"
                >
                  <div class="flex flex-row items-center w-64 h-full">
                    <div
                      class="flex-auto flex items-center justify-center"
                    ></div>
                  </div>
                  <div>
                    <VChangerMode />
                  </div>
                </footer> -->
              </div>
            </div>
          </div>
        </template>
      </div>
    </a-app>
  </a-config-provider>
</template>
