import baseApi from "../../api/baseApi";
import type {
  ApiResponse,
  ReviewFormValues,
  ReviewItem,
} from "../../types/review";

export const getAdminReviewsApi = () => {
  return baseApi.get<ApiResponse<ReviewItem[]>>("/admin/reviews");
};

export const addReviewApi = (payload: ReviewFormValues) => {
  return baseApi.post<ApiResponse<ReviewItem>>("/admin/reviews/add", payload);
};

export const editReviewApi = (reviewId: string, payload: ReviewFormValues) => {
  return baseApi.patch<ApiResponse<ReviewItem>>(
    `/admin/reviews/edit/${reviewId}`,
    payload,
  );
};

export const deleteReviewApi = (reviewId: string) => {
  return baseApi.delete<ApiResponse<null>>(`/admin/reviews/delete/${reviewId}`);
};
