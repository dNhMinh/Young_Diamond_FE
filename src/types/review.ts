export interface ReviewItem {
  _id: string;
  fullName: string;
  email: string;
  content: string;
  deleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export type ReviewFormValues = {
  fullName: string;
  email: string;
  content: string;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
};
