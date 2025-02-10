import { defineStore } from "pinia";
import { find, patch, remove } from "@/api/message";
import { IMessage, IMessageFilter, IMessageInput } from "@/api/message/types";
import { useUserStore } from "..";
// import sift from 'sift'

export const useMessageStore = defineStore("Message", {
  state() {
    return {
      _items: [] as IMessage[],
    };
  },
  getters: {
    items(state) {
      return state._items;
    },
  },
  actions: {
    async find(data?: IMessageFilter) {
      const _data = await find(data || {});
      _data.data?.forEach((el) => {
        this.onAddItemToStore(el);
      });

      return _data;
    },
    async patch(id: string, data: FormData) {
      const userStore = useUserStore();

      const _item = await patch(id, data);
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
      item: IMessage | null;
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
    onAddItemToStore(item: IMessage) {
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
    onGetInStore(id: string | number, params?: IMessage): IMessage | null {
      let item = null;
      if (params) {
        // search by params
      } else {
        item = this._items.find((el: IMessage) => el.id == id);
      }
      return item || null;
    },

    onRemoveItemFromStore(id: string | number, params?: IMessageInput): number {
      let itemIndex = -1;
      if (params) {
        // search by params
      } else {
        itemIndex = this._items.findIndex((el: IMessage) => el.id == id);
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
