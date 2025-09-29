import { defineStore } from "pinia";
import {
  IAppError,
  IAppErrorFilter,
  IAppErrorInput,
  IAppErrorListQuery,
} from "@/api/app_error/types";
import {
  findPopulate,
  patch,
  remove,
  create,
  removeList,
} from "@/api/app_error";
// import sift from 'sift'

export const useAppErrorStore = defineStore("appError", {
  state() {
    return {
      _items: [] as IAppError[],
    };
  },
  getters: {
    items(state) {
      return state._items;
    },
  },
  actions: {
    async create(data?: IAppErrorInput) {
      const _data = await create(data || {});
      if (_data) {
        this.onAddItemToStore(_data);
      }

      return data;
    },
    async find(params?: IAppErrorFilter) {
      const data = await findPopulate(params || {});
      data.data?.forEach((el) => {
        this.onAddItemToStore(el);
      });

      return data;
    },
    async patch(id: string, data?: IAppErrorInput) {
      const _item = await patch(id, data || {});
      if (_item) {
        this.onAddItemToStore(_item);
      }

      return data;
    },
    /**
     * Check exists item to store.
     * @param params
     * @returns
     */
    onExists(id: string): {
      item: IAppError | null;
      index: number;
    } {
      const pageIndex = this._items.findIndex((x) => x.id === id);
      return { item: this._items[pageIndex], index: pageIndex };
    },
    onAddItemToStore(item: IAppError) {
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
    onGetInStore(id: string | number, params?: IAppError): IAppError | null {
      let item = null;
      if (params) {
        // search by params
      } else {
        item = this._items.find((el: IAppError) => el.id == id);
      }
      return item || null;
    },

    onRemoveItemFromStore(
      id: string | number,
      params?: IAppErrorInput
    ): number {
      let itemIndex = -1;
      if (params) {
        // search by params
      } else {
        itemIndex = this._items.findIndex((el: IAppError) => el.id == id);
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

      const data = await remove(id).then(() => {
        this.onRemoveItemFromStore(id);
      });

      return data;
    },
    async onRemoveList(data: IAppErrorListQuery) {
      if (!data.id?.length) {
        return;
      }

      const result = await removeList(data).then(() => {
        for (let i = 0; i < data.id.length; i++) {
          this.onRemoveItemFromStore(data.id[i]);
        }
      });

      return result;
    },
  },
});
