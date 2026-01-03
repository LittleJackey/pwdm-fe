import type { AccountPageQueryDTO, AccountVO, AddAccountDTO, UpdateAccountDTO } from '@/types/account'
import type { BasePageVO } from '@/types/data'
import { request } from '@/utils/request'

export const accountPageQueryApi = (dto: AccountPageQueryDTO) =>
  request<BasePageVO<AccountVO>>('account/page', 'GET', dto)

export const addAccountApi = (dto: AddAccountDTO) => request('account', 'POST', dto)

export const updateAccountApi = (dto: UpdateAccountDTO) => request('account', 'PUT', dto)

export const deleteAccountApi = (id: number) => request(`account/${id}`, 'DELETE')

export const deleteBatchAccountApi = (ids: number[]) => request(`account`, 'DELETE', ids)
