import type { AxiosResponse } from 'axios'
import type { RequestOptions, Result } from '/#/axios'
import type { AxiosTransform, CreateAxiosOptions } from './axiosTransform'
import { VAxios } from './Axios'
import { RequestEnum, ContentTypeEnum } from '/@/enums/httpEnum'
import { isString } from '../is'
import { setObjToUrlParams, deepMerge } from '/@/utils'
import { joinTimestamp, formatRequestDate } from './helper'
import storage from '../storage'

const transform: AxiosTransform = {
  transformRequestHook: (
    res: AxiosResponse<Result>,
    options: RequestOptions
  ) => {
    const { isTransformResponse, isReturnNativeResponse } = options
    if (isReturnNativeResponse) {
      return res
    }
    if (!isTransformResponse) {
      return res.data
    }
    const { data } = res
    if (!data) {
      throw new Error('request failed!')
    }
    const { message, code } = data
    const hasSuccess = data && data.result !== null && !code
    if (hasSuccess) {
      return data.result
    }
    throw new Error(message || 'Request fail!')
  },
  beforeRequestHook: (config, options) => {
    const { apiUrl, joinParamsToUrl, formatDate, joinTime = true } = options

    if (apiUrl && isString(apiUrl)) {
      config.url = `${apiUrl}${config.url}`
    }
    const params = config.params || {}
    const data = config.data || false
    formatDate && data && !isString(data) && formatRequestDate(data)
    if (config.method?.toUpperCase() === RequestEnum.GET) {
      if (!isString(params)) {
        config.params = Object.assign(
          params || {},
          joinTimestamp(joinTime, false)
        )
      } else {
        config.url = config.url + params + `${joinTimestamp(joinTime, true)}`
        config.params = undefined
      }
    } else {
      if (!isString(params)) {
        const subdomain = localStorage.getItem('subdomain')
        if (data instanceof FormData) {
          subdomain && data.append('_s', subdomain)
        } else {
          Object.assign(params, { _s: subdomain })
        }
        formatDate && formatRequestDate(params)
        config.data = data
        config.params = params

        if (joinParamsToUrl) {
          config.url = setObjToUrlParams(
            config.url as string,
            Object.assign({}, config.params, config.data)
          )
        }
      } else {
        config.url = config.url + params
        config.params = undefined
      }
    }
    return config
  },

  requestInterceptors: (config: any) => {
    const token = storage.get('access_token')
    if (token) {
      config.headers.Authorization = 'Bearer ' + token
    }
    return config
  },

  responseInterceptors: (res: AxiosResponse<any>) => {
    return res
  },

  responseInterceptorsCatch: (error: any) => {
    const { code, message, response } = error || {}
    const err: string = error?.toString?.() ?? ''
    let errMessage = ''

    try {
      if (code === 'ECONNABORTED' && message.indexOf('timeout') !== -1) {
        errMessage = 'Yêu cầu hết thời hạn!'
      }
      if (err?.includes('Network Error')) {
        errMessage = 'Lỗi mạng!'
      }

      if (errMessage) {
        // Alert.alert(errMessage);
      }
    } catch (e) {
      return Promise.reject(e)
    }
    if (response) {
      return Promise.reject(response)
    }
    return Promise.reject(error)
  },
}

function createAxios(opt?: Partial<CreateAxiosOptions>) {
  return new VAxios(
    deepMerge(
      {
        authenticationScheme: '',
        timeout: 0,
        headers: { 'Content-Type': ContentTypeEnum.JSON },
        transform,
        requestOptions: {
          joinPrefix: true,
          isReturnNativeResponse: false,
          isTransformResponse: true,
          joinParamsToUrl: false,
          formatDate: true,
          errorMessageMode: 'message',
          apiUrl: '/api',
          joinTime: true,
          ignoreCancelToken: true,
          withToken: true,
        },
      },
      opt || {}
    )
  )
}
export const defHttp = createAxios()
