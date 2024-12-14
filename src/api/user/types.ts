import { IImage } from "../image/types";
import { IPost } from "../post/types";
import { IRole } from "../role/types";

export interface IUser {
  id: string;
  userId: string;
  name: string;
  login?: string;
  phone: string;
  online: boolean;
  hidden: number;
  roleObject: IRole;
  postObject: IPost;
  images: IImage[];
  birthday: string;
  roleId: string;
  postId: string;
  typeWork: string[];
  typePay: number;
  oklad: number;
  lastTime: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type IUserInput = {
  [Property in keyof IUser]?: IUser[Property];
};
