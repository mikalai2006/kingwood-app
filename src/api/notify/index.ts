import { $delete, $patch, $post } from "@/utils/http/axios";
import { IResponseData } from "@/api/types";
import {
  INotify,
  INotifyFilter,
  INotifyInput,
  INotifyListQuery,
} from "./types";

enum URLS {
  path = "/notify",
}

const findPopulate = async (data: INotifyFilter) =>
  $post<IResponseData<INotify>>({
    url: `${URLS.path}/populate`,
    data,
  });

const create = async (data: INotifyInput) =>
  $post<INotify>({
    url: `${URLS.path}`,
    data,
  });

const patch = async (id: string | number, data: INotifyInput) =>
  $patch<INotify>({
    url: `${URLS.path}/${id}`,
    data,
  });

const remove = async (id: string | number) =>
  $delete<INotify>({
    url: `${URLS.path}/${id}`,
  });

const removeList = async (data: INotifyListQuery) =>
  $post<INotify[]>({
    url: `${URLS.path}/remove_list`,
    data,
  });

export { create, patch, remove, findPopulate, removeList };
