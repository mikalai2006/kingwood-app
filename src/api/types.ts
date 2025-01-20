import { Dayjs } from "dayjs";

export interface IPaginationParams<T> {
  $limit?: number;
  $skip?: number;
  $sort?: {
    key: string;
    value: number;
  }[];
}

export interface IResponseData<T> {
  data: T[];
  limit: number;
  total: number;
  skip: number;
}

export interface IRequestParams<T> extends IPaginationParams<T> {
  test?: any;
  query?: string;
}

export interface IWsMessage {
  type: string;
  sender: string;
  method: "CREATE" | "PATCH" | "DELETE";
  recipient: string;
  content: any;
  id: string;
  service: string;
}

export interface IPaneOption {
  title: string;
  // content: string;
  key: string;
  closable?: boolean;
  index: number;
}

export type IPaneOptionInput = {
  [Property in keyof IPaneOption]?: IPaneOption[Property];
};

export interface IPaneOptionFinancy extends IPaneOption {
  month?: string;
  monthIndex?: number;
  workerId?: string;
  orderId?: string;
}
export type IPaneOptionFinancyInput = {
  [Property in keyof IPaneOptionFinancy]?: IPaneOptionFinancy[Property];
};

export interface IFormOptionFilter {
  label: string;
}

export type TimerData = {
  totalMinutes: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  days0: string;
  hours0: string;
  minutes0: string;
  seconds0: string;
  date: Dayjs;
};
