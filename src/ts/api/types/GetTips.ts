import { SuperType } from '../../entities/Card'

export type TipsResponse = {
  tips: string
}

export type RawGetTipsResponse =
  | {
      tips: string
    }
  | { message: string }

export type TipCard = {
  name: string
  type: SuperType
}

export interface GetTipsParams {
  deck: TipCard[]
}

export interface GetTipsResponse {
  error?: boolean
  message?: string
  tips?: string
  loading?: boolean
}
