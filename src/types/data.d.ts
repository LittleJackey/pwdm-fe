export type Data<T> = {
  code: number
  msg: string
  data: T
}

export type CaptchaImg = {
  uuid: string
  base64: string
  expired: Date
}

export type BasePageQueryParam = {
  /** 当前页码 */
  pageNum: number

  /** 每页显示条数 */
  pageSize: number

  /** 排序字段 */
  orderColumn: string

  /** 排序方向 */
  orderDirection: 'ascending' | 'descending'
}

export type BasePageVO<T> = {
  total: number
  records: Array<T>
}
