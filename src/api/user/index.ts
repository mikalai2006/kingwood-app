import { $delete, $get, $patch, $post } from "@/utils/http/axios";
import { IResponseData } from "@/api/types";
import { IUser, IUserFilter, IUserInput } from "./types";

enum URLS {
  path = "/user",
}

const find = async (data: IUserFilter) =>
  $post<IResponseData<IUser>>({
    url: `${URLS.path}/populate`,
    data,
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

const remove = async (id: string | number) =>
  $delete<IUser>({
    url: `${URLS.path}/${id}`,
  });
export { find, get, create, patch, remove };
