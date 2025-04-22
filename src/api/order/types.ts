import { IObject } from "../object/types";
import { ITask } from "../task/types";
import { IPaginationParams } from "../types";

export interface IOrder {
  id: string;
  userId: string;
  name: string;
  description: string;
  number: number;
  constructorId: string;
  term: string;
  termMontaj: string;
  dateStart: string;
  objectId: string;
  priority: number;
  group: string[];
  status: number;
  year: number;

  object?: IObject;
  tasks?: ITask[];

  stolyarComplete: number;
  malyarComplete: number;
  goComplete: number;
  dateOtgruzka: string;
  montajComplete: number;
  shlifComplete: number;
  countTaskMontaj: number;

  createdAt: Date;
  updatedAt: Date;
}

export type IOrderInput = {
  [Property in keyof IOrder]?: IOrder[Property];
};

export interface IOrderFilter extends IPaginationParams<IOrderInput> {
  id?: string[];
  name?: string;
  number?: number;
  year?: number;
  query?: string;
  group?: string[];
  constructorId?: string[];
  status?: number[];
  objectId?: string[];
  stolyarComplete?: number;
  shlifComplete?: number;
  malyarComplete?: number;
  goComplete?: number;
  montajComplete?: number;
  dateOtgruzka?: string;
  countTaskMontaj?: number;

  from?: string;
  to?: string;
}
