import { defineStore } from "pinia";
import { find, findPopulate, get, remove } from "@/api/task_worker";
import { IRequestParams } from "@/api/types";
import {
  ITaskWorker,
  ITaskWorkerFilter,
  ITaskWorkerInput,
} from "@/api/task_worker/types";
import { getObjectId } from "@/utils/utils";
import { useUserStore } from "../user";
import { useObjectStore } from "../object";
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
    async find(data?: ITaskWorkerFilter) {
      // const existsItem = this.onExists(params)
      // if (existsItem.index == -1) {
      const _data = await findPopulate(data || {});
      _data.data?.forEach((el) => this.onAddItemToStore(el));
      // }
      return _data;
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
    onAddItemToStore(item: ITaskWorker, forceNull?: boolean) {
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

      // TODO
      // if (item.worker && getObjectId(item.worker.id) != "0") {
      //   const userStore = useUserStore();
      //   userStore.onAddItemToStore(item.worker);
      // }
      if (item.object && getObjectId(item.object.id) != "0") {
        const objectStore = useObjectStore();
        objectStore.onAddItemToStore(item.object);
      }
    },
    onRemoveItemFromStore(
      id: string | number,
      params?: ITaskWorkerInput
    ): number {
      let itemIndex = -1;
      if (params) {
        // search by params
      } else {
        itemIndex = this._items.findIndex((el: ITaskWorker) => el.id == id);
      }

      if (itemIndex !== -1) {
        this._items.splice(itemIndex, 1);
      }

      return itemIndex;
    },
    async onRemove(id: string | undefined) {
      if (!id) {
        return;
      }

      const data = await remove(id, {}).then((r) => {
        this.onRemoveItemFromStore(id);
        return r;
      });

      return data;
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
