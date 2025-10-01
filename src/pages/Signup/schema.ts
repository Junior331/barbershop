import * as yup from "yup";

export const schema = yup.object({
  name: yup.string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(50, "Nome deve ter no máximo 50 caracteres")
    .required("Nome é obrigatório"),

  email: yup.string()
    .email("Email inválido")
    .required("Email é obrigatório"),

  password: yup.string()
    .required("Senha é obrigatória")
    .min(6, "A senha deve ter no mínimo 6 caracteres")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/,
      "A senha deve conter pelo menos 1 letra maiúscula, 1 letra minúscula e 1 número"
    ),

  confirmPassword: yup.string()
    .required("Confirme sua senha")
    .oneOf([yup.ref('password')], 'As senhas não coincidem'),

  phone: yup.string()
    .optional()
    .matches(
      /^(\(\d{2}\)\s?)?\d{4,5}-?\d{4}$/,
      "Telefone deve estar no formato (11) 99999-9999"
    ),

  acceptTerms: yup.boolean()
    .oneOf([true], "Você deve aceitar os termos de uso")
});
