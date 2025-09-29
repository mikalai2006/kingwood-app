import { IAuthPublicData } from "../auth/types";
import { IImage } from "../image/types";
import { IPost } from "../post/types";
import { IRole } from "../role/types";
import { ITaskWorker } from "../task_worker/types";
import { IDoplata, IPaginationParams } from "../types";
import { IWorkHistory } from "../work_history/types";

export interface IUser {
  id: string;
  userId: string;
  name: string;
  login?: string;
  phone: string;
  online: boolean;
  hidden: number;
  archive: number;
  blocked: number;
  postObject: IPost;
  images: IImage[];
  birthday: string;
  roleId: string;
  roleObject: IRole;
  // roles: IRole[];
  postId: string;
  typeWork: string[];
  typePay: number;
  oklad: number;
  maxTime: number;
  dops: IDoplata[];
  lastTime: Date;
  workHistorys: IWorkHistory[];
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
  blocked?: number;
  hidden?: number;
  archive?: number;
  taskWorkers?: any;
}
