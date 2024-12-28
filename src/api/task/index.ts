import { $delete, $get, $patch, $post } from "@/utils/http/axios";
import { IRequestParams, IResponseData } from "@/api/types";
import { ITask, ITaskInput } from "./types";

enum URLS {
  path = "/task",
}

const find = async (params: IRequestParams<ITask> | Partial<ITask>) =>
  $get<IResponseData<ITask>>({
    url: URLS.path,
    params,
  });
const get = async (id: string | number) =>
  $get<ITask>({
    url: `${URLS.path}/${id}`,
  });

const sort = async (data: ITaskInput[]) =>
  $post<ITask>({
    url: `${URLS.path}/sort`,
    data,
  });

const create = async (data: ITaskInput) =>
  $post<ITask>({
    url: `${URLS.path}`,
    data,
  });

const patch = async (id: string | number, data: ITaskInput) =>
  $patch<ITask>({
    url: `${URLS.path}/${id}`,
    data,
  });

const remove = async (id: string | number, data: ITaskInput) =>
  $delete<ITask>({
    url: `${URLS.path}/${id}`,
    data,
  });

export { find, get, create, patch, sort, remove };
