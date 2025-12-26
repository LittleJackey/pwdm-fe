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
