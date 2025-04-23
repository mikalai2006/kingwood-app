import { $delete, $patch, $post } from "@/utils/http/axios";
import { IResponseData } from "@/api/types";
import {
  IWorkHistory,
  IWorkHistoryFilter,
  IWorkHistoryInput,
  IWorkHistoryStatByMonth,
  IWorkHistoryStatByOrder,
} from "./types";

enum URLS {
  path = "/work_history",
}

const find = async (data: IWorkHistoryFilter) =>
  $post<IResponseData<IWorkHistory>>({
    url: `${URLS.path}/populate`,
    data,
  });

const getStatByOrder = async (data: IWorkHistoryFilter) =>
  $post<IWorkHistoryStatByOrder[]>({
    url: `${URLS.path}/statByOrder`,
    data,
  });

const getStatByMonth = async (data: IWorkHistoryFilter) =>
  $post<IWorkHistoryStatByMonth[]>({
    url: `${URLS.path}/statByMonth`,
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

export { find, create, patch, remove, getStatByOrder, getStatByMonth };
