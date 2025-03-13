import * as yup from "yup";

export const schema = yup.object({
  email: yup.string().email("Email inválido").required("Campo obrigatório"),
  password: yup.string()
    .required("Campo obrigatório")
    .min(5, "A senha deve ter no mínimo 5 caracteres")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{5,}$/,
      "A senha deve conter pelo menos 1 caractere especial, 1 letra maiúscula, 1 letra minúscula e 1 número"
    ),
});
