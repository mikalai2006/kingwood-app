export interface IOperation {
  id: string;
  name: string;
  color: string;
  group: string;
  createdAt: Date;
  updatedAt: Date;
}

export type IOperationInput = {
  [Property in keyof IOperation]?: IOperation[Property];
};
