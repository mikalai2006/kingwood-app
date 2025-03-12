import { defineStore } from "pinia";
import { find, get } from "@/api/object";
import { IRequestParams } from "@/api/types";
import { IObject } from "@/api/object/types";
import { getObjectId } from "@/utils/utils";
// import sift from 'sift'

export const useObjectStore = defineStore("object", {
  state() {
    return {
      _items: [] as IObject[],
    };
  },
  getters: {
    items(state) {
      return state._items;
    },
  },
  actions: {
    async find(params?: IRequestParams<IObject> | Partial<IObject>) {
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
      item: IObject | null;
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
    onAddItemToStore(item: IObject, forceNull?: boolean) {
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
    /**
     * Get page by id from server.
     * @param id
     * @param params
     * @returns
     */
    async onGet(
      id: string,
      params?: IRequestParams<IObject> | Partial<IObject>
    ) {
      const data = await get(id);
      this.onAddItemToStore(data);
      return data;
    },
    onGetInStore(id: string | number, params?: IObject): IObject | null {
      let item = null;
      if (params) {
        // search by params
      } else {
        item = this._items.find((el: IObject) => el.id == id);
      }
      return item || null;
    },
  },
});
