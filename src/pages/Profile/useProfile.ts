import { useFormik } from "formik";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { schema } from "./schema";

export const useProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      phone: '',
      avatar: '',
      birthday: '',
      zip_code: '',
      address: '',
      state: '',
      country: '',
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        // Substituir por chamada real da API
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log('Dados enviados:', values);
        navigate("/account");
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
        formik.setFieldValue('address', data.logradouro);
        formik.setFieldValue('state', data.uf);
        formik.setFieldValue('country', 'Brasil');
      }
    } finally {
      setCepLoading(false);
    }
  };

  useEffect(() => {
    const cep = formik.values.zip_code.replace(/\D/g, '');
    if (cep.length === 8) {
      fetchAddress(cep);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.zip_code]);

  return { formik, loading, cepLoading };
};