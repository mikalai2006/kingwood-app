import { IPaginationParams } from "../types";
import { IWorkHistory } from "../work_history/types";

export interface IWorkTime {
  id: string;
  userId: string;
  workerId: string;
  status: number;
  date: string;
  from: string;
  to: string;
  oklad: number;
  total: number;

  workHistory: IWorkHistory[];

  createdAt: Date;
  updatedAt: Date;
}

export type IWorkTimeInput = {
  [Property in keyof IWorkTime]?: IWorkTime[Property];
};

export interface IWorkTimeFilter extends IPaginationParams<IWorkTime> {
  id?: string[];
  workerId?: string[];
  from?: string;
  to?: string;
  date?: string;
}
