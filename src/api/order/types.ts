import { IObject } from "../object/types";

export interface IOrder {
  id: string;
  userId: string;
  name: string;
  description: string;
  number: number;
  constructorId: string;
  term: string;
  termMontaj: string;
  objectId: string;
  priority: number;
  group: string[];
  status: number;
  object?: IObject;

  stolyarComplete: number;
  malyarComplete: number;
  goComplete: number;
  montajComplete: number;

  createdAt: Date;
  updatedAt: Date;
}

export type IOrderInput = {
  [Property in keyof IOrder]?: IOrder[Property];
};
