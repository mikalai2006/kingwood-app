import { INotify } from "../notify/types";
import { IOrder } from "../order/types";
import { IPaginationParams } from "../types";
import { IUser } from "../user/types";
import { IWorkHistory } from "../work_history/types";

export interface IMetaArchive {
  userId: string;
  createdAt: string;
}

export interface IArchiveNotify extends INotify {
  meta: IMetaArchive;
}

export type IArchiveNotifyInput = {
  [Property in keyof IArchiveNotify]?: IArchiveNotify[Property];
};

export interface IArchiveNotifyFilter
  extends IPaginationParams<IArchiveNotifyInput> {
  id?: string[];
  userId?: string[];
  userTo?: string[];
  status?: number;
}

export interface IArchiveWorkHistory extends IWorkHistory {
  meta: IMetaArchive;
}

export type IArchiveWorkHistoryInput = {
  [Property in keyof IArchiveWorkHistory]?: IArchiveWorkHistory[Property];
};

export interface IArchiveWorkHistoryFilter
  extends IPaginationParams<IArchiveWorkHistoryInput> {
  id?: string[];
  workTimeId?: string[];
  workerId?: string[];
  taskId?: string[];
  from?: string;
  to?: string;
  orderId?: string[];
  status?: number;
}

export interface IArchiveOrder extends IOrder {
  meta: IMetaArchive;
}

export type IArchiveOrderInput = {
  [Property in keyof IArchiveOrder]?: IArchiveOrder[Property];
};

export interface IArchiveOrderFilter
  extends IPaginationParams<IArchiveOrderInput> {
  id?: string[];
  name?: string;
  number?: number;
  year?: number;
  query?: string;
  group?: string[];
  status?: number;
  objectId?: string[];
  stolyarComplete?: number;
  shlifComplete?: number;
  malyarComplete?: number;
  goComplete?: number;
  montajComplete?: number;
  dateOtgruzka?: string;

  from?: string;
  to?: string;
}

export interface IArchiveUser extends IUser {
  meta: IMetaArchive;
}

export type IArchiveUserInput = {
  [Property in keyof IArchiveUser]?: IArchiveUser[Property];
};

export interface IArchiveUserFilter
  extends IPaginationParams<IArchiveUserInput> {
  id?: string[];
  userId?: string[];
  roleId?: string[];
  blocked?: number;
  hidden?: number;
  archive?: number;
  taskWorkers?: any;
}
