import { defineStore } from "pinia";
import { find, get, remove } from "@/api/order";
import { IRequestParams } from "@/api/types";
import { IOrder, IOrderFilter, IOrderInput } from "@/api/order/types";
import { useObjectStore } from "../object";
import { useTaskStore } from "../task";
import { useTaskWorkerStore } from "../task_worker";
import { getObjectId } from "@/utils/utils";
import { useUserStore } from "../user";
// import sift from 'sift'

export const useOrderStore = defineStore("order", {
  state() {
    return {
      _items: [] as IOrder[],
    };
  },
  getters: {
    items(state) {
      return state._items;
    },
  },
  actions: {
    async find(params?: IOrderFilter) {
      const objectStore = useObjectStore();
      // const existsItem = this.onExists(params)
      // if (existsItem.index == -1) {
      const data = await find(params || {});
      data.data?.forEach((el) => {
        // add object.
        if (el?.object) {
          objectStore.onAddItemToStore(el.object);
        }

        this.onAddItemToStore(el);
      });

      if (data?.objects) {
        data.objects?.forEach((el) => {
          objectStore.onAddItemToStore(el);
        });
      }

      if (data?.tasks) {
        const taskStore = useTaskStore();
        data.tasks?.forEach((el) => {
          taskStore.onAddItemToStore(el);
        });
      }

      if (data.taskWorkers) {
        const taskWorkerStore = useTaskWorkerStore();
        data.taskWorkers.forEach((el) => {
          taskWorkerStore.onAddItemToStore(el);
        });
      }

      if (data.workers) {
        const userStore = useUserStore();
        data.workers.forEach((el) => {
          userStore.onAddItemToStore(el);
        });
      }
      // }

      return data;
    },
    /**
     * Check exists item to store.
     * @param params
     * @returns
     */
    onExists(id: string): {
      item: IOrder | null;
      index: number;
    } {
      const pageIndex = this._items.findIndex((x) => x.id === id);
      return { item: this._items[pageIndex], index: pageIndex };
    },
    // findInStore(params?: IRequestParams<IUser> | Partial<IUser>): IUser | null {
    //   const item = this._users.filter(sift(params))
    //   console.log('user: findInStore params=', params)
    //   return item[0] || null
    // },
    onAddItemToStore(item: IOrder, forceNull?: boolean) {
      const existsItem = this.onExists(item.id);
      if (getObjectId(item.id) === "0" && !forceNull) {
        return;
      }

      if (existsItem.index == -1) {
        this._items.push(item);
      } else {
        this._items[existsItem.index] = Object.assign(
          {},
          this._items[existsItem.index],
          item
        );
      }

      if (item.object) {
        const objectStore = useObjectStore();
        objectStore.onAddItemToStore(item.object);
      }

      if (item.tasks) {
        const taskStore = useTaskStore();
        item.tasks.forEach((el) => {
          taskStore.onAddItemToStore(el);

          if (el.workers?.length) {
            const taskWorkerStore = useTaskWorkerStore();
            el.workers.forEach((worker) =>
              taskWorkerStore.onAddItemToStore(worker)
            );
          }
        });
      }
    },
    /**
     * Get page by id from server.
     * @param id
     * @param params
     * @returns
     */
    async onGet(id: string, params?: IRequestParams<IOrder> | Partial<IOrder>) {
      const data = await get(id);
      this.onAddItemToStore(data);
      return data;
    },
    onGetInStore(id: string | number, params?: IOrder): IOrder | null {
      let item = null;
      if (params) {
        // search by params
      } else {
        item = this._items.find((el: IOrder) => el.id == id);
      }
      return item || null;
    },

    onRemoveItemFromStore(id: string | number, params?: IOrderInput): number {
      let itemIndex = -1;
      if (params) {
        // search by params
      } else {
        itemIndex = this._items.findIndex((el: IOrder) => el.id == id);
      }

      if (itemIndex !== -1) {
        this._items.splice(itemIndex, 1);
      }

      return itemIndex;
    },
    async deleteItem(id: string | undefined) {
      if (!id) {
        return;
      }

      const data = await remove(id, {}).then(() => {
        this.onRemoveItemFromStore(id);
      });

      return data;
    },
  },
});
