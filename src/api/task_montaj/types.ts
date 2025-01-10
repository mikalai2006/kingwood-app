import { IObject } from "../object/types";

export interface ITaskMontaj {
  id: string;
  userId: string;
  object: IObject;
  objectId: string;
  // orderId: string;
  workerId: string;
  operationId: string;
  name: string;
  sortOrder: number;
  statusId: string;
  status: string;
  active: number;
  from: string;
  to: string;
  typeGo: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ITaskMontajInput = {
  [Property in keyof ITaskMontaj]?: ITaskMontaj[Property];
};
