import { IObject } from "../object/types";
import { IOrder } from "../order/types";
import { ITask } from "../task/types";
import { ITaskStatus } from "../task_status/types";
import { IPaginationParams } from "../types";
import { IUser } from "../user/types";

export interface ITaskWorker {
  id: string;
  userId: string;
  objectId: string;
  orderId: string;
  taskId: string;
  workerId: string;
  operationId: string;
  sortOrder: number;
  statusId: string;
  status: string;
  from: string;
  to: string;
  typeGo: string;

  task: ITask;
  taskStatus: ITaskStatus;
  order: IOrder;
  worker: IUser;
  object: IObject;

  createdAt: Date;
  updatedAt: Date;
}

export type ITaskWorkerInput = {
  [Property in keyof ITaskWorker]?: ITaskWorker[Property];
};

export interface ITaskWorkerFilter extends IPaginationParams<ITaskWorkerInput> {
  id?: string[];
  query?: string;
  objectId?: string[];
  orderId?: string[];
  taskId?: string[];
  workerId?: string[];
  operationId?: string[];
  from?: string;
  to?: string;
  date?: string;
}
