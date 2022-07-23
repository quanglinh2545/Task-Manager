import { ComponentPrice } from './priceModel'
export interface CreateComponentParams {
  name: string
  id?: number
}
export interface ProductComponent {
  id: number
  name: string
  created_at: string
  total: number
  is_expand?: boolean
  vendors: Vendor[]
  prices: ComponentPrice[]
  properties: ComponentProperty[]
}
export interface ComponentProperty {
  id: number
  name: string
  total: number
  position: number
  created_at: string
  updated_at: string
  tag_extract: string
  component_id: number
  values: PropertyValue[]
}
export interface Vendor {
  id: number
  name: string
  total: number
}
export interface CreatePropertyParam {
  name: string
  tag_extract: string
  component_id: number
  id?: number
}
export interface AssignCollectionsParams {
  component_id: number
  collections_id: number[]
}

export interface PropertyValue {
  id: number
  name: string
  total: number
  position: number
  created_at: string
  updated_at: string
  property_id: number
}
