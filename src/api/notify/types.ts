import { IImage } from "../image/types";
import { IPaginationParams } from "../types";
import { IUser } from "../user/types";

export interface INotify {
  id: string;
  userId: string;
  userTo: string;
  status: number;
  title: string;
  message: string;

  images: IImage[];
  user: IUser;
  recepient: IUser;

  readAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type INotifyInput = {
  [Property in keyof INotify]?: INotify[Property];
};

export interface INotifyFilter extends IPaginationParams<INotifyInput> {
  id?: string[];
  userId?: string[];
  userTo?: string[];
  status?: number;
}
