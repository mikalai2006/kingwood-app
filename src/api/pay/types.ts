import { IPaginationParams } from "../types";

export interface IPay {
  id: string;
  userId: string;
  workerId: string;
  month: number;
  year: number;
  total: number;
  name: string;

  createdAt: Date;
  updatedAt: Date;
}

export type IPayInput = {
  [Property in keyof IPay]?: IPay[Property];
};

export interface IPayFilter extends IPaginationParams<IPayInput> {
  id?: string[];
  workerId?: string[];
  month?: number;
  year?: number;
  name?: string;
}
