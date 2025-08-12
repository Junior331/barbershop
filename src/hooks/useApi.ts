/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import axios from "axios";

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
    } catch (error: any) {
      setError(error.response?.data?.message || error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { apiCall, loading, error, setToken, getToken, removeToken };
};
