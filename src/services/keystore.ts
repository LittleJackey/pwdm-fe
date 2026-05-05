import type { KeystoreSetupDTO, UserKeystoreVO } from '@/types/crypto'
import { request } from '@/utils/request'

export const getKdfConfigAndVerificationApi = () => request<UserKeystoreVO>('keystore/kdf-verify', 'GET')

export const setupKeystoreApi = (dto: KeystoreSetupDTO) => request('keystore/setup', 'POST', dto)
