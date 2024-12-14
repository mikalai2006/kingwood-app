export interface IPaginationParams<T> {
  $limit?: number;
  $skip?: number;
  $sort?: [
    {
      [K in keyof T]?: number;
    }
  ];
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
  method: "CREATE" | "PATCH" | "REMOVE";
  recipient: string;
  content: any;
  id: string;
  service: string;
}
