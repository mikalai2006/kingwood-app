import { IPaginationParams } from "../types";

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
  workHistory: IWorkHistory[];

  createdAt: Date;
  updatedAt: Date;
}

export type IWorkHistoryInput = {
  [Property in keyof IWorkHistory]?: IWorkHistory[Property];
};

export interface IWorkHistoryFilter extends IPaginationParams<IWorkHistory> {
  // id?: string[];
  // workerId?: string[];
  // from?: string;
  // to?: string;
  // date?: string;
}
