import type { IWsMessage } from "@/api/types";
import VIcon from "@/components/UI/VIcon.vue";
import {
  useAuthStore,
  useMessageStore,
  useNotifyStore,
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
import { useI18n } from "vue-i18n";
import { MessageApi } from "ant-design-vue/es/message";

export interface IUseSocketProps {
  router: Router;
  t: any;
  noty: ReturnType<typeof composableNotification>;
  message: MessageApi;
}

export const useSocket = (props: IUseSocketProps) => {
  const authStore = useAuthStore();
  const userStore = useUserStore();
  const taskStore = useTaskStore();
  const payStore = usePayStore();
  const taskStatusStore = useTaskStatusStore();
  const taskWorkerStore = useTaskWorkerStore();
  const messageStore = useMessageStore();
  const orderStore = useOrderStore();
  const workHistoryStore = useWorkHistoryStore();
  const notifyStore = useNotifyStore();

  // console.log("router0", router.currentRoute);

  const connect = () => {
    const _socket = new WebSocket(
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
        modal.confirm({
          title: h(
            "span",
            { class: "flex-auto text-g-800 dark:text-g-100" },
            props?.t("info.disableServer")
          ),
          icon: h("span", { class: "anticon flex-none inline-flex " }, [
            h(VIcon, {
              path: iWraningTriangle,
              class: "text-2xl text-g-700 dark:text-g-200",
            }),
          ]),
          content: h(
            "div",
            { class: "text-g-700 dark:text-g-200" },
            props?.t("info.disableServerDescription")
          ),
          cancelButtonProps: { style: { display: "none" } } as any,
          onOk() {
            props?.router.go(0);
          },
          okText: props?.t("button.reload"),
          // onCancel() {
          //   props?.router.go(0);
          // },
          class: "test",
        });
        // console.log("router1", router);

        // setTimeout(() => {
        //   // connect();
        //   console.log("router2", router);

        //   router.go(0);
        // }, 5000);}
      }
    };

    _socket.onmessage = function (event) {
      const data: IWsMessage = JSON.parse(event.data);
      const { method, content, service } = data;

      console.groupCollapsed(`Event > ${service}: ${method}`);
      console.dir(JSON.parse(event.data));
      console.groupEnd();

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

              if (content.status == "finish") {
                props.noty.onShowNotify(
                  replaceSubstringByArray(
                    props.t(`message.taskWorkerComplete`),
                    [
                      content?.worker?.name || "",
                      content?.task?.name,
                      `№${content?.order.number} ${content?.order.name}`,
                      content?.object.name,
                    ]
                  )
                );
              }
            }
            break;

          case "message":
            if (method === "DELETE") {
              messageStore.onRemoveItemFromStore(content.id);
            } else {
              messageStore.onAddItemToStore(content);
            }
            break;

          case "notify":
            if (method === "DELETE") {
              notifyStore.onRemoveItemFromStore(content.id);
            } else {
              notifyStore.onAddItemToStore(content);
              props.noty.onShowNotify(
                content.message,
                content.title,
                "info",
                "bottomRight",
                0,
                () => {
                  console.log("change status notify: ", content);

                  if (content.id) {
                    notifyStore.patch(content.id, { status: 1 }).then(() => {
                      props.message.success(props.t("message.notifyReadOk"));
                    });
                  }
                }
              );
            }
            break;

          case "order":
            if (method === "DELETE") {
              orderStore.onRemoveItemFromStore(content.id);
            } else {
              orderStore.onAddItemToStore(content);
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
            console.log("UNKNOWN EVENT", event);

            break;
        }
      } catch (e) {
        console.log("useSocket error: ", e);
      }
    };
    return _socket;
  };

  const socket = connect();

  return {
    connect,
    socket,
  };
};
