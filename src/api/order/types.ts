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

  object?: IObject;
  tasks?: ITask[];

  stolyarComplete: number;
  malyarComplete: number;
  goComplete: number;
  dateOtgruzka: string;
  montajComplete: number;

  createdAt: Date;
  updatedAt: Date;
}

export type IOrderInput = {
  [Property in keyof IOrder]?: IOrder[Property];
};

export interface IOrderFilter extends IPaginationParams<IOrderInput> {
  id?: string[];
  name?: string;
  group?: string[];
  status?: number;
  objectId?: string[];
  stolyarComplete?: number;
  malyarComplete?: number;
  goComplete?: number;
  montajComplete?: number;

  from?: string;
  to?: string;
}
