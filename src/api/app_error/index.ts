import { $delete, $patch, $post } from "@/utils/http/axios";
import { IResponseData } from "@/api/types";
import { IAppError, IAppErrorFilter, IAppErrorInput } from "./types";

enum URLS {
  path = "/app_error",
}

const findPopulate = async (data: IAppErrorFilter) =>
  $post<IResponseData<IAppError>>({
    url: `${URLS.path}/populate`,
    data,
  });

const create = async (data: IAppErrorInput) =>
  $post<IAppError>({
    url: `${URLS.path}`,
    data,
  });

const patch = async (id: string | number, data: IAppErrorInput) =>
  $patch<IAppError>({
    url: `${URLS.path}/${id}`,
    data,
  });

const remove = async (id: string | number) =>
  $delete<IAppError>({
    url: `${URLS.path}/${id}`,
  });

export { create, patch, remove, findPopulate };
