import { $get, $patch, $post } from "@/utils/http/axios";
import { IRequestParams, IResponseData } from "@/api/types";
import { IObject, IObjectInput } from "./types";

enum URLS {
  path = "/object",
}

const find = async (data: IRequestParams<IObject> | Partial<IObject>) =>
  $post<IResponseData<IObject>>({
    url: `${URLS.path}/find`,
    data,
  });
const get = async (id: string | number) =>
  $get<IObject>({
    url: `${URLS.path}/${id}`,
  });

const sort = async (data: IObjectInput[]) =>
  $post<IObject>({
    url: `${URLS.path}/sort`,
    data,
  });

const create = async (data: IObjectInput) =>
  $post<IObject>({
    url: `${URLS.path}`,
    data,
  });

const patch = async (id: string | number, data: IObjectInput) =>
  $patch<IObject>({
    url: `${URLS.path}/${id}`,
    data,
  });

export { find, get, create, patch, sort };
