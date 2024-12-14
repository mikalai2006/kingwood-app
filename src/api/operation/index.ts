import { $get, $patch, $post } from "@/utils/http/axios";
import { IRequestParams, IResponseData } from "@/api/types";
import { IOperation } from "./types";

enum URLS {
  path = "/operation",
}

const find = async (params: IRequestParams<IOperation> | Partial<IOperation>) =>
  $get<IResponseData<IOperation>>({
    url: URLS.path,
    params,
  });
const get = async (id: string | number) =>
  $get<IOperation>({
    url: `${URLS.path}/${id}`,
  });

const create = async (data: IOperation) =>
  $post<IOperation>({
    url: `${URLS.path}`,
    data,
  });

const patch = async (id: string | number, data: IOperation) =>
  $patch<IOperation>({
    url: `${URLS.path}/${id}`,
    data,
  });

export { find, get, create, patch };
