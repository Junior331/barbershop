/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";

import { schema } from "./schema";

export const useSignin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    validationSchema: schema,
    onSubmit: async () => {
      setLoading(true);
      try {
        await new Promise((resolve, reject) => {
          setTimeout(resolve, 5000);

          setTimeout(() => {
            reject(new Error("Something went wrong."));
          }, 5000);
        });
        navigate("/home");
      } catch (error: any) {
        console.log("Error ::", error);
      } finally {
        setLoading(false);
      }
    },
  });

  return {
    formik,
    loading,
    setLoading,
  };
};
