import { useEffect, useRef } from "react";

import { useProfile } from "./useProfile";
import { useAuth } from "@/context/AuthContext";
import { Layout } from "@/components/templates";
import { Header } from "@/components/organisms";
import { Avatar, Loading } from "@/components/elements";
import { maskBirthday, maskPhone, maskZipCode } from "@/utils/utils";

export const Profile = () => {
  const { user } = useAuth();
  const { formik, loading } = useProfile();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // const handleAvatarClick = () => {
  //   fileInputRef.current?.click();
  // };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          formik.setFieldValue("avatar", reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (user) {
      formik.setValues({
        email: user.email || "",
        phone: user.phone || "",
        name: user.user_metadata?.name || "",
        state: user.user_metadata?.state || "",
        avatar: user.user_metadata?.avatar || "",
        address: user.user_metadata?.address || "",
        country: user.user_metadata?.country || "",
        birthday: user.user_metadata?.birthday || "",
        zip_code: user.user_metadata?.zip_code || "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <Layout>
      <div className="flex flex-col justify-start items-center h-full w-full">
        <Header title={"Profile"} backPath={"/account"} />
        <div className="bg-[#f7f8fde8] w-screen h-screen fixed top-[180px]" />

        {loading && <Loading />}
        <div className="flex flex-col h-full w-full p-4 pt-2 gap-2.5 overflow-y-auto z-10">
          <div className="btn w-full h-auto bg-transparent border-0 shadow-none px-0 py-2.5 border-b-2 border-[#EBE9F1]">
            <div className="flex items-center w-full h-full">
              <div
                className="relative cursor-pointer min-w-fit"
                // onClick={handleAvatarClick}
              >
                <Avatar />
                {/* <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-sm">
                  <img
                    alt="Edit icon"
                    src={getIcons("camera")}
                    className="size-4"
                  />
                </div> */}
              </div>

              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
              />

              <div className="flex flex-col justify-start items-start w-full flex-grow pl-2">
                <p className="text-[#5E5873] inter text-2xl font-medium leading-[150%]">
                  {user?.user_metadata.name}
                </p>
                <p className="text-[#5E5873] inter text-base font-light leading-none">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>

          <form
            onSubmit={formik.handleSubmit}
            className="flex flex-col w-full gap-4"
          >
            <div className="flex flex-col w-full gap-1">
              <label className="text-[#6E6B7B] text-base font-normal leading-[18px]">
                Name
              </label>
              <input
                type="text"
                name="name"
                onBlur={formik.handleBlur}
                value={formik.values.name}
                placeholder="Digite aqui..."
                onChange={formik.handleChange}
                className="w-full h-[48px] px-[10px]  rounded-[5px] border border-[#D8D6DE] bg-[#f7f8fde8]"
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
                className="w-full h-[48px] px-[10px]  rounded-[5px] border border-[#D8D6DE] bg-[#f7f8fde8]"
              />
              {formik.touched.email && formik.errors.email ? (
                <div className="text-red-500 text-sm">
                  {formik.errors.email}
                </div>
              ) : null}
            </div>
            <div className="flex flex-col w-full gap-1">
              <label className="text-[#6E6B7B] text-base font-normal leading-[18px]">
                Phone
              </label>
              <input
                type="text"
                name="phone"
                onBlur={formik.handleBlur}
                placeholder="Digite aqui..."
                onChange={formik.handleChange}
                value={maskPhone(formik.values.phone)}
                className="w-full h-[48px] px-[10px]  rounded-[5px] border border-[#D8D6DE] bg-[#f7f8fde8]"
              />
              {formik.touched.phone && formik.errors.phone ? (
                <div className="text-red-500 text-sm">
                  {formik.errors.phone}
                </div>
              ) : null}
            </div>
            <div className="flex flex-col w-full gap-1">
              <label className="text-[#6E6B7B] text-base font-normal leading-[18px]">
                Birthday
              </label>
              <input
                type="text"
                name="birthday"
                onBlur={formik.handleBlur}
                placeholder="Digite aqui..."
                onChange={formik.handleChange}
                value={maskBirthday(formik.values.birthday)}
                className="w-full h-[48px] px-[10px]  rounded-[5px] border border-[#D8D6DE] bg-[#f7f8fde8]"
              />
              {formik.touched.birthday && formik.errors.birthday ? (
                <div className="text-red-500 text-sm">
                  {formik.errors.birthday}
                </div>
              ) : null}
            </div>
            <div className="flex flex-col w-full gap-1">
              <label className="text-[#6E6B7B] text-base font-normal leading-[18px]">
                Zip code
              </label>
              <input
                type="text"
                name="zip_code"
                onBlur={formik.handleBlur}
                placeholder="Digite aqui..."
                onChange={formik.handleChange}
                value={maskZipCode(formik.values.zip_code)}
                className="w-full h-[48px] px-[10px]  rounded-[5px] border border-[#D8D6DE] bg-[#f7f8fde8]"
              />
              {formik.touched.zip_code && formik.errors.zip_code ? (
                <div className="text-red-500 text-sm">
                  {formik.errors.zip_code}
                </div>
              ) : null}
            </div>
            <div className="flex flex-col w-full gap-1">
              <label className="text-[#6E6B7B] text-base font-normal leading-[18px]">
                Address
              </label>
              <input
                type="text"
                name="address"
                onBlur={formik.handleBlur}
                value={formik.values.address}
                placeholder="Digite aqui..."
                onChange={formik.handleChange}
                className="w-full h-[48px] px-[10px]  rounded-[5px] border border-[#D8D6DE] bg-[#f7f8fde8]"
              />
              {formik.touched.address && formik.errors.address ? (
                <div className="text-red-500 text-sm">
                  {formik.errors.address}
                </div>
              ) : null}
            </div>
            <div className="flex flex-col w-full gap-1">
              <label className="text-[#6E6B7B] text-base font-normal leading-[18px]">
                State
              </label>
              <input
                type="text"
                name="state"
                maxLength={2}
                onBlur={formik.handleBlur}
                value={formik.values.state}
                placeholder="Digite aqui..."
                onChange={formik.handleChange}
                className="w-full h-[48px] px-[10px]  rounded-[5px] border border-[#D8D6DE] bg-[#f7f8fde8]"
              />
              {formik.touched.state && formik.errors.state ? (
                <div className="text-red-500 text-sm">
                  {formik.errors.state}
                </div>
              ) : null}
            </div>
            <div className="flex flex-col w-full gap-1">
              <label className="text-[#6E6B7B] text-base font-normal leading-[18px]">
                Country
              </label>
              <input
                type="text"
                name="country"
                onBlur={formik.handleBlur}
                value={formik.values.country}
                placeholder="Digite aqui..."
                onChange={formik.handleChange}
                className="w-full h-[48px] px-[10px]  rounded-[5px] border border-[#D8D6DE] bg-[#f7f8fde8]"
              />
              {formik.touched.country && formik.errors.country ? (
                <div className="text-red-500 text-sm">
                  {formik.errors.country}
                </div>
              ) : null}
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`btn max-w-full border-none rounded text-[14px] text-[#FFF] py-[10px] font-[500] tracking-[0.4px] ${
                loading ? "bg-gray-400" : "bg-[#6C8762]"
              }`}
            >
              {loading ? "Atualizando..." : "Confirmar"}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};
