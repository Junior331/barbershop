import { useFormik } from "formik";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

import { schema } from "./schema";
import { authService, AuthError } from "@/services/auth.service";
import { useAuth } from "@/context/AuthContext";
import { logger } from "@/utils/logger";
import { cookieUtils, COOKIE_NAMES } from "@/utils/cookies";

export const useSignin = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      setLoading(true);
      setError(null);

      try {
        logger.info('Iniciando processo de login');

        // Fazer login usando o novo serviço
        const authResponse = await authService.login({
          email: values.email,
          password: values.password,
        });

        // Salvar tokens nos cookies
        const cookieOptions = {
          expires: values.rememberMe ? 30 : 1, // 30 dias ou 1 dia
          secure: true,
          sameSite: 'Strict' as const,
        };

        cookieUtils.set(COOKIE_NAMES.ACCESS_TOKEN, authResponse.accessToken, cookieOptions);
        cookieUtils.set(COOKIE_NAMES.REFRESH_TOKEN, authResponse.refreshToken, {
          ...cookieOptions,
          expires: 7, // Refresh token sempre 7 dias
        });
        cookieUtils.set(COOKIE_NAMES.USER_DATA, JSON.stringify(authResponse.user), cookieOptions);

        // Adaptar User para IUserData
        const adaptedUser = {
          id: authResponse.user.id,
          name: authResponse.user.name,
          email: authResponse.user.email,
          role: authResponse.user.role,
          phone: authResponse.user.phone || '',
          city: '',
          state: '',
          street: '',
          country: '',
          avatar_url: authResponse.user.avatarUrl || '',
          postal_code: '',
          house_number: '',
          complement: '',
          isVerified: authResponse.user.isVerified,
          biography: '',
          birthDate: '',
          postalCode: '',
          neighborhood: ''
        };

        // Atualizar contexto de autenticação
        setAuth(adaptedUser, authResponse.accessToken);

        logger.info('Login realizado com sucesso', {
          userId: authResponse.user.id,
          role: authResponse.user.role,
          rememberMe: values.rememberMe,
        });

        toast.success(`Bem-vindo(a), ${authResponse.user.name}!`);

        // Redirecionar baseado no role do usuário
        const redirectPath = getRedirectPath(authResponse.user.role);
        navigate(redirectPath);

      } catch (error) {
        const authError = error as AuthError;

        logger.error('Erro no processo de login:', authError);

        // Mostrar erro específico baseado no campo
        if (authError.field === 'email') {
          formik.setFieldError('email', authError.message);
        } else if (authError.field === 'password') {
          formik.setFieldError('password', authError.message);
        } else {
          setError(authError.message);
          toast.error(authError.message);
        }
      } finally {
        setLoading(false);
      }
    },
  });

  // Função para determinar redirecionamento baseado no role
  const getRedirectPath = (role: string): string => {
    switch (role) {
      case 'BARBER':
        return '/barber';
      case 'ADMIN':
      case 'OWNER':
        return '/admin';
      case 'CLIENT':
      default:
        return '/';
    }
  };

  return {
    error,
    formik,
    loading,
  };
};
