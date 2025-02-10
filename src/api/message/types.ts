import { IImage } from "../image/types";
import { IPaginationParams } from "../types";

export interface IMessage {
  id: string;
  userId: string;
  orderId: string;
  status: string;
  message: string;
  images: IImage[];

  createdAt: Date;
  updatedAt: Date;
}

export type IMessageInput = {
  [Property in keyof IMessage]?: IMessage[Property];
};

export interface IMessageFilter extends IPaginationParams<IMessageInput> {
  id?: string[];
  userId?: string[];
  orderId?: string[];
}
