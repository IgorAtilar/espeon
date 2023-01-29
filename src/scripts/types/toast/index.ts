export enum ToastType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
}

export type Toast = {
  type: ToastType;
  message: string;
};
