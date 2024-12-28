import { $get, $patch, $post } from "@/utils/http/axios";
import { IRequestParams, IResponseData } from "@/api/types";
import { ITaskMontaj, ITaskMontajInput } from "./types";

enum URLS {
  path = "/task_montaj",
}

const find = async (
  params: IRequestParams<ITaskMontaj> | Partial<ITaskMontaj>
) =>
  $get<IResponseData<ITaskMontaj>>({
    url: `${URLS.path}/find`,
    params,
  });
const get = async (id: string | number) =>
  $get<ITaskMontaj>({
    url: `${URLS.path}/${id}`,
  });

const sort = async (data: ITaskMontajInput[]) =>
  $post<ITaskMontaj>({
    url: `${URLS.path}/sort`,
    data,
  });

const create = async (data: ITaskMontajInput) =>
  $post<ITaskMontaj>({
    url: `${URLS.path}`,
    data,
  });

const patch = async (id: string | number, data: ITaskMontajInput) =>
  $patch<ITaskMontaj>({
    url: `${URLS.path}/${id}`,
    data,
  });

export { find, get, create, patch, sort };
