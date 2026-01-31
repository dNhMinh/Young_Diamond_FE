import { httpPublic } from "../http";
import type { ApiResponse } from "../../types/client";

export type FeedbackReview = {
  _id: string;
  fullName: string;
  email: string;
  content: string;
  createdAt: string;
};

export const reviewsApi = {
  list: async () => {
    const res = await httpPublic.get<ApiResponse<FeedbackReview[]>>("/reviews");
    return res.data;
  },
};
