import { useState } from "react";
import { useFormik } from "formik";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import { schema } from "./schema";
import { authService, AuthError } from "@/services/auth.service";
import { useAuth } from "@/context/AuthContext";
import { logger } from "@/utils/logger";
import { cookieUtils, COOKIE_NAMES } from "@/utils/cookies";

export const useSignup = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isShowPassword, setIsShowPassword] = useState(false);
  const [isShowConfirmPassword, setIsShowConfirmPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      acceptTerms: false,
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      // Validar se senhas coincidem
      if (values.password !== values.confirmPassword) {
        formik.setFieldError('confirmPassword', 'As senhas não coincidem');
        return;
      }

      // Validar se aceitou os termos
      if (!values.acceptTerms) {
        toast.error('Você deve aceitar os termos de uso');
        return;
      }

      setLoading(true);

      try {
        logger.info('Iniciando processo de registro');

        // Validar se email já existe (opcional, para melhor UX)
        try {
          const emailCheck = await authService.checkEmail(values.email);
          if (emailCheck.exists) {
            formik.setFieldError('email', 'Este email já está em uso');
            setLoading(false);
            return;
          }
        } catch (error) {
          // Se der erro na verificação, continua com o registro
          logger.warn('Erro ao verificar email, continuando com registro:', error);
        }

        // Fazer registro usando o novo serviço
        const authResponse = await authService.register({
          name: values.name.trim(),
          email: values.email.toLowerCase().trim(),
          password: values.password,
          phone: values.phone.trim() || undefined,
          role: 'CLIENT', // Por padrão, novos usuários são clientes
        });

        // Salvar tokens nos cookies
        const cookieOptions = {
          expires: 7, // 7 dias
          secure: true,
          sameSite: 'Strict' as const,
        };

        cookieUtils.set(COOKIE_NAMES.ACCESS_TOKEN, authResponse.accessToken, cookieOptions);
        cookieUtils.set(COOKIE_NAMES.REFRESH_TOKEN, authResponse.refreshToken, cookieOptions);
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

        logger.info('Registro realizado com sucesso', {
          userId: authResponse.user.id,
          role: authResponse.user.role,
        });

        toast.success(`Bem-vindo(a), ${authResponse.user.name}! Sua conta foi criada com sucesso.`);

        // Redirecionar para home (ou onboarding no futuro)
        navigate('/');

      } catch (error) {
        const authError = error as AuthError;

        logger.error('Erro no processo de registro:', authError);

        // Mostrar erro específico baseado no campo
        if (authError.field === 'email') {
          formik.setFieldError('email', authError.message);
        } else if (authError.field === 'password') {
          formik.setFieldError('password', authError.message);
        } else if (authError.field === 'name') {
          formik.setFieldError('name', authError.message);
        } else if (authError.field === 'phone') {
          formik.setFieldError('phone', authError.message);
        } else {
          toast.error(authError.message);
        }
      } finally {
        setLoading(false);
      }
    },
  });

  return {
    formik,
    loading,
    isShowPassword,
    setIsShowPassword,
    isShowConfirmPassword,
    setIsShowConfirmPassword,
  };
};
