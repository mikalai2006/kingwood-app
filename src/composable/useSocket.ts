import type { IWsMessage } from "@/api/types";
import VIcon from "@/components/UI/VIcon.vue";
import {
  useAppErrorStore,
  useAuthStore,
  useMessageStore,
  useNotifyStore,
  useObjectStore,
  useOrderStore,
  usePayStore,
  useTaskStatusStore,
  useTaskStore,
  useTaskWorkerStore,
  useUserStore,
  useWorkHistoryStore,
} from "@/store";
import { iWraningTriangle } from "@/utils/icons";
import modal from "ant-design-vue/es/modal";
import { h } from "vue";
import { Router } from "vue-router";
import composableNotification from "@/composable/useNotification";
import { replaceSubstringByArray } from "@/utils/utils";
import { MessageApi } from "ant-design-vue/es/message";
import ReconnectingWebSocket from "reconnecting-websocket";

export interface IUseSocketProps {
  router: Router;
  t: any;
  noty: ReturnType<typeof composableNotification>;
  message: MessageApi;
}

let socket: ReconnectingWebSocket | null;

const keyMessage = "socketMessage";

export const useSocket = (props: IUseSocketProps) => {
  const authStore = useAuthStore();
  const userStore = useUserStore();
  const taskStore = useTaskStore();
  const payStore = usePayStore();
  const taskStatusStore = useTaskStatusStore();
  const taskWorkerStore = useTaskWorkerStore();
  const messageStore = useMessageStore();
  const appErrorStore = useAppErrorStore();
  const orderStore = useOrderStore();
  const objectStore = useObjectStore();
  const workHistoryStore = useWorkHistoryStore();
  const notifyStore = useNotifyStore();

  // console.log("router0", router.currentRoute);

  const connect = () => {
    let _socket: ReconnectingWebSocket | null = new ReconnectingWebSocket(
      `${import.meta.env.VITE_HOST_SOCKET}/api/v1/ws/room1`,
      [
        "Sec-WebSocket-Protocol",
        `Bearer-${authStore.tokenData?.access_token}`,
        "JSON",
      ]
    );
    _socket.onclose = function (event) {
      if (authStore.tokenData) {
        // console.log("socket onclose: ", event);
        // message.destroy();
        props.message.loading(
          {
            content: props.t("info.refreshSocket"),
            key: keyMessage,
            duration: 0,
          },
          0
        );
        // .then(
        //   () => message.success('success connect', 2.5),
        //   // eslint-disable-next-line @typescript-eslint/no-empty-function
        //   () => {},
        // );
        // const sModal = modal.confirm({
        //   title: h(
        //     "span",
        //     { class: "flex-auto text-g-800 dark:text-g-100" },
        //     props?.t("info.disableServer")
        //   ),
        //   icon: h("span", { class: "anticon flex-none inline-flex " }, [
        //     h(VIcon, {
        //       path: iWraningTriangle,
        //       class: "text-2xl text-g-700 dark:text-g-200",
        //     }),
        //   ]),
        //   content: h(
        //     "div",
        //     { class: "text-g-700 dark:text-g-200" },
        //     props?.t("info.disableServerDescription")
        //   ),
        //   cancelButtonProps: { style: { display: "none" } } as any,
        //   onOk() {
        //     props?.router.go(0);
        //   },
        //   okText: props?.t("button.reload"),
        //   // onCancel() {
        //   //   props?.router.go(0);
        //   // },
        //   class: "test",
        // });
        // // console.log("router1", router);

        // socket?.close();
        // socket = null;

        // setTimeout(() => {
        //   // sModal?.destroy();
        //   connect();
        //   // console.log("refresh socket");

        //  //router.go(0);
        // }, 1000);
      }
    };

    _socket.onerror = function (event) {
      // message.destroy();
      props.message.error({
        content: props.t("info.errorConnectionSocket"),
        key: keyMessage,
      });
      setTimeout(
        () =>
          props.message.loading(
            {
              content: props.t("info.refreshSocket"),
              key: keyMessage,
              duration: 0,
            },
            0
          ),
        1000
      );
      // socket?.close();
    };

    _socket.onmessage = function (event) {
      const data: IWsMessage = JSON.parse(event.data);
      const { method, content, service } = data;

      import.meta.env.VIEW_CONSOLE &&
        console.groupCollapsed(`Event > ${service}: ${method}`);
      import.meta.env.VIEW_CONSOLE && console.dir(JSON.parse(event.data));
      import.meta.env.VIEW_CONSOLE && console.groupEnd();

      if (!content || !service) {
        return;
      }

      try {
        switch (service) {
          case "user":
            if (method === "DELETE") {
            } else {
              userStore.onAddItemToStore(content);
            }
            break;

          case "pay":
            if (method === "DELETE") {
              payStore.onRemoveItemFromStore(content.id);
            } else {
              payStore.onAddItemToStore(content);
            }
            break;

          case "task":
            if (method === "DELETE") {
              taskStore.onRemoveItemFromStore(content.id);
            } else {
              taskStore.onAddItemToStore(content);
              // window?.ipcRenderer?.show("title", "body");

              // const allStatus = content?.workers?.map((t: any) => t.status);
              // console.log("allStatus", allStatus);

              // if (
              //   content.status == "finish" &&
              //   allStatus?.every((tt: any) =>
              //     ["finish", "autofinish"].includes(tt)
              //   )
              // ) {
              //   props.noty.onShowNotify(
              //     replaceSubstringByArray(props.t(`message.taskComplete`), [
              //       `№${content?.order.number} ${content?.order.name}`,
              //       content?.object.name,
              //     ])
              //   );
              // }
              // new window.Notification("Изменение задания", {
              //   body: `Тестовое сообщение`,
              // }).onclick = () => {
              //   // document.getElementById("output").innerText = CLICK_MESSAGE;
              // };
            }
            break;

          case "taskWorker":
            if (method === "DELETE") {
              taskWorkerStore.onRemoveItemFromStore(content.id);
            } else {
              taskWorkerStore.onAddItemToStore(content);

              // if (content.status == "finish") {
              //   props.noty.onShowNotify(
              //     replaceSubstringByArray(
              //       props.t(`message.taskWorkerComplete`),
              //       [
              //         content?.worker?.name || "",
              //         content?.task?.name,
              //         `№${content?.order.number} ${content?.order.name}`,
              //         content?.object.name,
              //       ]
              //     )
              //   );
              // }
            }
            break;

          case "message":
            if (method === "DELETE") {
              messageStore.onRemoveItemFromStore(content.id);
            } else {
              messageStore.onAddItemToStore(content);
            }
            break;

          case "appError":
            if (method === "DELETE") {
              appErrorStore.onRemoveItemFromStore(content.id);
            } else {
              appErrorStore.onAddItemToStore(content);
            }
            break;

          case "notify":
            if (method === "DELETE") {
              notifyStore.onRemoveItemFromStore(content.id);
            } else {
              notifyStore.onAddItemToStore(content);

              if (data.recipient != data.sender) {
                props.noty.onShowNotify(
                  content.message,
                  content.title,
                  "info",
                  "bottomRight",
                  0,
                  () => {
                    import.meta.env.VIEW_CONSOLE &&
                      console.log("change status notify: ", content);

                    if (content.id) {
                      notifyStore.patch(content.id, { status: 1 }).then(() => {
                        props.message.success(props.t("message.notifyReadOk"));
                      });
                    }
                  }
                );
              }
            }
            break;

          case "order":
            if (method === "DELETE") {
              orderStore.onRemoveItemFromStore(content.id);
            } else {
              orderStore.onAddItemToStore(content);
            }
            break;

          case "object":
            if (method === "DELETE") {
              objectStore.onRemoveItemFromStore(content.id);
            } else {
              objectStore.onAddItemToStore(content);
            }
            break;

          case "workHistory":
            if (method === "DELETE") {
              workHistoryStore.onRemoveItemFromStore(content.id);
            } else {
              workHistoryStore.onAddItemToStore(content);
            }
            break;

          default:
            import.meta.env.VIEW_CONSOLE && console.log("UNKNOWN EVENT", event);

            break;
        }
      } catch (e) {
        console.error("useSocket error: ", e);
      }
    };
    return _socket;
  };

  socket = connect();

  window.onbeforeunload = function () {
    // socket.onclose = function () {}; // disable onclose handler first

    socket?.close();
    console.log("Close socket");
  };

  return {
    connect,
    socket,
    keyMessage,
  };
};
