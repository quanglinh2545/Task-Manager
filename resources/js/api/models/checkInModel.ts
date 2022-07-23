import { VoucherModel } from './voucherModel'
export interface CheckInModel {
  code: string
  created_at: string
  customer_name: string
  customer_phone: string
  id: number
  voucher_id: number
  description: string
  voucher_code: string
  isExpand?: boolean
  detail?: CheckInModelDetail[]
  isFetched?: boolean
  loading?: boolean
  location_name: string
  account_name: string
  tags: { name: string }[]
  quantity?: number
  is_active: boolean
}
export interface CheckInDetailModel extends CheckInModel {
  voucher: VoucherModel
}
interface SelectOption {
  value: string
  label: string
  phone?: string
  address?: string
}
export interface LocationAndAccount {
  locations: SelectOption[]
  accounts: SelectOption[]
}

export interface CheckInModelDetail {
  id: number
  child_name: string
  sku: string
  image_path: string | null
  name: string
  quantity: number
  expire_at: string
  code: string
}
