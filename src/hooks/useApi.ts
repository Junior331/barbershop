/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { useState } from "react";
import { ApiError } from "@/utils/types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const useApi = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const setToken = (token: string) => {
    document.cookie = `accessToken=${token}; path=/; secure; SameSite=Strict`; // Salva o token no cookie
  };

  const getToken = (): string | null => {
    const match = document.cookie.match(new RegExp("(^| )accessToken=([^;]+)"));
    return match ? match[2] : null;
  };

  const removeToken = () => {
    document.cookie =
      "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"; // Remove o token
  };

  const apiCall = async (
    url: string,
    method: string = "GET",
    body: any = null
  ) => {
    const token = getToken();
    const config = {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
    };

    try {
      setLoading(true);
      const response = await axios({
        url: `${API_URL}${url}`,
        method: method,
        data: body,
        ...config,
      });
      return response.data;
    } catch (error: unknown) {
      let errorMessage = "Erro na requisição";
      
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      
      const apiError: ApiError = {
        message: errorMessage,
        status: axios.isAxiosError(error) ? error.response?.status : undefined,
        code: axios.isAxiosError(error) ? error.code : undefined,
      };
      
      throw apiError;
    } finally {
      setLoading(false);
    }
  };

  return { apiCall, loading, error, setToken, getToken, removeToken };
};
