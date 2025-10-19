import { useState } from "react";
import { Link } from "react-router-dom";

import { useResetPassword } from "./useResetPassword";
import { getIcons } from "@/assets/icons";
import { getImage } from "@/assets/images";
import { Loading } from "@/components/elements";

export const ResetPassword = () => {
  const { formik, loading, error } = useResetPassword();
  const [isShowPassword, setIsShowPassword] = useState(false);
  const [isShowConfirmPassword, setIsShowConfirmPassword] = useState(false);

  return (
    <div className="flex gap-5 flex-col justify-center items-center p-5 w-full h-full">
      <img width="258" height="258" src={getImage("logo")} alt="Image logo" />

      <h1 className="text-2xl font-bold text-[#5E5873] mb-2">
        Resetar Senha
      </h1>
      <p className="text-[#6E6B7B] text-center mb-4">
        Digite seu email e a nova senha
      </p>

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      <form
        onSubmit={formik.handleSubmit}
        className="flex flex-col w-full gap-4"
      >
        <div className="flex flex-col w-full gap-1">
          <label className="text-[#6E6B7B] text-base font-normal leading-[18px]">
            Email
          </label>
          <input
            type="email"
            name="email"
            onBlur={formik.handleBlur}
            value={formik.values.email}
            placeholder="Digite seu email..."
            onChange={formik.handleChange}
            className="w-full h-[48px] px-[10px] rounded-[5px] border border-[#D8D6DE]"
          />
          {formik.touched.email && formik.errors.email ? (
            <div className="text-red-500 text-sm">{formik.errors.email}</div>
          ) : null}
        </div>

        <div className="flex flex-col w-full gap-1">
          <label className="text-[#6E6B7B] text-base font-normal leading-[18px]">
            Nova Senha
          </label>
          <div className="flex items-center justify-between w-full h-[48px] px-[10px] rounded-[5px] border border-[#D8D6DE]">
            <input
              name="newPassword"
              onBlur={formik.handleBlur}
              placeholder="Digite a nova senha..."
              value={formik.values.newPassword}
              onChange={formik.handleChange}
              type={isShowPassword ? "text" : "password"}
              className="w-full h-full pr-[10px] outline-none"
            />
            <img
              alt="Icon eye"
              onClick={() => setIsShowPassword((prev) => !prev)}
              className="btn bg-transparent border-0 shadow-none size-6 p-0 cursor-pointer"
              src={getIcons(
                isShowPassword ? "eye_slash_outline" : "eye_outline"
              )}
            />
          </div>
          {formik.touched.newPassword && formik.errors.newPassword ? (
            <div className="text-red-500 text-sm">{formik.errors.newPassword}</div>
          ) : null}
        </div>

        <div className="flex flex-col w-full gap-1">
          <label className="text-[#6E6B7B] text-base font-normal leading-[18px]">
            Confirmar Nova Senha
          </label>
          <div className="flex items-center justify-between w-full h-[48px] px-[10px] rounded-[5px] border border-[#D8D6DE]">
            <input
              name="confirmPassword"
              onBlur={formik.handleBlur}
              placeholder="Confirme a nova senha..."
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              type={isShowConfirmPassword ? "text" : "password"}
              className="w-full h-full pr-[10px] outline-none"
            />
            <img
              alt="Icon eye"
              onClick={() => setIsShowConfirmPassword((prev) => !prev)}
              className="btn bg-transparent border-0 shadow-none size-6 p-0 cursor-pointer"
              src={getIcons(
                isShowConfirmPassword ? "eye_slash_outline" : "eye_outline"
              )}
            />
          </div>
          {formik.touched.confirmPassword && formik.errors.confirmPassword ? (
            <div className="text-red-500 text-sm">{formik.errors.confirmPassword}</div>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn max-w-full border-none bg-[#6C8762] rounded text-[14px] text-[#FFF] py-[10px] font-[500] tracking-[0.4px]"
        >
          {loading ? <>Resetando...</> : "Resetar Senha"}
        </button>

        <Link
          to="/signin"
          className="text-center text-[#7367f0] text-sm hover:underline"
        >
          Voltar para Login
        </Link>
      </form>
      {loading && <Loading />}
    </div>
  );
};
