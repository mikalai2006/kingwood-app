import { $delete, $post } from "@/utils/http/axios";
import { IRequestParams, IResponseData } from "@/api/types";
import {
  IArchiveNotify,
  IArchiveNotifyFilter,
  IArchiveOrder,
  IArchiveOrderFilter,
  IArchiveUser,
  IArchiveUserFilter,
  IArchiveWorkHistory,
  IArchiveWorkHistoryFilter,
} from "./types";
import { INotifyListQuery } from "../notify/types";

enum URLS {
  notify = "/archive_notify",
  workHistory = "/archive_work_history",
  order = "/archive_order",
  user = "/archive_user",
}

const findArchiveNotify = async (data: IArchiveNotifyFilter) =>
  $post<IResponseData<IArchiveNotify>>({
    url: `${URLS.notify}/find`,
    data,
  });

const removeArchiveNotify = async (id: string | number) =>
  $delete<IArchiveNotify>({
    url: `${URLS.notify}/${id}`,
  });

const findArchiveOrder = async (data: IArchiveOrderFilter) =>
  $post<IResponseData<IArchiveOrder>>({
    url: `${URLS.order}/find`,
    data,
  });

const removeArchiveOrder = async (id: string | number) =>
  $delete<IArchiveOrder>({
    url: `${URLS.order}/${id}`,
  });

const findArchiveWorkHistory = async (data: IArchiveWorkHistoryFilter) =>
  $post<IResponseData<IArchiveWorkHistory>>({
    url: `${URLS.workHistory}/find`,
    data,
  });

const removeArchiveWorkHistory = async (id: string | number) =>
  $delete<IArchiveWorkHistory>({
    url: `${URLS.workHistory}/${id}`,
  });

const findArchiveUser = async (data: IArchiveUserFilter) =>
  $post<IResponseData<IArchiveUser>>({
    url: `${URLS.user}/find`,
    data,
  });

const removeArchiveUser = async (id: string | number) =>
  $delete<IArchiveUser>({
    url: `${URLS.user}/${id}`,
  });

const removeListArchiveNotify = async (data: INotifyListQuery) =>
  $post<IArchiveNotify[]>({
    url: `${URLS.notify}/remove_list`,
    data,
  });

export {
  findArchiveNotify,
  removeArchiveNotify,
  findArchiveWorkHistory,
  removeArchiveWorkHistory,
  findArchiveOrder,
  removeArchiveOrder,
  findArchiveUser,
  removeArchiveUser,
  removeListArchiveNotify,
};
