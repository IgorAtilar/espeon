export enum ToastType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
}

export interface Toast {
  type: ToastType
  message: string
}
