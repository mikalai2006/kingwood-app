import { $delete, $patch, $post } from "@/utils/http/axios";
import { IResponseData } from "@/api/types";
import { IMessage, IMessageFilter } from "./types";

enum URLS {
  path = "/message",
}

const find = async (data: IMessageFilter) =>
  $post<IResponseData<IMessage>>({
    url: `${URLS.path}/find`,
    data,
  });

const create = async (data: FormData) =>
  $post<IMessage>({
    url: `${URLS.path}`,
    data,
  });

const patch = async (id: string | number, data: FormData) =>
  $patch<IMessage>({
    url: `${URLS.path}/${id}`,
    data,
  });

const remove = async (id: string | number) =>
  $delete<IMessage>({
    url: `${URLS.path}/${id}`,
  });

export { find, create, patch, remove };
