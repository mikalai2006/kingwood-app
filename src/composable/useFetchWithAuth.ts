import { useAuthStore } from "@/store";
import { useI18n } from "vue-i18n";

export const useFetchWithAuth = () => {
  const authStore = useAuthStore();

  const { onSyncToken, tokenData } = useAuthStore();
  const { t } = useI18n();

  // const onFetchWithAuthRef: (input: RequestInfo, init?: RequestInit | undefined) => Promise<Response> = null!;
  // const onFetchWithAuth = (input: RequestInfo, init?: RequestInit | undefined) => {
  //     return onFetchWithAuthRef.current(input, init);
  //   };
  const onFetchWithAuth = async (
    input: RequestInfo,
    init?: RequestInit | undefined
  ): Promise<Response> => {
    const _tokens = await onSyncToken();
    if (!_tokens) {
      // console.log("tokens: ", tokens);
      throw new Error(t("general:httpError.notFoundToken"));
    }
    // const stateNet = await NetInfo.fetch();
    // console.log('onFetch:::::', stateNet);

    // if (!stateNet.isConnected) {
    //   throw new Error(t("general:httpError.notConnect"));
    // }

    if (init) {
      const headers = new Headers(init?.headers);
      headers.set("Authorization", `Bearer ${_tokens?.access_token}`);
      init.headers = headers;
      // headers.forEach((el, key) => {
      //     console.log(el, key);
      // });
    }

    // if (!tokenData) {
    //     throw new Error('Not found tokens');
    // }
    // console.log(init);

    const controller = new AbortController();

    const timeoutId = setTimeout(() => controller.abort(), 5000);
    // console.log(`onFetchWithAuth: ${timeoutId}`, input);
    return await fetch(input, { ...init, signal: controller.signal })
      .then((response: any) => {
        if (response?.message || response?.code) {
          throw new Error(`${response?.code}: ${response?.message}`);
        }
        // завершенный запрос до истечения тайм-аута
        // Если вы хотите заблокировать только запрос, а не ответ, добавьте:
        clearTimeout(timeoutId);
        return response;
      })
      .then(function (response) {
        // console.log(`FetchWithAuth ${timeoutId} complete. (Not aborted)`);
        return response;
      })
      .catch(function (err) {
        // console.error(`FetchWithAuth ${timeoutId} error: ${err}`);
        throw err;
      });
  };

  return {
    onFetchWithAuth,
  };
};
