import { useFormik } from "formik";
import { toast } from "react-hot-toast";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { schema } from "./schema";
import { supabase } from "@/lib/supabase";
import { formatDateForSupabase } from "@/utils/utils";

export const useProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      phone: "",
      state: "",
      avatar: "",
      country: "",
      address: "",
      zip_code: "",
      birthday: "",
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      setLoading(true);
      const birthdayDate = formatDateForSupabase(values.birthday);

      try {
        // 1. Atualiza os dados na tabela 'users'
        const { error: userError } = await supabase
          .from('users')
          .update({
            name: values.name,
            phone: values.phone,
            birthday: birthdayDate,
            zip_code: values.zip_code,
            address: values.address,
            state: values.state,
            country: values.country,
            updated_at: new Date().toISOString(),
          })
          .eq('email', values.email);

        if (userError) throw userError;

        // 2. Atualiza os metadados do usuário no Auth (opcional)
        const { error: authError } = await supabase.auth.updateUser({
          data: {
            name: values.name,
            avatar: values.avatar,
          }
        });

        if (authError) throw authError;

        toast.success("Perfil atualizado com sucesso!");
        navigate("/account");
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Erro ao atualizar perfil";
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
  });


  const fetchAddress = async (cep: string) => {
    try {
      setCepLoading(true);
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();

      if (!data.erro) {
        formik.setFieldValue("address", data.logradouro);
        formik.setFieldValue("state", data.uf);
        formik.setFieldValue("country", "Brasil");
      }
    } finally {
      setCepLoading(false);
    }
  };

  useEffect(() => {
    const cep = formik.values.zip_code.replace(/\D/g, "");
    if (cep.length === 8) {
      fetchAddress(cep);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.zip_code]);

  return { formik, loading, cepLoading };
};
