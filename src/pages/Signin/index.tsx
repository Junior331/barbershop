import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useSignin } from "./useSignin";
import { getIcons } from "@/assets/icons";
import { getImage } from "@/assets/images";
import { Loading } from "@/components/elements";
import { useGoogleSignin } from "@/hooks/useGoogleSignin";

export const Signin = () => {
  const navigate = useNavigate();
  const { formik, loading: emailLoading } = useSignin();
  const [isShowPassword, setIsShowPassword] = useState(false);
  const { signInWithGoogle, loading: googleLoading } = useGoogleSignin();
  
  const loading = emailLoading || googleLoading;
  
  return (
    <div className="flex gap-5 flex-col justify-center items-center p-5 w-full h-full">
      <img width="258" height="258" src={getImage("logo")} alt="Image logo" />

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
            <button
              type="button"
              className="btn btn-link border-none no-underline text-[#7367f0]"
            >
              Recuperação de senha?
            </button>
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

        <label className="flex fieldset-label items-center text-[#6E6B7B] text-base font-normal">
          <input
            type="checkbox"
            name="rememberMe"
            onChange={formik.handleChange}
            checked={formik.values.rememberMe}
            className="checkbox custom_before w-4 h-4 border border-[#6E6B7B] rounded p-[3px]"
          />
          Remember me
        </label>

        <button
          type="submit"
          disabled={loading}
          className="btn max-w-full border-none bg-[#6C8762] rounded text-[14px] text-[#FFF] py-[10px] font-[500] tracking-[0.4px]"
        >
          {loading ? <>Entrando...</> : "Entrar"}
        </button>
      </form>

      <div className="mt-8 w-full">
        <div className="flex items-center w-full gap-2">
          <div className="flex-1 h-[1px] bg-[#D8D6DE]" />
          <span className="text-[#6E6B7B] text-base">Ou</span>
          <div className="flex-1 h-[1px] bg-[#D8D6DE]" />
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={signInWithGoogle}
            className="cursor-pointer w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <img
              src={getIcons("social_google")}
              alt="Google"
              className="h-5 w-5"
            />
          </button>
          <button
            disabled
            type="button"
            className="opacity-50 contrast-75 cursor-not-allowed w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <img
              src={getIcons("social_facebook")}
              alt="Facebook"
              className="h-5 w-5"
            />
          </button>
          <button
            disabled
            type="button"
            className="opacity-50 contrast-75 cursor-not-allowed w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <img
              src={getIcons("social_apple")}
              alt="Apple"
              className="h-5 w-5"
            />
          </button>
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-gray-600">
          Novo na nossa plataforma?{" "}
          <button
            onClick={() => navigate("/signup")}
            className="font-medium text-[#7367f0] "
          >
            Criar uma conta
          </button>
        </p>
      </div>
      {loading && <Loading />}
    </div>
  );
};
