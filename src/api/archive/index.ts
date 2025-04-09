import { $delete, $post } from "@/utils/http/axios";
import { IRequestParams, IResponseData } from "@/api/types";
import {
  IArchiveNotify,
  IArchiveNotifyFilter,
  IArchiveWorkHistory,
  IArchiveWorkHistoryFilter,
} from "./types";

enum URLS {
  notify = "/archive_notify",
  workHistory = "/archive_work_history",
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

const findArchiveWorkHistory = async (data: IArchiveWorkHistoryFilter) =>
  $post<IResponseData<IArchiveWorkHistory>>({
    url: `${URLS.workHistory}/find`,
    data,
  });

const removeArchiveWorkHistory = async (id: string | number) =>
  $delete<IArchiveWorkHistory>({
    url: `${URLS.workHistory}/${id}`,
  });

export {
  findArchiveNotify,
  removeArchiveNotify,
  findArchiveWorkHistory,
  removeArchiveWorkHistory,
};
