import { $delete, $get } from "@/utils/http/axios";
import { IRequestParams, IResponseData } from "@/api/types";
import { IImage } from "./types";

enum URLS {
  path = "/image",
}

const find = async (params: IRequestParams<IImage> | Partial<IImage>) =>
  $get<IResponseData<IImage>>({
    url: URLS.path,
    params,
  });
const get = async (id: string | number) =>
  $get<IImage>({
    url: `${URLS.path}/${id}`,
  });
const remove = async (id: string | number) =>
  $delete<IImage>({
    url: `${URLS.path}/${id}`,
  });
export { find, get, remove };
