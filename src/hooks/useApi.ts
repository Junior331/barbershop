/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { ApiError } from "@/utils/types";
import { cookieUtils, COOKIE_NAMES } from "@/utils/cookies";
import axios, { isAxiosError } from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const useApi = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const setToken = (token: string) => {
    cookieUtils.set(COOKIE_NAMES.ACCESS_TOKEN, token, {
      expires: 7, // 7 dias
      secure: true,
      sameSite: 'Strict'
    });
  };

  const getToken = (): string | null => {
    return cookieUtils.get(COOKIE_NAMES.ACCESS_TOKEN);
  };

  const removeToken = () => {
    cookieUtils.remove(COOKIE_NAMES.ACCESS_TOKEN);
  };

  const apiCall = async (
    url: string,
    method: string = "GET",
    body: any = null
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      const token = getToken();
      const headers: any = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      const response = await axios({
        url: `${API_URL}${url}`,
        method: method.toLowerCase() as any,
        data: body,
        headers,
      });
      
      return response.data;
    } catch (error: unknown) {
      let errorMessage = "Erro na requisição";
      
      if (isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
        
        // Se erro 401, remover token inválido
        if (error.response?.status === 401) {
          removeToken();
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      
      const apiError: ApiError = {
        message: errorMessage,
        status: isAxiosError(error) ? error.response?.status : undefined,
        code: isAxiosError(error) ? error.code : undefined,
      };
      
      throw apiError;
    } finally {
      setLoading(false);
    }
  };

  return { apiCall, loading, error, setToken, getToken, removeToken };
};
