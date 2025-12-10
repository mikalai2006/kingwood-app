import { defineStore } from "pinia";
import { getObjectId } from "@/utils/utils";
import { ITimer, ITimerFilter, ITimerInput } from "@/api/timer/types";
import { find } from "@/api/timer";

export const useTimerStore = defineStore("timer", {
  state() {
    return {
      _items: [] as ITimer[],
    };
  },
  getters: {
    items(state) {
      return state._items;
    },
  },
  actions: {
    async find(params?: ITimerFilter) {
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
      item: ITimer | null;
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
    onAddItemToStore(item: ITimer, forceNull?: boolean) {
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
    },
    onGetInStore(id: string | number, params?: ITimer): ITimer | null {
      let item = null;
      if (params) {
        // search by params
      } else {
        item = this._items.find((el: ITimer) => el.id == id);
      }
      return item || null;
    },

    async deleteItem(id: string | undefined) {
      if (!id) {
        return;
      }

      this.onRemoveItemFromStore(id);

      return;
    },

    onRemoveItemFromStore(id: string | number, params?: ITimerInput): number {
      let itemIndex = -1;
      if (params) {
        // search by params
      } else {
        itemIndex = this._items.findIndex((el: ITimer) => el.id == id);
      }

      if (itemIndex !== -1) {
        this._items.splice(itemIndex, 1);
      }

      return itemIndex;
    },
  },
});
