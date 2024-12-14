import { IUser } from "../user/types";

export interface ILoginData {
  login?: string;
  email?: string;
  password: string;
}

export interface ILoginRefreshToken {
  token: string;
}

export interface IResResultLogin {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_in_r: number;
}

export interface IAmUser extends Partial<IUser> {
  roles?: string[];
}

export interface IAuth {
  token_access: string;
  refresh_token: string;
}
