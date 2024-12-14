export interface IImage {
  id: string;
  userId: string;
  serviceId: string;
  service: string;
  path: string;
  ext: string;
  title: string;
  dir: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}
