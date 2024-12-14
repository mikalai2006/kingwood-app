// Returns the interface of res.data
export interface IResponse<T = any> {
  code: number | string
  result: T
  message: string
  status: string | number
}
