export interface ITaskMontajWorker {
  id: string;
  userId: string;
  objectId: string;
  taskId: string;
  workerId: string;
  sortOrder: number;
  statusId: string;
  status: string;
  from: string;
  to: string;
  typeGo: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ITaskMontajWorkerInput = {
  [Property in keyof ITaskMontajWorker]?: ITaskMontajWorker[Property];
};
