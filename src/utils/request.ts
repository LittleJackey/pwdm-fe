import router from '@/router'
import { useUserStore } from '@/stores/modules/user'
import type { Data } from '@/types/data'
import axios, { AxiosError, type AxiosRequestConfig, type Method } from 'axios'
import { ElMessage } from 'element-plus'

const instance = axios.create({
  // 基础地址
  baseURL: 'http://localhost:8080',
  // 超时时间 10s
  timeout: 10000,
  // 允许携带token
  withCredentials: true
})

instance.interceptors.response.use(
  (res) => {
    // 处理业务失败
    if (res.data.code !== 0) {
      // 错误提示
      ElMessage.error({
        message: res.data.msg || '业务失败',
        plain: true
      })
      // 返回 错误的 promise
      return Promise.reject(res.data)
    }
    // 提取核心响应数据
    return res.data
  },
  (err: AxiosError) => {
    // 超时处理
    if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
      ElMessage.error({ message: '请求超时，请检查网络或稍后重试', plain: true })
      return Promise.reject(err)
    }
    // 处理 401 错误
    if (err.response?.status === 401) {
      // 清除本地的用户信息
      const store = useUserStore()
      store.delUser()
      ElMessage.error({ message: '登录已过期，请重新登录', plain: true })
      // 跳转到登录页面，携带当前访问页面的地址（包含参数的）
      router.replace({
        name: 'Login',
        query: { returnUrl: router.currentRoute.value.fullPath }
      })
      return Promise.reject(err)
    }

    // 其他网络错误（500/404/断网等）
    const netMsg = err.response?.statusText || '网络异常'
    ElMessage.error({ message: netMsg, plain: true })
    return Promise.reject(err)
  }
)

export const request = <T>(
  url: string,
  method: Method = 'GET',
  submitData?: object,
  axiosConfig: Omit<AxiosRequestConfig, 'url' | 'method' | 'data' | 'params'> = {}
) => {
  // 参数: 地址，请求方式，提交的数据
  // 返回 promise
  return instance.request<unknown, Data<T>>({
    url,
    method,
    [method.toUpperCase() === 'GET' ? 'params' : 'data']: submitData,
    ...axiosConfig
  })
}
