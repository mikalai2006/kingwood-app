export interface ITaskStatus {
  id: string;
  userId: string;
  name: string;
  description: string;
  color: string;
  enabled: string;
  icon: string;
  animate?: string;
  start?: number;
  finish?: number;
  process?: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ITaskStatusInput = {
  [Property in keyof ITaskStatus]?: ITaskStatus[Property];
};
