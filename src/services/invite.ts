import type { GenerateInviteDTO, InviteCodeVO } from '@/types/invite'
import type { BasePageVO, BasePageQueryParam } from '@/types/data'
import { request } from '@/utils/request'

export const generateInviteApi = (dto: GenerateInviteDTO) => request<string>('admin/invite/generate', 'POST', dto)

export const getInviteListApi = (params: BasePageQueryParam & { status?: number }) =>
  request<BasePageVO<InviteCodeVO>>('admin/invite/list', 'GET', undefined, { params })

export const revokeInviteApi = (id: number) => request(`admin/invite/${id}/revoke`, 'PUT')
