import { $get, $patch, $post } from "@/utils/http/axios";
import { IRequestParams, IResponseData } from "@/api/types";
import { IOrder, IOrderInput } from "./types";

enum URLS {
  path = "/order",
}

const find = async (params: IRequestParams<IOrder> | Partial<IOrder>) =>
  $get<IResponseData<IOrder>>({
    url: URLS.path,
    params,
  });
const get = async (id: string | number) =>
  $get<IOrder>({
    url: `${URLS.path}/${id}`,
  });

const create = async (data: IOrderInput) =>
  $post<IOrder>({
    url: `${URLS.path}`,
    data,
  });

const patch = async (id: string | number, data: IOrderInput) =>
  $patch<IOrder>({
    url: `${URLS.path}/${id}`,
    data,
  });

export { find, get, create, patch };