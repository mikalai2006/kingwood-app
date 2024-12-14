import { defineStore } from "pinia";
import { find, get } from "@/api/task_worker";
import { IRequestParams } from "@/api/types";
import { ITaskWorker } from "@/api/task_worker/types";
// import sift from 'sift'

export const useTaskWorkerStore = defineStore("taskWorker", {
  state() {
    return {
      _items: [] as ITaskWorker[],
    };
  },
  getters: {
    items(state) {
      return state._items;
    },
  },
  actions: {
    async find(params?: IRequestParams<ITaskWorker> | Partial<ITaskWorker>) {
      // const existsItem = this.onExists(params)
      // if (existsItem.index == -1) {
      const data = await find(params || {});
      data.data?.forEach((el) => this.onAddItemToStore(el));
      // }
      return data;
    },
    /**
     * Check exists item to store.
     * @param params
     * @returns
     */
    onExists(id: string): {
      item: ITaskWorker | null;
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
    onAddItemToStore(item: ITaskWorker) {
      const existsItem = this.onExists(item.id);
      if (existsItem.index == -1) {
        this._items.push(item);
      } else {
        this._items[existsItem.index] = Object.assign(
          {},
          this._items[existsItem.index],
          item
        );
      }
    },
    /**
     * Get page by id from server.
     * @param id
     * @param params
     * @returns
     */
    async onGet(
      id: string,
      params?: IRequestParams<ITaskWorker> | Partial<ITaskWorker>
    ) {
      const data = await get(id);
      this.onAddItemToStore(data);
      return data;
    },
    onGetInStore(
      id: string | number,
      params?: ITaskWorker
    ): ITaskWorker | null {
      let item = null;
      if (params) {
        // search by params
      } else {
        item = this._items.find((el: ITaskWorker) => el.id == id);
      }
      return item || null;
    },
  },
});
