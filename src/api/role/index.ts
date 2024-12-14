import { $get, $patch, $post } from "@/utils/http/axios";
import { IRequestParams, IResponseData } from "@/api/types";
import { IRole } from "./types";

enum URLS {
  path = "/role",
}

const find = async (params: IRequestParams<IRole> | Partial<IRole>) =>
  $get<IResponseData<IRole>>({
    url: URLS.path,
    params,
  });
const get = async (id: string | number) =>
  $get<IRole>({
    url: `${URLS.path}/${id}`,
  });

const create = async (data: IRole) =>
  $post<IRole>({
    url: `${URLS.path}`,
    data,
  });

const patch = async (id: string | number, data: IRole) =>
  $patch<IRole>({
    url: `${URLS.path}/${id}`,
    data,
  });
export { find, get, create, patch };
