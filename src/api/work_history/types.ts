import { IObject } from "../object/types";
import { IOrder } from "../order/types";
import { IPaginationParams } from "../types";
import { IUser } from "../user/types";

export interface IWorkHistory {
  id: string;
  userId: string;
  objectId: string;
  orderId: string;
  taskId: string;
  workerId: string;
  taskWorkerId: string;
  workTimeId: string;
  operationId: string;
  status: number;
  date: string;
  from: string;
  to: string;
  oklad: number;
  total: number;
  totalTime: number;
  workHistory: IWorkHistory[];

  props: {
    [key: string]: {
      userId: string;
      item: IWorkHistory;
      time: string;
    };
  };

  order: IOrder;
  worker?: IUser;
  object: IObject;

  createdAt: Date;
  updatedAt: Date;
}

export interface IWorkHistoryStatByOrderOperation {
  operationId: string;
  count: number;
  total: number;
}

export interface IWorkHistoryStatByOrder {
  workerId: string;
  worker: IUser;
  count: number;
  total: number;
  operations: IWorkHistoryStatByOrderOperation[];
}

export type IWorkHistoryInput = {
  [Property in keyof IWorkHistory]?: IWorkHistory[Property];
};

export interface IWorkHistoryFilter extends IPaginationParams<IWorkHistory> {
  id?: string[];
  workTimeId?: string[];
  workerId?: string[];
  taskId?: string[];
  from?: string;
  to?: string;
  orderId?: string[];
  status?: number;
}
