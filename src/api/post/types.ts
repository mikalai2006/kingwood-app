export interface IPost {
  id: string;
  name: string;
  description: string;
  props: any;
  color: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export type IPostInput = {
  [Property in keyof IPost]?: IPost[Property];
};
