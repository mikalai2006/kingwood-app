import { defineStore } from "pinia";
import {
  getIamFromServer,
  login,
  logout,
  refresh_token,
  register,
} from "@/api/auth";
import { IAmUser, ILoginData, IResResultLogin } from "@/api/auth/types";

import { useCookies } from "@vueuse/integrations/useCookies";
import { deleteAxiosHeader, setAxiosHeader } from "@/utils/http/axios";
import { IUser } from "@/api/user/types";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    // _token: "",
    _iam: {} as IAmUser,
    // ti: null as ReturnType<typeof setTimeout> | null,

    tokenData: null as IResResultLogin | null,
  }),
  getters: {
    token: (state) => state.tokenData?.access_token,
    isAuthenticated(state): boolean {
      return !!state.tokenData?.access_token;
    },
    iam: (state) => state._iam,
  },
  actions: {
    isExpiredRefreshToken() {
      // console.log("isExpiredRefreshToken: ", this.tokenData);
      if (!this?.tokenData) return true;

      const time = new Date().getTime();
      const timeExp = new Date(this.tokenData.expires_in_r).getTime();
      const diff = timeExp - time - 5000;
      // console.log("diff refresh=", diff);

      const isExp = diff <= 0;

      return isExp;
    },
    isExpiredAccessToken() {
      // console.log("isExpiredAccessToken: ", this.tokenData);

      if (!this?.tokenData) return true;

      const time = new Date().getTime();
      const timeExp = new Date(this.tokenData.expires_in).getTime();
      const diff = timeExp - time - 5000;
      // console.log("diff=", diff);

      const isExp = diff <= 0;

      return isExp;
    },
    setTokenData(data: IResResultLogin | null) {
      this.tokenData = data;
    },
    async getIAm() {
      this._iam = await getIamFromServer();
    },
    async login(body: ILoginData) {
      try {
        const data = await login(body);
        if (data) {
          this.setTokenData(data);
          setAxiosHeader("Authorization", `Bearer ${this.token}`);

          const cookies = useCookies(["jwt"]);
          cookies.set("jwt", data.access_token);

          localStorage.setItem("tokens", JSON.stringify(data));

          // and get iam.
          await this.getIAm();
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
    initToken() {
      const _tokens = localStorage.getItem("tokens");
      const tokens: IResResultLogin | null = _tokens
        ? JSON.parse(_tokens)
        : null;
      if (tokens?.access_token) {
        console.log("init tokens: ", tokens, this.isExpiredAccessToken());
        this.setTokenData(tokens);

        // if (!this.isExpiredAccessToken) {
        //   setAxiosHeader("Authorization", `Bearer ${tokens?.access_token}`);
        // } else if (this.isExpiredAccessToken) {
        //   this.refreshToken();
        // }

        this.getIAm();
      }
    },
    async onSyncToken(): Promise<IResResultLogin | null> {
      try {
        const { access_token, refresh_token } = this.tokenData || {};

        const isAuthActually =
          access_token && access_token !== "" && !this.isExpiredAccessToken();
        const mayByRefresh =
          refresh_token !== "" && !this.isExpiredRefreshToken();

        // console.log(
        //   "isAuthActually=",
        //   isAuthActually,
        //   "mayByRefresh=",
        //   mayByRefresh,
        //   "isExpiredAccessToken=",
        //   this.isExpiredAccessToken()

        //   // "isAccessTokenExpired()=",
        //   // isAccessTokenExpired(),
        //   // "isRefreshTokenExpired()=",
        //   // isRefreshTokenExpired()
        // );
        if (!isAuthActually) {
          if (mayByRefresh) {
            const refreshTokens = await this.refreshToken();
            // if (!refreshTokens) {
            //     navigation.navigate(ScreenKeys.AuthScreen);
            // }
            return refreshTokens;
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
    async refreshToken() {
      try {
        // Not read cookie because cookie httpOnly.
        // const token: string = cookie.get('jwt-handmade')
        if (!this.tokenData) return null;

        const data = await refresh_token({
          token: this.tokenData.refresh_token,
        });
        console.log("refresh token result: ", data);

        this.setTokenData(data.access_token ? data : null);

        localStorage.setItem("tokens", JSON.stringify(data));

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
      this.tokenData = null;
      this._iam = {};
      setAxiosHeader("Authorization", `Bearer ${this.token}`);
      deleteAxiosHeader("Authorization");
      logout({ token: "" });
    },
    async initAuth() {
      try {
        const localTokens =
          // check param token.
          // await this.getToken()
          // refresh token.
          await this.refreshToken();
        // if exists token, set header auth.
        if (this.token) {
          setAxiosHeader("Authorization", `Bearer ${this.token}`);
          // and get iam.
          await this.getIAm();
        }
      } catch (e) {
        console.error(e);
        throw e;
      }
    },
  },
});
