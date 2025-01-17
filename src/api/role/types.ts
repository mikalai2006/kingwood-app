import { IPaginationParams } from "../types";

export interface IRole {
  id: string;
  name: string;
  code: string;
  value: string[];
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export type IRoleInput = {
  [Property in keyof IRole]?: IRole[Property];
};

export interface IRoleFilter extends IPaginationParams<IRoleInput> {
  id?: string[];
  name?: string[];
  code?: string[];
}
