import { $delete, $patch, $post } from "@/utils/http/axios";
import { IResponseData } from "@/api/types";
import { IWorkTimeInput, IWorkTime, IWorkTimeFilter } from "./types";

enum URLS {
  path = "/work_time",
}

const find = async (data: IWorkTimeFilter) =>
  $post<IResponseData<IWorkTime>>({
    url: `${URLS.path}/populate`,
    data,
  });

const create = async (data: IWorkTimeInput) =>
  $post<IWorkTime>({
    url: `${URLS.path}`,
    data,
  });

const patch = async (id: string | number, data: IWorkTimeInput) =>
  $patch<IWorkTime>({
    url: `${URLS.path}/${id}`,
    data,
  });

const remove = async (id: string | number) =>
  $delete<IWorkTime>({
    url: `${URLS.path}/${id}`,
  });

export { find, create, patch, remove };
