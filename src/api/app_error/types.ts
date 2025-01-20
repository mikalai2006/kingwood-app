import { IPaginationParams } from "../types";

export interface IAppError {
  id: string;
  userId: string;
  error: string;
  code: string;
  stack: string;
  status: number;

  createdAt: Date;
  updatedAt: Date;
}

export type IAppErrorInput = {
  [Property in keyof IAppError]?: IAppError[Property];
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
