export interface ITask {
  id: string;
  userId: string;
  orderId: string;
  name: string;
  sortOrder: number;
  statusId: string;
  startAt: string;
  active: number;
  autoCheck: number;
  status: string;
  from: string;
  to: string;
  typeGo: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ITaskInput = {
  [Property in keyof ITask]?: ITask[Property];
};
