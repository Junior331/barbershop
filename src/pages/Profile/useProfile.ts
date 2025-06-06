import { useFormik } from "formik";
import { toast } from "react-hot-toast";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { supabase } from "@/lib/supabase";
import { formatDateForSupabase } from "@/utils/utils";
import { schema } from "./schema";

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
      street: "",
      postal_code: "",
      birth_date: "",
    },
    validationSchema: schema,
    
    onSubmit: async (values) => {
      setLoading(true);
      const birthdayDate = formatDateForSupabase(values.birth_date);

      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) throw new Error("Usuário não autenticado");

        // Chama a função RPC
        const { data, error } = await supabase
          .rpc('update_user_profile', {
            p_user_id: user.id,
            p_name: values.name,
            p_email: values.email,
            p_phone: values.phone,
            p_birth_date: birthdayDate,
            p_street: values.street,
            p_postal_code: values.postal_code,
            p_state: values.state,
            p_country: values.country,
            p_avatar_url: values.avatar || null,
            updated_at: new Date().toISOString(),
          });

        if (error) throw error;
        if (data && !data.success) throw new Error(data.message);

        // Atualiza os metadados locais
        await supabase.auth.updateUser({
          data: {
            name: values.name,
            avatar: values.avatar,
          }
        });


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
        formik.setFieldValue("street", data.logradouro);
        formik.setFieldValue("state", data.uf);
        formik.setFieldValue("country", "Brasil");
      }
    } finally {
      setCepLoading(false);
    }
  };

  useEffect(() => {
    const cep = formik.values.postal_code.replace(/\D/g, "");
    if (cep.length === 8) {
      fetchAddress(cep);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.postal_code]);

  return { formik, loading, cepLoading };
};
