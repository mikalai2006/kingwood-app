import { $delete, $patch, $post } from "@/utils/http/axios";
import { IResponseData } from "@/api/types";
import { IWorkHistory, IWorkHistoryFilter, IWorkHistoryInput } from "./types";

enum URLS {
  path = "/work_time",
}

const find = async (data: IWorkHistoryFilter) =>
  $post<IResponseData<IWorkHistory>>({
    url: `${URLS.path}/populate`,
    data,
  });

const create = async (data: IWorkHistoryInput) =>
  $post<IWorkHistory>({
    url: `${URLS.path}`,
    data,
  });

const patch = async (id: string | number, data: IWorkHistoryInput) =>
  $patch<IWorkHistory>({
    url: `${URLS.path}/${id}`,
    data,
  });

const remove = async (id: string | number) =>
  $delete<IWorkHistory>({
    url: `${URLS.path}/${id}`,
  });

export { find, create, patch, remove };
