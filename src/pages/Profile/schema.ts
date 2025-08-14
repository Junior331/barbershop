import * as yup from "yup";

export const schema = yup.object({
  avatarUrl: yup.string().optional(),
  name: yup.string().required("Campo obrigatório"),
  email: yup.string().email("Email inválido").required("Campo obrigatório"),
  phone: yup
    .string()
    .required("Campo obrigatório")
    .matches(/\(\d{2}\) \d{5}-\d{4}/, "Formato inválido (XX) XXXXX-XXXX"),
  birth_date: yup.string().required("Campo obrigatório"),
  postal_code: yup
    .string()
    .required("Campo obrigatório")
    .matches(/^\d{5}-\d{3}$/, "Formato inválido XXXXX-XXX"),
  street: yup.string().required("Campo obrigatório"),
  state: yup.string().required("Campo obrigatório"),
  country: yup.string().required("Campo obrigatório"),
});
