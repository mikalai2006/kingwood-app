import { $delete, $get, $patch, $post } from "@/utils/http/axios";
import { IRequestParams, IResponseData } from "@/api/types";
import { IOrder, IOrderFilter, IOrderInput } from "./types";

enum URLS {
  path = "/order",
}

const find = async (data: IOrderFilter) =>
  $post<IResponseData<IOrder>>({
    url: `${URLS.path}/find`,
    data,
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

const remove = async (id: string | number, data: IOrderInput) =>
  $delete<IOrder>({
    url: `${URLS.path}/${id}`,
    data,
  });

export { find, get, create, patch, remove };
