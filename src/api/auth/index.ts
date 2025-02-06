import { $post, $get, $patch } from "@/utils/http/axios";
import { IUser } from "../user/types";
import {
  ILoginData,
  IResResultLogin,
  ILoginRefreshToken,
  IAuthInput,
} from "./types";

enum URLS {
  auth = "/auth",
  auth_login = "/auth/sign-in",
  reg_login = "/auth/sign-up",
  refresh_token = "/auth/refresh",
  iam = "/auth/iam",
}

const login = async (data: ILoginData): Promise<IResResultLogin> =>
  await fetch(import.meta.env.VITE_HOST_API + "/api/v1" + URLS.auth_login, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({ ...data }),
  })
    .then((r) => r.json())
    .then((r) => r)
    .catch((e) => {
      throw e;
    });
// $post<IResResultLogin>({
//   url: URLS.auth_login,
//   data,
// });

const register = async (data: IUser): Promise<IUser> =>
  $post<IUser>({
    url: URLS.reg_login,
    data,
  });

const refresh_token = async (
  data: ILoginRefreshToken
): Promise<IResResultLogin> =>
  await fetch(import.meta.env.VITE_HOST_API + "/api/v1" + URLS.refresh_token, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...data }),
  })
    .then((r) => r.json())
    .then((r) => r);
// await $post<IResResultLogin>({
//   url: URLS.refresh_token,
//   data,
// });

const getIamFromServer = async () =>
  await $get<IUser>({
    url: URLS.iam,
  });

// const get = async (params: ILoginData): Promise<IResResultLogin> =>
//   $get<IResResultLogin>({
//     url: URLS.auth,
//     params,
//   })

const logout = async (data: ILoginRefreshToken): Promise<IResResultLogin> =>
  $post<IResResultLogin>({
    url: `${URLS.auth}/logout`,
    data,
  });

const resetPassword = async (id: string | number, data: IAuthInput) =>
  $post<string>({
    url: `${URLS.auth}/reset-password/${id}`,
    data,
  });

export {
  resetPassword,
  login,
  refresh_token,
  getIamFromServer,
  register,
  logout,
};
