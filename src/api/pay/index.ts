import { $delete, $patch, $post } from "@/utils/http/axios";
import { IResponseData } from "@/api/types";
import { IPay, IPayFilter, IPayInput } from "./types";

enum URLS {
  path = "/pay",
}

const findPopulate = async (data: IPayFilter) =>
  $post<IResponseData<IPay>>({
    url: `${URLS.path}/populate`,
    data,
  });

const create = async (data: IPayInput) =>
  $post<IPay>({
    url: `${URLS.path}`,
    data,
  });

const patch = async (id: string | number, data: IPayInput) =>
  $patch<IPay>({
    url: `${URLS.path}/${id}`,
    data,
  });

const remove = async (id: string | number) =>
  $delete<IPay>({
    url: `${URLS.path}/${id}`,
  });
export { create, patch, remove, findPopulate };
