export interface IAnalytic {
  active: {
    countUser: number;
    countOrder: number;
    countTask: number;
    countTaskWorker: number;
    countNotify: number;
    countMessage: number;
    countPay: number;
    countImage: number;
    countWorkHistory: number;
  };
  archive: {
    countArchiveWorkHistory: number;
    countArchiveTask: number;
    countArchiveTaskWorker: number;
    countArchiveOrder: number;
    countArchiveNotify: number;
    countArchiveMessage: number;
    countArchivePay: number;
    countArchiveImage: number;
  };
}
