import { useFormik } from "formik";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

import { schema } from "./schema";
import { resetPasswordService, type AuthError } from "@/services/auth.service";
import { logger } from "@/utils/logger";

export const useResetPassword = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formik = useFormik({
    initialValues: {
      email: "",
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      setLoading(true);
      setError(null);

      try {
        logger.info('Iniciando processo de reset de senha');

        const response = await resetPasswordService.resetPassword({
          email: values.email,
          newPassword: values.newPassword,
        });

        logger.info('Reset de senha realizado com sucesso');

        toast.success(response.message || 'Senha resetada com sucesso!');

        // Redirecionar para login após 2 segundos
        setTimeout(() => {
          navigate('/signin');
        }, 2000);

      } catch (error) {
        const authError = error as AuthError;

        logger.error('Erro no processo de reset de senha:', authError);

        // Mostrar erro específico baseado no campo
        if (authError.field === 'email') {
          formik.setFieldError('email', authError.message);
        } else {
          setError(authError.message);
          toast.error(authError.message);
        }
      } finally {
        setLoading(false);
      }
    },
  });

  return {
    error,
    formik,
    loading,
  };
};
