import { IAuthPublicData } from "../auth/types";
import { IImage } from "../image/types";
import { IPost } from "../post/types";
import { IRole } from "../role/types";
import { ITaskWorker } from "../task_worker/types";
import { IPaginationParams } from "../types";
import { IWorkTime } from "../work_time/types";

export interface IUser {
  id: string;
  userId: string;
  name: string;
  login?: string;
  phone: string;
  online: boolean;
  hidden: number;
  archive: number;
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
  workTimes: IWorkTime[];
  isWork: number;

  auth: IAuthPublicData;
  taskWorkers: ITaskWorker[];

  createdAt: Date;
  updatedAt: Date;
}

export type IUserInput = {
  [Property in keyof IUser]?: IUser[Property];
};

export interface IUserFilter extends IPaginationParams<IUserInput> {
  id?: string[];
  userId?: string[];
  roleId?: string[];
  hidden?: number;
  archive?: number;
}
