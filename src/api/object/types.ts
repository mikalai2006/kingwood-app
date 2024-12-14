export interface IObject {
  id: string;
  userId: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export type IObjectInput = {
  [Property in keyof IObject]?: IObject[Property];
};
