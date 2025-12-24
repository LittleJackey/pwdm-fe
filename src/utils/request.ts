import type { Data } from '@/types/data'
import axios, { type Method } from 'axios'
import { ElMessage } from 'element-plus'

const instance = axios.create({
  // 基础地址
  baseURL: 'http://localhost:8080',
  // 超时时间
  timeout: 10000,
  // 允许携带token
  withCredentials: true
})

instance.interceptors.response.use((res) => {
  // 3. 处理业务失败
  if (res.data.code !== 0) {
    // 错误提示
    ElMessage.error(res.data.msg || '业务失败')
    // 返回 错误的 promise
    return Promise.reject(res.data)
  }
  // 4. 提取核心响应数据
  return res.data
})

export const request = <T>(url: string, method: Method = 'GET', submitData?: object) => {
  // 参数: 地址，请求方式，提交的数据
  // 返回 promise
  return instance.request<unknown, Data<T>>({
    url,
    method,
    [method.toUpperCase() === 'GET' ? 'params' : 'data']: submitData
  })
}
