import { IPaginationParams } from "../types";
import { IUser } from "../user/types";

export interface IAppError {
  id: string;
  userId: string;
  error: string;
  code: string;
  stack: string;
  status: number;

  user: IUser;

  createdAt: Date;
  updatedAt: Date;
}

export type IAppErrorInput = {
  [Property in keyof IAppError]?: IAppError[Property];
};

export type IAppErrorListQuery = {
  id: (string | number)[];
};

export interface IAppErrorFilter extends IPaginationParams<IAppErrorInput> {
  id?: string[];
  userId?: string[];
  error?: string;
  code?: string;
  stack?: string;
  status?: number;
  from?: string;
  to?: string;
}
