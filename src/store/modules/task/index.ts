import { defineStore } from "pinia";
import { find, findPopulate, get, remove } from "@/api/task";
import { IRequestParams } from "@/api/types";
import { ITask, ITaskFilter, ITaskInput } from "@/api/task/types";
// import sift from 'sift'

export const useTaskStore = defineStore("task", {
  state() {
    return {
      _items: [] as ITask[],
    };
  },
  getters: {
    items(state) {
      return state._items;
    },
  },
  actions: {
    async find(data?: ITaskFilter) {
      // const existsItem = this.onExists(params)
      // if (existsItem.index == -1) {
      const _data = await findPopulate(data || {});
      _data.data?.forEach((el) => this.onAddItemToStore(el));
      // }
      return data;
    },
    /**
     * Check exists item to store.
     * @param params
     * @returns
     */
    onExists(id: string): {
      item: ITask | null;
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
    onAddItemToStore(item: ITask) {
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
    async onGet(id: string, params?: IRequestParams<ITask> | Partial<ITask>) {
      const data = await get(id);
      this.onAddItemToStore(data);
      return data;
    },
    onGetInStore(id: string | number, params?: ITask): ITask | null {
      let item = null;
      if (params) {
        // search by params
      } else {
        item = this._items.find((el: ITask) => el.id == id);
      }
      return item || null;
    },
    onRemoveItemFromStore(id: string | number, params?: ITaskInput): number {
      let itemIndex = -1;
      if (params) {
        // search by params
      } else {
        itemIndex = this._items.findIndex((el: ITask) => el.id == id);
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

      const data = await remove(id, {}).then((r) => {
        this.onRemoveItemFromStore(id);
        return r;
      });

      return data;
    },
  },
});
