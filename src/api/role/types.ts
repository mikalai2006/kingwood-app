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
