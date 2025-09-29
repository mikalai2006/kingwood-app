import { defineStore } from "pinia";
import {
  getIamFromServer,
  login,
  logout,
  refresh_token,
  register,
} from "@/api/auth";
import {
  IAmUser,
  IAuthData,
  ILoginData,
  IResResultLogin,
} from "@/api/auth/types";

import { useCookies } from "@vueuse/integrations/useCookies";
import { deleteAxiosHeader, setAxiosHeader } from "@/utils/http/axios";
import { IUser } from "@/api/user/types";
import { useRoleStore } from "../role";
import { isExpiredTime } from "@/utils/utils";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    // _token: "",
    _iam: {} as IAmUser,
    _refreshTokenLoading: false,
    pageBeforeRefreshToken: "",
    _authData: {
      login: "",
      password: "",
      remembe: false,
    } as IAuthData,
    // ti: null as ReturnType<typeof setTimeout> | null,
    _serviceAccessToken: null as string | null,
    tokenData: null as IResResultLogin | null,
  }),
  getters: {
    token: (state) => state.tokenData?.access_token,
    authData: (state) => state._authData,
    isAuthenticated(state): boolean {
      return !!state._serviceAccessToken; //!!state.tokenData?.access_token;
    },
    iam: (state) => state._iam,
    code: (state) => {
      const roleStore = useRoleStore();
      return roleStore.items.find((x) => x.id == state._iam.roleId)?.code || "";
    },
    roles: (state) => {
      const roleStore = useRoleStore();
      return (
        roleStore.items.find((x) => x.id == state._iam.roleId)?.value || []
      );
    },
  },
  actions: {
    setAuthData(data: IAuthData) {
      this._authData = { ...data };
    },
    // isExpiredRefreshToken() {
    //   // console.log("isExpiredRefreshToken: ", this.tokenData);
    //   if (!this?.tokenData) return true;

    //   const time = new Date().getTime();
    //   const timeExp = new Date(this.tokenData.expires_in_r).getTime();
    //   const diff = timeExp - time - 5000;
    //   // console.log("diff refresh=", diff);

    //   const isExp = diff <= 0;

    //   return isExp;
    // },
    // isExpiredAccessToken() {
    //   // console.log("isExpiredAccessToken: ", this.tokenData);

    //   if (!this?.tokenData) return true;

    //   const time = new Date().getTime();
    //   const timeExp = new Date(this.tokenData.expires_in).getTime();
    //   const diff = timeExp - time - 5000;
    //   // console.log("diff=", diff);

    //   const isExp = diff <= 0;

    //   return isExp;
    // },
    setTokenData(data: IResResultLogin | null) {
      this.tokenData = data;
    },
    async getIAm(): Promise<IUser | null> {
      return await getIamFromServer()
        .then((r) => {
          this._iam = r;
          return r;
        })
        .catch((e) => {
          const cookies = useCookies(["jwt"]);
          cookies.remove("jwt");

          if (this.tokenData && isExpiredTime(this.tokenData.expires_in_r)) {
            this.tokenData = null;
            this._iam = {};

            localStorage.removeItem("tokens");
          }

          console.log("eeeeeeeeeeeeeeeee=", e);

          if (e.code == 401) {
          }

          setAxiosHeader("Authorization", `Bearer ${this.token}`);
          deleteAxiosHeader("Authorization");
          throw e;
        });
    },
    setAuthOptions(_data: IResResultLogin) {
      this._serviceAccessToken = _data?.access_token;
      setAxiosHeader("Authorization", `Bearer ${_data.access_token}`);
      this.setTokenData(_data);

      const cookies = useCookies(["jwt"]);
      cookies.set("jwt", this.token);

      localStorage.setItem("tokens", JSON.stringify(_data));
    },
    async login(body: ILoginData) {
      try {
        const data = await login(body);
        if (data?.access_token) {
          // this.setTokenData(data);
          // setAxiosHeader("Authorization", `Bearer ${this.token}`);

          // const cookies = useCookies(["jwt"]);
          // cookies.set("jwt", data.access_token);

          // localStorage.setItem("tokens", JSON.stringify(data));

          this.setAuthOptions(data);
          // and get iam.
          await this.getIAm();
        } else {
          throw data;
        }
        return data;
      } catch (e) {
        throw e;
      }
    },
    async onRegister(body: IUser) {
      try {
        const data = await register(body);
        // if (data) {
        //   // this.setToken(data.access_token)
        //   // setAxiosHeader('Authorization', `Bearer ${this.token}`)
        //   // and get iam.
        //   await this.login(body)
        // }
        return data;
      } catch (e) {
        throw e;
      }
    },
    async initToken(): Promise<IUser | null> {
      try {
        const _tokens = localStorage.getItem("tokens");
        const tokens: IResResultLogin | null = _tokens
          ? JSON.parse(_tokens)
          : null;
        if (tokens?.access_token) {
          this._serviceAccessToken = tokens?.access_token;
          //  console.log(
          //   "init tokens: ",
          //   tokens,
          //   isExpiredTime(tokens.expires_in_r)
          // );

          // if (!this.isExpiredAccessToken) {
          //   setAxiosHeader("Authorization", `Bearer ${tokens?.access_token}`);
          // } else if (this.isExpiredAccessToken() && !this.isExpiredRefreshToken()) {

          //}
          let userData = null;
          if (!isExpiredTime(tokens.expires_in_r)) {
            await this.refreshToken(tokens);
            userData = this.getIAm();
            // this.setTokenData(tokens);
          } else {
            const cookies = useCookies(["jwt"]);
            cookies.remove("jwt");

            localStorage.removeItem("tokens");
          }

          return userData;
        }
        const remembe = localStorage.getItem("remembe");
        if (remembe) {
          const _remembe = JSON.parse(remembe);
          this.setAuthData(_remembe);
        }
      } catch (e) {
        throw e;
      }
      return null;
    },
    async onSyncToken(): Promise<IResResultLogin | null> {
      try {
        const { access_token, refresh_token, expires_in, expires_in_r } =
          this.tokenData || {};

        const isAuthActually =
          access_token && access_token !== "" && !isExpiredTime(expires_in);
        const mayByRefresh =
          refresh_token !== "" && !isExpiredTime(expires_in_r);

        // console.log(
        //   this.tokenData,
        //   "isAuthActually=",
        //   isAuthActually,
        //   "mayByRefresh=",
        //   mayByRefresh,
        //   "isExpiredAccessToken=",
        //   // this.isExpiredAccessToken(),

        //   "isExpiredRefreshToken="
        //   // this.isExpiredRefreshToken()
        //   // "isAccessTokenExpired()=",
        //   // isAccessTokenExpired(),
        //   // "isRefreshTokenExpired()=",
        //   // isRefreshTokenExpired()
        // );
        if (!isAuthActually) {
          if (mayByRefresh) {
            // // если токен уже пытается обновиться, последующие проверки прерываем.
            // if (this._refreshTokenLoading) {
            //   return null;
            // }

            // this._refreshTokenLoading = true;
            const refreshTokens = await this.refreshToken(this.tokenData);
            // this?.router.replace("/reauth");

            // this.pageBeforeRefreshToken = this.router.currentRoute.value.name;
            // this._refreshTokenLoading = false;
            return refreshTokens;
            // return null;
          } else {
            // throw new Error('Not auth');
            // navigation.navigate(ScreenKeys.AuthScreen);
            // router.navigate("/modalauth");
            return null;
          }
        } else {
          return this.tokenData;
        }
      } catch (e) {
        throw e;
      }
    },

    // async getToken() {
    //   try {
    //     if (window) {
    //       // parse url params
    //       const urlSearchParams = new URLSearchParams(window.location.search)
    //       const params = Object.fromEntries(urlSearchParams.entries())
    //       if (params.token) {
    //         // 👇️ ts-ignore ignores any ts errors on the next line (router in main.ts)
    //         // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //         // @ts-ignore
    //         const allQuery = this.router.currentRoute.value.query
    //         let query = Object.assign({}, allQuery)
    //         delete query.token
    //         this.router.replace({ query })
    //         this.setToken(params.token)
    //       }
    //     }
    //   } catch (e) {
    //     console.error(e)
    //     throw e
    //   }
    // },
    async refreshToken(tokens: IResResultLogin) {
      try {
        // Not read cookie because cookie httpOnly.
        // const token: string = cookie.get('jwt-handmade')
        if (!tokens) return null;

        const data = await refresh_token({
          token: tokens.refresh_token,
        });
        // console.log("refresh token result: ", data);

        if (data?.access_token != "") {
          // this.setTokenData(data.access_token ? data : null);
          // localStorage.setItem("tokens", JSON.stringify(data));

          this.setAuthOptions(data);
        } else {
          this.tokenData = null;
          this._iam = {};

          localStorage.removeItem("tokens");
        }

        // if (data.access_token) {
        // } else {
        //   this.setTokenData()
        // }
        // this.startSession();
        return this.tokenData;
      } catch (e) {
        console.error(e);
        throw e;
      }
    },
    // startSession() {
    //   console.log("startSession");
    //   this.ti = setTimeout(this.onDetectExpireSession, 5 * 60000);
    // },
    // async onDetectExpireSession() {
    //   if (!this.ti) {
    //     return;
    //   }
    //   clearTimeout(this.ti);
    //   this.initAuth().then(() => {
    //     this.startSession();
    //   });
    // },
    async logout() {
      // await fetch("api/v1/auth/logout", {
      //   method: "POST",
      //   body: JSON.stringify({ token: "" }),
      // }).then(() => {});
      await logout({ token: "" });

      this.tokenData = null;
      this._iam = {};

      const cookies = useCookies(["jwt"]);
      cookies.remove("jwt");

      localStorage.removeItem("tokens");

      setAxiosHeader("Authorization", `Bearer ${this.token}`);
      deleteAxiosHeader("Authorization");
    },
    // async initAuth() {
    //   try {
    //     const localTokens =
    //       // check param token.
    //       // await this.getToken()
    //       // refresh token.
    //       await this.refreshToken(this.tokenData);
    //     // if exists token, set header auth.
    //     if (this.token) {
    //       setAxiosHeader("Authorization", `Bearer ${this.token}`);
    //       // and get iam.
    //       await this.getIAm();
    //     }
    //   } catch (e) {
    //     console.error(e);
    //     throw e;
    //   }
    // },
  },
});
