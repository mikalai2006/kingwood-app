import { $get, $patch, $post } from "@/utils/http/axios";
import { IRequestParams, IResponseData } from "@/api/types";
import { ITaskWorker, ITaskWorkerInput } from "./types";

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

export { find, get, create, patch };
