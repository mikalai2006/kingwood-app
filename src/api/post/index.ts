import { $get, $patch, $post } from "@/utils/http/axios";
import { IRequestParams, IResponseData } from "@/api/types";
import { IPost } from "./types";

enum URLS {
  path = "/post",
}

const find = async (params: IRequestParams<IPost> | Partial<IPost>) =>
  $get<IResponseData<IPost>>({
    url: URLS.path,
    params,
  });
const get = async (id: string | number) =>
  $get<IPost>({
    url: `${URLS.path}/${id}`,
  });

const create = async (data: IPost) =>
  $post<IPost>({
    url: `${URLS.path}`,
    data,
  });

const patch = async (id: string | number, data: IPost) =>
  $patch<IPost>({
    url: `${URLS.path}/${id}`,
    data,
  });

export { find, get, create, patch };
