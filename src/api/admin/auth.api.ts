import baseApi from "../../api/baseApi";
import type {
  LoginRequest,
  LoginResponse,
} from "../../features/admin/auth/auth.types";

export const adminLoginApi = (data: LoginRequest) => {
  return baseApi.post<LoginResponse>("/admin/users/login", data);
};
