//src/api/admin/agentRequests.api.ts
import baseApi from "../../api/baseApi";
import type { ApiResponse } from "../../types/order";

export type BusinessForm = {
  _id: string;
  name: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type AgentRequest = {
  _id: string;
  fullName: string;
  bussinessForm?: string;
  phoneNumber: string;
  email: string;
  address: string;
  linkShop?: string;
  description?: string;
  isContacted?: boolean;
  deleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateBusinessFormPayload = {
  name: string;
  isActive: boolean;
};

export const getAdminAgentRequestsApi = () => {
  return baseApi.get<ApiResponse<AgentRequest[]>>("/admin/agent-requests");
};

export const getBusinessFormsApi = () => {
  return baseApi.get<ApiResponse<BusinessForm[]>>(
    "/admin/agent-requests/business-forms",
  );
};

export const createBusinessFormApi = (payload: CreateBusinessFormPayload) => {
  return baseApi.post<ApiResponse<BusinessForm>>(
    "/admin/agent-requests/add-business-form",
    payload,
  );
};

export const updateBusinessFormApi = (
  bussinessId: string,
  payload: Partial<CreateBusinessFormPayload>,
) => {
  return baseApi.patch<ApiResponse<BusinessForm>>(
    `/admin/agent-requests/edit-business-form/${bussinessId}`,
    payload,
  );
};

export const deleteBusinessFormApi = (bussinessId: string) => {
  return baseApi.delete<ApiResponse<unknown>>(
    `/admin/agent-requests/delete-business-form/${bussinessId}`,
  );
};

export const updateAgentRequestIsContactedApi = (agentRequestId: string) => {
  return baseApi.patch<ApiResponse<{ _id: string; isContacted: boolean }>>(
    `/admin/agent-requests/update-isContact/${agentRequestId}`,
  );
};

export const deleteAgentRequestApi = (agentRequestId: string) => {
  return baseApi.delete<ApiResponse<unknown>>(
    `/admin/agent-requests/delete/${agentRequestId}`,
  );
};
