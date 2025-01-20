import { $delete, $get, $patch, $post } from "@/utils/http/axios";
import { IRequestParams, IResponseData } from "@/api/types";
import { IPayTemplate, IPayTemplateInput } from "./types";

enum URLS {
  path = "/pay_template",
}

const find = async (
  params: IRequestParams<IPayTemplate> | Partial<IPayTemplate>
) =>
  $get<IResponseData<IPayTemplate>>({
    url: URLS.path,
    params,
  });
const get = async (id: string | number) =>
  $get<IPayTemplate>({
    url: `${URLS.path}/${id}`,
  });

const create = async (data: IPayTemplate) =>
  $post<IPayTemplate>({
    url: `${URLS.path}`,
    data,
  });

const patch = async (id: string | number, data: IPayTemplateInput) =>
  $patch<IPayTemplate>({
    url: `${URLS.path}/${id}`,
    data,
  });

const remove = async (id: string | number) =>
  $delete<IPayTemplate>({
    url: `${URLS.path}/${id}`,
  });
export { find, get, create, patch, remove };
