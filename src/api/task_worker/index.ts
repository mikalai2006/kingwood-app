import { $delete, $get, $patch, $post } from "@/utils/http/axios";
import { IRequestParams, IResponseData } from "@/api/types";
import { ITaskWorker, ITaskWorkerFilter, ITaskWorkerInput } from "./types";

enum URLS {
  path = "/task_worker",
}

const find = async (
  params: IRequestParams<ITaskWorker> | Partial<ITaskWorker>
) =>
  $get<IResponseData<ITaskWorker>>({
    url: URLS.path,
    params,
  });

const findPopulate = async (data: ITaskWorkerFilter) =>
  $post<IResponseData<ITaskWorker>>({
    url: `${URLS.path}/populate`,
    data,
  });
const get = async (id: string | number) =>
  $get<ITaskWorker>({
    url: `${URLS.path}/${id}`,
  });

const create = async (data: ITaskWorkerInput) =>
  $post<ITaskWorker>({
    url: `${URLS.path}`,
    data,
  });

const patch = async (id: string | number, data: ITaskWorkerInput) =>
  $patch<ITaskWorker>({
    url: `${URLS.path}/${id}`,
    data,
  });

const remove = async (id: string | number, data: ITaskWorkerInput) =>
  $delete<ITaskWorker>({
    url: `${URLS.path}/${id}`,
    data,
  });

export { find, get, create, patch, remove, findPopulate };
