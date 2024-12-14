import { $get, $patch, $post } from "@/utils/http/axios";
import { IRequestParams, IResponseData } from "@/api/types";
import { ITaskStatus } from "./types";

enum URLS {
  path = "/task_status",
}

const find = async (
  params: IRequestParams<ITaskStatus> | Partial<ITaskStatus>
) =>
  $get<IResponseData<ITaskStatus>>({
    url: URLS.path,
    params,
  });
const get = async (id: string | number) =>
  $get<ITaskStatus>({
    url: `${URLS.path}/${id}`,
  });

const create = async (data: ITaskStatus) =>
  $post<ITaskStatus>({
    url: `${URLS.path}`,
    data,
  });

const patch = async (id: string | number, data: ITaskStatus) =>
  $patch<ITaskStatus>({
    url: `${URLS.path}/${id}`,
    data,
  });

export { find, get, create, patch };
