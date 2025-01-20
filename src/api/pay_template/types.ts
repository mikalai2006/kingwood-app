export interface IPayTemplate {
  id: string;
  userId: string;
  total: number;
  name: string;
  description: string;
  enabled: number;
  createdAt: Date;
  updatedAt: Date;
}

export type IPayTemplateInput = {
  [Property in keyof IPayTemplate]?: IPayTemplate[Property];
};
