import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { showMessage } from "./status";
import { IResponse } from "./type";
import { useAuthStore } from "@/store";
import { useI18n } from "vue-i18n";
// import { useUniversalCookies } from '@/plugins/universal-cookies'
// const cookie = useUniversalCookies()
// import { getToken } from '/@/utils/auth'
// If the request takes longer than `timeout`, the request will be interrupted
axios.defaults.timeout = 5000;
// Indicates whether credentials are required for cross-origin requests
axios.defaults.withCredentials = false;
// axios.defaults.headers.common['token'] =  AUTH_TOKEN
// Allow cross domain
axios.defaults.headers.post["Access-Control-Allow-Origin-Type"] = "*";

// axios.defaults.maxBodyLength = Infinity
// axios.defaults.maxBodyLength = Infinity

const axiosInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_HOST_API + "/api/v1", // import.meta.env.VITE_HOST_API +
});

// axios instance intercepts the response
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // if (response.headers.authorization) {
    //   localStorage.setItem('app_token', response.headers.authorization)
    // } else if (response.data && response.data.token) {
    //   localStorage.setItem('app_token', response.data.token)
    // }

    if (response.status === 200) {
      return response;
    }
    showMessage(response.status);
    return response;
  },
  // Request failed
  (error: any) => {
    // console.log("Request failed: ", error.response);

    // const { response } = error;
    if (error?.response) {
      // The request has been made, but is not in the scope of 2xx
      const errData = error?.response?.data;

      // console.log("errData:", errData, typeof errData);
      // const err: any = new Error(
      //   errData.message || showMessage(error?.response.status)
      // );
      // err.code = error?.response.status;
      return Promise.reject(
        errData.message || showMessage(error?.response.status)
      );
    } else {
      console.log("not response!");
      return Promise.reject(showMessage(0));
    }
    // showMessage("The network connection is abnormal, please try again later!");
  }
);

// axios instance intercepts requests
axiosInstance.interceptors.request.use(
  (config: any) => {
    if (!config.params) {
      config.params = {};
    }
    if (!config.headers) {
      config.headers = {};
    }
    // config.headers['Content-Type'] = 'multipart/form-data'

    // add param language.
    // const lanuage = cookie.get('current_lang') || undefined
    // if (lanuage) {
    //   config.params['language'] = lanuage
    // }
    // console.log('config=', config)
    return config;
  }
  // (error: any) => {
  //   // return Promise.reject(error)
  // }
);

export const setAxiosHeader = (name: string, data: string) => {
  // set header axios.
  // console.log('axiosInstance: set ', name, '=', data)
  if (data && name) {
    axiosInstance.defaults.headers[name] = data;
  }
};

export const deleteAxiosHeader = (key: string) => {
  // set header axios.
  // console.log('axiosInstance: remove ', key)
  if (key) {
    delete axiosInstance.defaults.headers[key];
  }
};

const request = async <T = any>(config: AxiosRequestConfig): Promise<T> => {
  const conf = config;
  const { onSyncToken } = useAuthStore();
  const _tokens = await onSyncToken();
  // console.log("_tokens: ", _tokens);
  if (!_tokens) {
    console.log("Error:", conf);

    throw new Error("error.notToken");
  }
  // const stateNet = await NetInfo.fetch();
  // console.log('onFetch:::::', stateNet);

  // if (!stateNet.isConnected) {
  //   throw new Error(t("general:httpError.notConnect"));
  // }

  // if (init) {
  //   const headers = new Headers(init?.headers);
  //   headers.set("Authorization", `Bearer ${_tokens?.access_token}`);
  //   init.headers = headers;
  //   // headers.forEach((el, key) => {
  //   //     console.log(el, key);
  //   // });
  // }

  setAxiosHeader("Authorization", `Bearer ${_tokens.access_token}`);

  return new Promise((resolve, reject) => {
    axiosInstance
      .request<any, AxiosResponse<IResponse>>(conf)
      .then((res: AxiosResponse<IResponse>) => {
        // resolve(res as unknown as Promise<T>);

        const {
          data, // : { result },
        } = res;
        // console.log('res=', res)
        resolve(data as T);
      })
      .catch((error) => {
        // let err = {
        //   code: 0,
        //   message: "",
        // };
        // if (axios.isAxiosError(error)) {
        //   console.error("AXIOS: error message: ", error);
        //   err.code = error.code ? Number.parseInt(error.code) : 0;
        //   err.message = error.message;
        // } else {
        //   if (error.response) {
        //     // The request was made and the server responded with a status code
        //     // that falls out of the range of 2xx
        //     console.log(error.response.data);
        //     console.log(error.response.status);
        //     console.log(error.response.headers);
        //   } else if (error.request) {
        //     // The request was made but no response was received
        //     // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        //     // http.ClientRequest in node.js
        //     console.log(error.request);
        //   } else {
        //     // console.log('Error', error);
        //     err = {
        //       code: error.code ? Number.parseInt(error.code) : 0,
        //       message: error.message,
        //     };
        //   }
        // }
        console.log("axios err", error);

        reject(error);
      });
  });
};

export function $get<T = any>(config: AxiosRequestConfig): Promise<T> {
  return request({ ...config, method: "GET" });
}

export function $post<T = any>(config: AxiosRequestConfig): Promise<T> {
  return request({ ...config, method: "POST" });
}

// export function $postFormData<T = any>(config: AxiosRequestConfig): Promise<T> {
//   return axios.postForm(config.url, config.data, {
//     // ...config,
//     // method: 'POST',
//     withCredentials: false,
//     baseURL: import.meta.env.VITE_HOST_API + '/api/v1',
//     headers: {
//       // 'Content-Type': 'multipart/form-data',
//       'Access-Control-Allow-Origin-Type': '*',
//       ...config.headers,
//     },
//     // transformRequest: (data) => data,
//   })
// }

export function $patch<T = any>(config: AxiosRequestConfig): Promise<T> {
  return request({ ...config, method: "PATCH" });
}
export function $delete<T = any>(config: AxiosRequestConfig): Promise<T> {
  return request({ ...config, method: "DELETE" });
}

export default request;
export type { AxiosInstance, AxiosResponse };
