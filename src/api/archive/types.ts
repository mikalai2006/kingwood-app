import { INotify } from "../notify/types";
import { IPaginationParams } from "../types";
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
