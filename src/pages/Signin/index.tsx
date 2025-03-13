import { getIcons } from "@/assets/icons";
import { getImage } from "@/assets/images";
import { useSignin } from "./useSignin";
import { Loading } from "@/components/elements";

export const Signin = () => {
    const { formik, loading } = useSignin()

    return (
        <div className="flex gap-5 flex-col justify-center items-center p-5 w-full h-full">
            <img src={getImage("logo")} alt="Image logo" />

            <form onSubmit={formik.handleSubmit} className="flex flex-col w-full gap-4">
                <div className="flex flex-col w-full gap-1">
                    <label className="text-[#6E6B7B] text-base font-normal leading-[18px]">
                        Email
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="w-full h-[48px] px-[10px] flex-shrink-0 rounded-[5px] border border-[#D8D6DE]"
                        placeholder="Digite aqui..."
                    />
                    {formik.touched.email && formik.errors.email ? (
                        <div className="text-red-500 text-sm">{formik.errors.email}</div>
                    ) : null}
                </div>

                <div className="flex flex-col w-full gap-1">
                    <div className="flex items-center justify-between w-full gap-1">
                        <label className="text-[#6E6B7B] text-base font-normal leading-[18px]">
                            Password
                        </label>
                        <button
                            type="button"
                            className="btn btn-link border-none no-underline text-[#7367f0]"
                        >
                            Forgot Password?
                        </button>
                    </div>
                    <input
                        type="password"
                        name="password"
                        onBlur={formik.handleBlur}
                        placeholder="Digite aqui..."
                        value={formik.values.password}
                        onChange={formik.handleChange}
                        className="w-full h-[48px] px-[10px] flex-shrink-0 rounded-[5px] border border-[#D8D6DE]"
                    />
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
                    className="btn max-w-full border-none bg-[#6B7280] rounded text-[14px] text-[#FFF] py-[10px] font-[500] tracking-[0.4px]"
                >
                    Login
                </button>
            </form>

            <div className="flex flex-col items-center w-full gap-4">
                <div className="flex items-center w-full gap-2">
                    <div className="flex-1 h-[1px] bg-[#D8D6DE]" />
                    <span className="text-[#6E6B7B] text-base">or</span>
                    <div className="flex-1 h-[1px] bg-[#D8D6DE]" />
                </div>
                <p className="text-[#6E6B7B] text-base">
                    New on our platform?{" "}
                    <button
                        type="button"
                        className="text-[#7367F0] font-medium hover:underline"
                    >
                        Create an account
                    </button>
                </p>
            </div>

            <div className="flex gap-4 justify-center">
                <div
                    className="btn flex size-20 p-4 justify-center items-center gap-4 flex-shrink-0 rounded-full border border-[rgba(227,227,227,0.8)] bg-white shadow-sm"
                >
                    <img src={getIcons("social_facebook")} alt="Facebook" />
                </div>
                <div
                    className="btn flex size-20 p-4 justify-center items-center gap-4 flex-shrink-0 rounded-full border border-[rgba(227,227,227,0.8)] bg-white shadow-sm"
                >
                    <img src={getIcons("social_google")} alt="Google" />
                </div>
                <div
                    className="btn flex size-20 p-4 justify-center items-center gap-4 flex-shrink-0 rounded-full border border-[rgba(227,227,227,0.8)] bg-white shadow-sm"
                >
                    <img src={getIcons("social_apple")} alt="Apple" />
                </div>
            </div>
            {
                loading &&
                <Loading />
            }
        </div>
    );
};