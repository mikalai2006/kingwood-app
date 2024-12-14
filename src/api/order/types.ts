import { IObject } from "../object/types";

export interface IOrder {
  id: string;
  userId: string;
  name: string;
  description: string;
  number: number;
  constructorId: string;
  term: string;
  objectId: string;
  priority: number;

  object?: IObject;

  createdAt: Date;
  updatedAt: Date;
}

export type IOrderInput = {
  [Property in keyof IOrder]?: IOrder[Property];
};
