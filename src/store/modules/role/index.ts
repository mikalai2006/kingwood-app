import { defineStore } from "pinia";
import { find, get } from "@/api/role";
import { IRequestParams } from "@/api/types";
// import sift from 'sift'
import { IRole, IRoleFilter } from "@/api/role/types";

export const useRoleStore = defineStore("role", {
  state() {
    return {
      _items: [] as IRole[],
    };
  },
  getters: {
    items(state) {
      return state._items;
    },
  },
  actions: {
    async find(filter?: IRoleFilter) {
      // const existsItem = this.onExists(params)
      // if (existsItem.index == -1) {
      const data = await find(filter || {});
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
      item: IRole | null;
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
    onAddItemToStore(item: IRole) {
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
    async onGet(id: string, params?: IRequestParams<IRole> | Partial<IRole>) {
      const data = await get(id);
      this.onAddItemToStore(data);
      return data;
    },
    onGetInStore(id: string | number, params?: IRole): IRole | null {
      let item = null;
      if (params) {
        // search by params
      } else {
        item = this._items.find((el: IRole) => el.id == id);
      }
      return item || null;
    },
  },
});
