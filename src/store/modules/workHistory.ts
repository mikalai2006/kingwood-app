import { defineStore } from "pinia";
import { find, patch, remove } from "@/api/work_history";
import {
  IWorkHistory,
  IWorkHistoryFilter,
  IWorkHistoryInput,
} from "@/api/work_history/types";

export const useWorkHistoryStore = defineStore("workHistory", {
  state() {
    return {
      _items: [] as IWorkHistory[],
    };
  },
  getters: {
    items(state) {
      return state._items;
    },
  },
  actions: {
    async find(params?: IWorkHistoryFilter) {
      const data = await find(params || {});
      data.data?.forEach((el) => {
        this.onAddItemToStore(el);
      });

      return data;
    },
    async patch(id: string, data?: IWorkHistoryInput) {
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
      item: IWorkHistory | null;
      index: number;
    } {
      const pageIndex = this._items.findIndex((x) => x.id === id);
      return { item: this._items[pageIndex], index: pageIndex };
    },
    onAddItemToStore(item: IWorkHistory) {
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
    onGetInStore(
      id: string | number,
      params?: IWorkHistory
    ): IWorkHistory | null {
      let item = null;
      if (params) {
        // search by params
      } else {
        item = this._items.find((el: IWorkHistory) => el.id == id);
      }
      return item || null;
    },

    onRemoveItemFromStore(
      id: string | number,
      params?: IWorkHistoryInput
    ): number {
      let itemIndex = -1;
      if (params) {
        // search by params
      } else {
        itemIndex = this._items.findIndex((el: IWorkHistory) => el.id == id);
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
  },
});
