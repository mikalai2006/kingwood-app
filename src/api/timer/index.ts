import { $post } from "@/utils/http/axios";
import { ITimer, ITimerFilter } from "./types";
import { IResponseData } from "../types";

enum URLS {
  path = "/timer",
}

const find = async (data: ITimerFilter) =>
  $post<IResponseData<ITimer>>({
    url: `${URLS.path}/populate`,
    data,
  });

export { find };
