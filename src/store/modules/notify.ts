import { defineStore } from "pinia";
import { findPopulate, patch, remove, removeList } from "@/api/notify";
import {
  INotify,
  INotifyFilter,
  INotifyInput,
  INotifyListQuery,
} from "@/api/notify/types";
import { useUserStore } from "..";
// import sift from 'sift'

export const useNotifyStore = defineStore("notify", {
  state() {
    return {
      _items: [] as INotify[],
    };
  },
  getters: {
    items(state) {
      return state._items;
    },
  },
  actions: {
    async find(params?: INotifyFilter) {
      const userStore = useUserStore();

      const data = await findPopulate(params || {});
      data.data?.forEach((el) => {
        this.onAddItemToStore(el);

        if (el?.user) {
          userStore.onAddItemToStore(el.user);
        }
        if (el?.recepient) {
          userStore.onAddItemToStore(el.recepient);
        }
      });

      return data;
    },
    async patch(id: string, data?: INotifyInput) {
      const userStore = useUserStore();

      const _item = await patch(id, data || {});
      if (_item) {
        this.onAddItemToStore(_item);

        if (_item?.user) {
          userStore.onAddItemToStore(_item.user);
        }
        if (_item?.recepient) {
          userStore.onAddItemToStore(_item.recepient);
        }
      }

      return data;
    },
    /**
     * Check exists item to store.
     * @param params
     * @returns
     */
    onExists(id: string): {
      item: INotify | null;
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
    onAddItemToStore(item: INotify) {
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
    onGetInStore(id: string | number, params?: INotify): INotify | null {
      let item = null;
      if (params) {
        // search by params
      } else {
        item = this._items.find((el: INotify) => el.id == id);
      }
      return item || null;
    },

    onRemoveItemFromStore(id: string | number, params?: INotifyInput): number {
      let itemIndex = -1;
      if (params) {
        // search by params
      } else {
        itemIndex = this._items.findIndex((el: INotify) => el.id == id);
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
    async onRemoveList(data: INotifyListQuery) {
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
