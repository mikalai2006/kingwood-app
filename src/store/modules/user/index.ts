import { defineStore } from "pinia";
import { find, get, remove } from "@/api/user";
import { IUser, IUserFilter, IUserInput } from "@/api/user/types";
import { IRequestParams } from "@/api/types";
// import sift from 'sift'
import { useAuthStore } from "../auth";
import { getObjectId } from "@/utils/utils";
import { useTaskWorkerStore } from "../task_worker";
import { useObjectStore } from "../object";
import { useTaskStore } from "../task";
import { useOrderStore } from "../order";

export const useUserStore = defineStore("user", {
  state() {
    return {
      _items: [] as IUser[],
    };
  },
  getters: {
    items(state) {
      return state._items;
    },
    person: (state) => {
      const authStore = useAuthStore();
      return authStore.iam
        ? state._items.filter(
            (x) => x.id === authStore.iam.userId
            // sift({
            //   _id: authStore.iam.userId,
            // })
          )
        : null;
    },
  },
  actions: {
    async get(id: string) {
      const data = await get(id);

      data && this.onAddItemToStore(data);
      return data;
    },
    async find(params?: IUserFilter) {
      // const existsItem = this.onExists(params)
      // if (existsItem.index == -1) {
      const data = await find(params || {});
      data.data?.forEach((item) => {
        if (item.taskWorkers) {
          const taskWorkerStore = useTaskWorkerStore();
          item.taskWorkers.forEach((el) => {
            taskWorkerStore.onAddItemToStore(el);

            if (el.object) {
              const objectStore = useObjectStore();
              objectStore.onAddItemToStore(el.object);
            }
            if (el.task) {
              const taskStore = useTaskStore();
              taskStore.onAddItemToStore(el.task);
            }
            if (el.order) {
              const orderStore = useOrderStore();
              orderStore.onAddItemToStore(el.order);
            }
          });
        }

        this.onAddItemToStore(item);
      });
      // }

      return data;
    },
    /**
     * Check exists item to store.
     * @param params
     * @returns
     */
    onExists(id: string): {
      item: IUser | null;
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
    onAddItemToStore(item: IUser) {
      if (getObjectId(item?.id) == "0") {
        return;
      }

      const existsItem = this.onExists(item.id);

      if (existsItem.index == -1) {
        this._items.push(item);
      } else {
        this._items[existsItem.index] = Object.assign(
          {},
          // this._items[existsItem.index],
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
    async onGet(id: string, params?: IRequestParams<IUser> | Partial<IUser>) {
      const data = await get(id);
      this.onAddItemToStore(data);
      return data;
    },
    onGetInStore(id: string | number, params?: IUser): IUser | null {
      let item = null;
      if (params) {
        // search by params
      } else {
        item = this._items.find((el: IUser) => el.id == id);
      }
      return item || null;
    },
    onRemoveItemFromStore(id: string | number, params?: IUserInput): number {
      let itemIndex = -1;
      if (params) {
        // search by params
      } else {
        itemIndex = this._items.findIndex((el: IUser) => el.id == id);
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
