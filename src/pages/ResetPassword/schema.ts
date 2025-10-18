import * as yup from "yup";

export const schema = yup.object({
  email: yup.string().email("Email inválido").required("Campo obrigatório"),
  newPassword: yup.string()
    .required("Campo obrigatório")
    .min(8, "A senha deve ter no mínimo 8 caracteres")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "A senha deve conter pelo menos 1 maiúscula, 1 minúscula, 1 número e 1 caractere especial"
    ),
  confirmPassword: yup.string()
    .required("Campo obrigatório")
    .oneOf([yup.ref("newPassword")], "As senhas não coincidem"),
});
