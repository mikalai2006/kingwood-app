import { $delete, $get, $post } from "@/utils/http/axios";
import { IAnalytic } from "./types";

enum URLS {
  analytic = "/analytic",
}

const getAnalytic = async () =>
  $get<IAnalytic>({
    url: `${URLS.analytic}/get`,
  });

export { getAnalytic };
