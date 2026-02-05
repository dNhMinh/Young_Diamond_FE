// src/api/client/agentRequests.api.ts
import { httpPublic } from "../http";
import type { ApiResponse } from "../../types/client";

export type BusinessForm = {
  _id: string;
  name: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type AgentRequestPayload = {
  fullName: string;
  bussinessForm: string; // ✅ BE đang dùng key này
  phoneNumber: string;
  email: string;
  address: string;
  linkShop?: string;
  description?: string;
};

export type AgentRequest = {
  _id: string;
  fullName: string;
  bussinessForm: string;
  phoneNumber: string;
  email: string;
  address: string;
  linkShop?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
};

export const agentRequestsApi = {
  getBusinessForms: async () => {
    const res = await httpPublic.get<ApiResponse<BusinessForm[]>>(
      "/agent-requests/business-forms",
    );
    return res.data;
  },

  requestAgent: async (payload: AgentRequestPayload) => {
    const res = await httpPublic.post<ApiResponse<AgentRequest>>(
      "/agent-requests/request",
      payload,
    );
    return res.data;
  },
};
