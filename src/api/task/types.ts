import { IObject } from "../object/types";
import { IOperation } from "../operation/types";
import { IOrder } from "../order/types";
import { ITaskWorker } from "../task_worker/types";
import { IPaginationParams } from "../types";

export interface ITask {
  id: string;
  userId: string;
  objectId: string;
  orderId: string;
  operationId: string;
  name: string;
  sortOrder: number;
  statusId: string;
  startAt: string;
  active: number;
  autoCheck: number;
  status: string;
  typeGo: string;
  from: string;
  to: string;
  maxHours: number;
  workedMs: number;
  total: number;

  workers: ITaskWorker[];
  object: IObject;
  operation: IOperation;
  order: IOrder;

  createdAt: Date;
  updatedAt: Date;
}

export type ITaskInput = {
  [Property in keyof ITask]?: ITask[Property];
};

export interface ITaskFilter extends IPaginationParams<ITaskInput> {
  id?: string[];
  objectId?: string[];
  orderId?: string[];
  name?: string;
}
