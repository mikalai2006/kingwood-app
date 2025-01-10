import { $delete, $get, $patch, $post } from "@/utils/http/axios";
import { IRequestParams, IResponseData } from "@/api/types";
import { ITaskMontajWorker, ITaskMontajWorkerInput } from "./types";

enum URLS {
  path = "/task_montaj_worker",
}

const find = async (
  params: IRequestParams<ITaskMontajWorker> | Partial<ITaskMontajWorker>
) =>
  $get<IResponseData<ITaskMontajWorker>>({
    url: URLS.path,
    params,
  });
const get = async (id: string | number) =>
  $get<ITaskMontajWorker>({
    url: `${URLS.path}/${id}`,
  });

const create = async (data: ITaskMontajWorkerInput) =>
  $post<ITaskMontajWorker>({
    url: `${URLS.path}`,
    data,
  });

const patch = async (id: string | number, data: ITaskMontajWorkerInput) =>
  $patch<ITaskMontajWorker>({
    url: `${URLS.path}/${id}`,
    data,
  });

const remove = async (id: string | number, data: ITaskMontajWorkerInput) =>
  $delete<ITaskMontajWorker>({
    url: `${URLS.path}/${id}`,
    data,
  });

export { find, get, create, patch, remove };
