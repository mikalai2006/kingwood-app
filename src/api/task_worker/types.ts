export interface ITaskWorker {
  id: string;
  userId: string;
  workerId: string;
  taskId: string;
  sortOrder: number;
  statusId: string;
  status: string;
  from: string;
  to: string;
  typeGo: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ITaskWorkerInput = {
  [Property in keyof ITaskWorker]?: ITaskWorker[Property];
};
