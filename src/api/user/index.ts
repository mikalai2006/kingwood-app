import { $get, $patch, $post } from "@/utils/http/axios";
import { IRequestParams, IResponseData } from "@/api/types";
import { IUser, IUserInput } from "./types";

enum URLS {
  path = "/user",
}

const find = async (params: IRequestParams<IUser> | Partial<IUser>) =>
  $get<IResponseData<IUser>>({
    url: URLS.path,
    params,
  });
const get = async (id: string | number) =>
  $get<IUser>({
    url: `${URLS.path}/${id}`,
  });

const create = async (data: IUserInput) =>
  $post<IUser>({
    url: `${URLS.path}`,
    data,
  });

const patch = async (id: string | number, data: FormData) =>
  $patch<IUser>({
    url: `${URLS.path}/${id}`,
    data,
  });
export { find, get, create, patch };
