import type { IWsMessage } from "@/api/types";
// import router from "@/router";
import {
  useAuthStore,
  useOrderStore,
  useTaskStatusStore,
  useTaskStore,
  useTaskWorkerStore,
  useUserStore,
} from "@/store";

export const useSocket = () => {
  const authStore = useAuthStore();
  const userStore = useUserStore();
  const taskStore = useTaskStore();
  const taskStatusStore = useTaskStatusStore();
  const taskWorkerStore = useTaskWorkerStore();
  const orderStore = useOrderStore();

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
      console.log("socket onclose: ", event);
      // console.log("router1", router);

      // setTimeout(() => {
      //   // connect();
      //   console.log("router2", router);

      //   router.go(0);
      // }, 5000);
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

          case "task":
            if (method === "DELETE") {
              taskStore.onRemoveItemFromStore(content.id);
            } else {
              taskStore.onAddItemToStore(content);
              // window?.ipcRenderer?.show("title", "body");

              new window.Notification("Изменение задания", {
                body: `Тестовое сообщение`,
              }).onclick = () => {
                // document.getElementById("output").innerText = CLICK_MESSAGE;
              };
            }
            break;

          case "taskWorker":
            if (method === "DELETE") {
              taskWorkerStore.onRemoveItemFromStore(content.id);
            } else {
              taskWorkerStore.onAddItemToStore(content);
            }
            break;

          case "order":
            if (method === "DELETE") {
            } else {
              orderStore.onAddItemToStore(content);
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
