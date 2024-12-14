import type { IWsMessage } from "@/api/types";
// import router from "@/router";
import {
  useAuthStore,
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
      console.log("event.data: ", event.data);
      const data: IWsMessage = JSON.parse(event.data);
      const { method, content, service } = data;

      if (!content || !service) {
        return;
      }

      try {
        switch (service) {
          case "user":
            if (method === "REMOVE") {
            } else {
              userStore.onAddItemToStore(content);
            }
            break;

          case "task":
            if (method === "REMOVE") {
            } else {
              taskStore.onAddItemToStore(content);
            }
            break;

          case "taskWorker":
            if (method === "REMOVE") {
            } else {
              taskWorkerStore.onAddItemToStore(content);
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
