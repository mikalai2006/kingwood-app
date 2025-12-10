import { IPaginationParams } from "../types";
import { IUser } from "../user/types";

export interface ITimer {
  id: string;
  idTimer: string;
  executeAt: string;
  isRunning: number;
  workerId: string;
  taskWorkerId: string;
  taskId: string;
  workHistoryId: string;
  worker: IUser;
  createdAt: string;
  updatedAt: string;
}

export type ITimerInput = {
  [Property in keyof ITimer]?: ITimer[Property];
};

export interface ITimerFilter extends IPaginationParams<ITimerInput> {
  id?: string[];
  idTimer?: string[];
  workerId?: string[];
  taskId?: string[];
  taskWorkerId?: string[];
  workHistoryId?: string[];
  executeAt?: string;
  isRunning?: number;
}
