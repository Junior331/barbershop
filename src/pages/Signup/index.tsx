import { useNavigate } from "react-router-dom";
import { useSignup } from "./useSignup";
import { getImage } from "@/assets/images";
import { getIcons } from "@/assets/icons";
import { Loading } from "@/components/elements";

export const Signup = () => {
  const navigate = useNavigate();
  const {
    formik,
    loading,
    isShowPassword,
    isShowConfirmPassword,
    setIsShowPassword,
    setIsShowConfirmPassword,
  } = useSignup();

  return (
    <div className="flex gap-5 flex-col justify-center items-center p-5 w-full h-full">
      <img width="258" height="258" src={getImage("logo")} alt="Image logo" />
      <form
        onSubmit={formik.handleSubmit}
        className="flex flex-col w-full gap-4"
      >
        <div className="flex flex-col w-full gap-1">
          <label className="text-[#6E6B7B] text-base font-normal leading-[18px]">
            Nome
          </label>
          <input
            type="text"
            name="name"
            onBlur={formik.handleBlur}
            value={formik.values.name}
            placeholder="Digite aqui..."
            onChange={formik.handleChange}
            className="w-full h-[48px] px-[10px]  rounded-[5px] border border-[#D8D6DE]"
          />
          {formik.touched.name && formik.errors.name ? (
            <div className="text-red-500 text-sm">{formik.errors.name}</div>
          ) : null}
        </div>

        <div className="flex flex-col w-full gap-1">
          <label className="text-[#6E6B7B] text-base font-normal leading-[18px]">
            Email
          </label>
          <input
            type="email"
            name="email"
            onBlur={formik.handleBlur}
            value={formik.values.email}
            placeholder="Digite aqui..."
            onChange={formik.handleChange}
            className="w-full h-[48px] px-[10px]  rounded-[5px] border border-[#D8D6DE]"
          />
          {formik.touched.email && formik.errors.email ? (
            <div className="text-red-500 text-sm">{formik.errors.email}</div>
          ) : null}
        </div>

        <div className="flex flex-col w-full gap-1">
          <div className="flex items-center justify-between w-full gap-1">
            <label className="text-[#6E6B7B] text-base font-normal leading-[18px]">
              Senha
            </label>
          </div>
          <div className="flex items-center justify-between w-full h-[48px] px-[10px]  rounded-[5px] border border-[#D8D6DE]">
            <input
              name="password"
              onBlur={formik.handleBlur}
              placeholder="Digite aqui..."
              value={formik.values.password}
              onChange={formik.handleChange}
              type={isShowPassword ? "text" : "password"}
              className="w-full h-full pr-[10px] outline-none"
            />
            <img
              alt="Icon eye"
              onClick={() => setIsShowPassword((prev) => !prev)}
              className="btn bg-transparent border-0 shadow-none size-6 p-0"
              src={getIcons(
                isShowPassword ? "eye_slash_outline" : "eye_outline"
              )}
            />
          </div>
          {formik.touched.password && formik.errors.password ? (
            <div className="text-red-500 text-sm">{formik.errors.password}</div>
          ) : null}
        </div>

        <div className="flex flex-col w-full gap-1">
          <div className="flex items-center justify-between w-full gap-1">
            <label className="text-[#6E6B7B] text-base font-normal leading-[18px]">
              Confirma Senha
            </label>
          </div>
          <div className="flex items-center justify-between w-full h-[48px] px-[10px]  rounded-[5px] border border-[#D8D6DE]">
            <input
              name="confirmPassword"
              onBlur={formik.handleBlur}
              placeholder="Digite aqui..."
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              type={isShowConfirmPassword ? "text" : "password"}
              className="w-full h-full pr-[10px] outline-none"
            />
            <img
              alt="Icon eye"
              onClick={() => setIsShowConfirmPassword((prev) => !prev)}
              className="btn bg-transparent border-0 shadow-none size-6 p-0"
              src={getIcons(
                isShowConfirmPassword ? "eye_slash_outline" : "eye_outline"
              )}
            />
          </div>
          {formik.touched.confirmPassword && formik.errors.confirmPassword ? (
            <div className="text-red-500 text-sm">
              {formik.errors.confirmPassword}
            </div>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`btn max-w-full border-none rounded text-[14px] text-white py-[10px] font-[500] tracking-[0.4px] ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#6C8762]"
          }`}
        >
          {loading ? "Registrando..." : "Registrar"}
        </button>
      </form>

      <div className="flex flex-col items-center w-full gap-4">
        <div className="flex items-center w-full gap-2">
          <div className="flex-1 h-[1px] bg-[#D8D6DE]" />
          <span className="text-[#6E6B7B] text-base">Ou</span>
          <div className="flex-1 h-[1px] bg-[#D8D6DE]" />
        </div>
        <p className="text-[#6E6B7B] text-base">
          Já tem uma conta?{" "}
          <button
            type="button"
            onClick={() => navigate("/signin")}
            className="text-[#7367F0] font-medium hover:underline cursor-pointer"
          >
            iniciar sessão
          </button>
        </p>
      </div>
      {loading && <Loading />}
    </div>
  );
};
