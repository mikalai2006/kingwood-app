import { IPaginationParams } from "../types";
import { IUser } from "../user/types";

export interface IWorkHistory {
  id: string;
  userId: string;
  objectId: string;
  orderId: string;
  taskId: string;
  workerId: string;
  workTimeId: string;
  operationId: string;
  status: number;
  from: string;
  to: string;
  oklad: number;
  total: number;
  workHistory: IWorkHistory[];

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
  orderId?: string[];
  status?: number;
}
